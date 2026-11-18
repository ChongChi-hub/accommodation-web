import { NextRequest, NextResponse } from 'next/server';

const EMAILJS_CONFIG = {
  ACC1: {
    SERVICE_ID: 'service_cozynest',
    PUBLIC_KEY: 'Re_5YClSOUJvPTVQF',
    PRIVATE_KEY: 'qNyRWL93ZyFJgqNcgbMQ9',
    TEMPLATES: {
      REGISTER: 'template_91vlzrx',
      VERIFY_EMAIL: 'template_59nc5mf',
    },
  },
  ACC2: {
    SERVICE_ID: 'service_pp9ykfq',
    PUBLIC_KEY: 'mhVhUeI-C6HkEfVNy',
    PRIVATE_KEY: 'lhAfrXJWJpwyWGhFxSHnY',
    TEMPLATES: {
      CHANGE_PASSWORD: 'template_30c269c',
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, toName, toEmail, otpCode, expiryMinutes } = body;

    if (!toEmail || !otpCode) {
      return NextResponse.json({ success: false, error: 'Thiếu email hoặc mã OTP' }, { status: 400 });
    }

    let serviceId = EMAILJS_CONFIG.ACC1.SERVICE_ID;
    let templateId = EMAILJS_CONFIG.ACC1.TEMPLATES.REGISTER;
    let publicKey = EMAILJS_CONFIG.ACC1.PUBLIC_KEY;
    let privateKey = EMAILJS_CONFIG.ACC1.PRIVATE_KEY;

    if (action === 'VERIFY_EMAIL') {
      templateId = EMAILJS_CONFIG.ACC1.TEMPLATES.VERIFY_EMAIL;
    } else if (action === 'CHANGE_PASSWORD') {
      serviceId = EMAILJS_CONFIG.ACC2.SERVICE_ID;
      templateId = EMAILJS_CONFIG.ACC2.TEMPLATES.CHANGE_PASSWORD;
      publicKey = EMAILJS_CONFIG.ACC2.PUBLIC_KEY;
      privateKey = EMAILJS_CONFIG.ACC2.PRIVATE_KEY;
    }

    const emailJsPayload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        to_name: toName || 'Quý khách',
        to_email: toEmail,
        otp_code: otpCode,
        expiry_minutes: String(expiryMinutes || 10),
      },
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify(emailJsPayload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Lỗi kết nối EmailJS');
      return NextResponse.json({ success: false, error: errText }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống gửi email';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
