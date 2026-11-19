import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ACTIONS = new Set(['REGISTER', 'VERIFY_EMAIL', 'CHANGE_PASSWORD']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;

const WINDOW_MS = 60 * 1000;
const MAX_PER_IP = 20;
const MAX_PER_RECIPIENT = 3;

const ipHits = new Map<string, number[]>();
const recipientHits = new Map<string, number[]>();

export function __resetEmailRateLimitForTests() {
  ipHits.clear();
  recipientHits.clear();
}

function isRateLimited(store: Map<string, number[]>, key: string, max: number): boolean {
  const now = Date.now();
  const recent = (store.get(key) || []).filter((ts) => now - ts < WINDOW_MS);
  return recent.length >= max;
}

function checkRecipientLimit(key: string, max: number): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (recipientHits.get(key) || []).filter((ts) => now - ts < WINDOW_MS);
  if (recent.length >= max) {
    const oldest = recent[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    return { limited: true, retryAfter };
  }
  return { limited: false, retryAfter: 0 };
}

function recordHit(store: Map<string, number[]>, key: string): void {
  const now = Date.now();
  const recent = (store.get(key) || []).filter((ts) => now - ts < WINDOW_MS);
  recent.push(now);
  store.set(key, recent);
}

function isOriginAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  const host = req.headers.get('host') || 'localhost:3000';
  const configured = process.env.NEXT_PUBLIC_APP_URL || '';
  const allowed = new Set([
    `http://${host}`,
    `https://${host}`,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);
  if (configured) {
    try {
      allowed.add(new URL(configured).origin);
    } catch {
      // ignore invalid URL
    }
  }
  return allowed.has(origin);
}

function resolveAccountConfig(action: string) {
  if (action === 'CHANGE_PASSWORD') {
    return {
      serviceId: process.env.EMAILJS_ACC2_SERVICE_ID || '',
      templateId: process.env.EMAILJS_TEMPLATE_CHANGE_PASSWORD || '',
      publicKey: process.env.EMAILJS_ACC2_PUBLIC_KEY || '',
      privateKey: process.env.EMAILJS_ACC2_PRIVATE_KEY || '',
    };
  }
  return {
    serviceId: process.env.EMAILJS_ACC1_SERVICE_ID || '',
    templateId:
      action === 'VERIFY_EMAIL'
        ? process.env.EMAILJS_TEMPLATE_VERIFY_EMAIL || ''
        : process.env.EMAILJS_TEMPLATE_REGISTER || '',
    publicKey: process.env.EMAILJS_ACC1_PUBLIC_KEY || '',
    privateKey: process.env.EMAILJS_ACC1_PRIVATE_KEY || '',
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!isOriginAllowed(req)) {
      return NextResponse.json({ success: false, error: 'Nguồn yêu cầu không được phép' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Dữ liệu yêu cầu không hợp lệ' }, { status: 400 });
    }

    const { action, toName, toEmail, otpCode, expiryMinutes } = body as Record<string, unknown>;
    const actionStr = typeof action === 'string' ? action.trim().toUpperCase() : '';
    const emailStr = typeof toEmail === 'string' ? toEmail.trim().toLowerCase() : '';
    const otpStr = typeof otpCode === 'string' ? otpCode.trim() : '';

    if (!ALLOWED_ACTIONS.has(actionStr)) {
      return NextResponse.json({ success: false, error: 'Loại thao tác email không hợp lệ' }, { status: 400 });
    }
    if (!EMAIL_RE.test(emailStr) || !OTP_RE.test(otpStr)) {
      return NextResponse.json({ success: false, error: 'Email hoặc mã OTP 6 chữ số không hợp lệ' }, { status: 400 });
    }

    // Authenticated-only actions must carry HttpOnly session cookie
    if (actionStr === 'VERIFY_EMAIL' || actionStr === 'CHANGE_PASSWORD') {
      const token = req.cookies.get('cozynest_token')?.value;
      if (!token) {
        return NextResponse.json({ success: false, error: 'Yêu cầu đăng nhập để gửi mã xác thực' }, { status: 401 });
      }
    }

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'local';

    if (isRateLimited(ipHits, clientIp, MAX_PER_IP)) {
      return NextResponse.json({ success: false, error: 'Quá nhiều yêu cầu gửi email từ thiết bị này' }, { status: 429 });
    }
    const recipientCheck = checkRecipientLimit(`${actionStr}:${emailStr}`, MAX_PER_RECIPIENT);
    if (recipientCheck.limited) {
      return NextResponse.json(
        { success: false, error: `Vui lòng chờ ${recipientCheck.retryAfter} giây trước khi yêu cầu gửi lại mã` },
        { status: 429 },
      );
    }

    const cfg = resolveAccountConfig(actionStr);
    if (!cfg.serviceId || !cfg.templateId || !cfg.publicKey || !cfg.privateKey) {
      return NextResponse.json(
        { success: false, error: 'Dịch vụ gửi email chưa được cấu hình đầy đủ trên máy chủ' },
        { status: 503 },
      );
    }

    const emailJsPayload = {
      service_id: cfg.serviceId,
      template_id: cfg.templateId,
      user_id: cfg.publicKey,
      accessToken: cfg.privateKey,
      template_params: {
        to_name: typeof toName === 'string' && toName.trim() ? toName.trim().slice(0, 120) : 'Quý khách',
        to_email: emailStr,
        otp_code: otpStr,
        expiry_minutes: String(typeof expiryMinutes === 'number' && expiryMinutes > 0 ? expiryMinutes : 10),
      },
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Cozynest/1.0',
      },
      body: JSON.stringify(emailJsPayload),
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Không thể gửi email qua nhà cung cấp' }, { status: 502 });
    }

    recordHit(ipHits, clientIp);
    recordHit(recipientHits, `${actionStr}:${emailStr}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi hệ thống gửi email' }, { status: 500 });
  }
}
