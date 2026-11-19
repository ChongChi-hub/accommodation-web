import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, __resetEmailRateLimitForTests } from './route';

function makeRequest(body: Record<string, unknown>, opts?: { origin?: string; cookie?: string; ip?: string }) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    host: 'localhost:3000',
  };
  if (opts?.origin) headers['origin'] = opts.origin;
  if (opts?.cookie) headers['cookie'] = opts.cookie;
  if (opts?.ip) headers['x-forwarded-for'] = opts.ip;
  return new NextRequest('http://localhost:3000/api/email/send', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('/api/email/send security & OTP flows (mocked fetch, zero network)', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    __resetEmailRateLimitForTests();
    process.env.EMAILJS_ACC1_SERVICE_ID = 'svc_test_1';
    process.env.EMAILJS_ACC1_PUBLIC_KEY = 'pub_test_1';
    process.env.EMAILJS_ACC1_PRIVATE_KEY = 'priv_test_1';
    process.env.EMAILJS_TEMPLATE_REGISTER = 'tpl_reg';
    process.env.EMAILJS_TEMPLATE_VERIFY_EMAIL = 'tpl_ver';
    process.env.EMAILJS_ACC2_SERVICE_ID = 'svc_test_2';
    process.env.EMAILJS_ACC2_PUBLIC_KEY = 'pub_test_2';
    process.env.EMAILJS_ACC2_PRIVATE_KEY = 'priv_test_2';
    process.env.EMAILJS_TEMPLATE_CHANGE_PASSWORD = 'tpl_pwd';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
  });

  afterEach(() => {
    process.env = { ...origEnv };
    vi.unstubAllGlobals();
  });

  it('rejects untrusted Origin with 403', async () => {
    const req = makeRequest(
      { action: 'REGISTER', toEmail: 'a@test.com', otpCode: '123456' },
      { origin: 'https://evil.example.com' },
    );
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('rejects unknown action with 400', async () => {
    const req = makeRequest({ action: 'ARBITRARY_SPAM', toEmail: 'a@test.com', otpCode: '123456' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('allows REGISTER OTP with valid 6-digit code and rate-limits after 3 sends', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await POST(
        makeRequest({ action: 'REGISTER', toName: 'An', toEmail: 'reg@test.com', otpCode: '654321' }, { ip: '10.0.0.1' }),
      );
      expect(res.status).toBe(200);
    }
    const blocked = await POST(
      makeRequest({ action: 'REGISTER', toName: 'An', toEmail: 'reg@test.com', otpCode: '654321' }, { ip: '10.0.0.1' }),
    );
    expect(blocked.status).toBe(429);
  });

  it('requires session cookie for VERIFY_EMAIL and CHANGE_PASSWORD (401 without, 200 with)', async () => {
    const unauth = await POST(makeRequest({ action: 'VERIFY_EMAIL', toEmail: 'u@test.com', otpCode: '111222' }));
    expect(unauth.status).toBe(401);

    const authVer = await POST(
      makeRequest(
        { action: 'VERIFY_EMAIL', toEmail: 'u@test.com', otpCode: '111222' },
        { cookie: 'cozynest_token=fake-jwt-for-unit-test', ip: '10.0.0.2' },
      ),
    );
    expect(authVer.status).toBe(200);

    const authPwd = await POST(
      makeRequest(
        { action: 'CHANGE_PASSWORD', toEmail: 'u@test.com', otpCode: '333444' },
        { cookie: 'cozynest_token=fake-jwt-for-unit-test', ip: '10.0.0.2' },
      ),
    );
    expect(authPwd.status).toBe(200);
  });

  it('returns 503 when server EmailJS env vars are missing', async () => {
    delete process.env.EMAILJS_ACC1_PRIVATE_KEY;
    const res = await POST(makeRequest({ action: 'REGISTER', toEmail: 'm@test.com', otpCode: '123456' }, { ip: '10.0.0.3' }));
    expect(res.status).toBe(503);
  });
});
