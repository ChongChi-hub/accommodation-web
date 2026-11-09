import { test, expect } from '@playwright/test';

const WEB_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8080/api/v1';
const MAILPIT_URL = 'http://localhost:8025/api/v1';

async function fetchOtpFromMailpit(email: string, sinceMs: number): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${MAILPIT_URL}/messages`);
    const data = await res.json();
    const msgs = Array.isArray(data.messages) ? data.messages : [];
    const match = msgs.find(
      (m: any) =>
        m.To?.some((t: any) => t.Address?.toLowerCase() === email.toLowerCase()) &&
        new Date(m.Created).getTime() >= sinceMs - 5000
    );
    if (match) {
      const detailRes = await fetch(`${MAILPIT_URL}/message/${match.ID}`);
      const detail = await detailRes.json();
      const body = detail.Text || detail.HTML || detail.Snippet || '';
      const otpMatch = body.match(/\b(\d{6})\b/);
      if (otpMatch) return otpMatch[1];
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for OTP email to ${email} in Mailpit`);
}

function uniquePhone(): string {
  const rand = Math.floor(1000000 + Math.random() * 8999999);
  return `098${rand}`;
}

test.describe('[AUTH-UI] Full-Stack Real Backend + Mailpit E2E Suite', () => {
  test('Cache-Control no-store enforced on all auth routes & zero demo block', async ({ request, page }) => {
    for (const p of ['/vi/login', '/vi/register', '/vi/forgot-password', '/vi/reset-password', '/vi/verify-email']) {
      const res = await request.get(`${WEB_URL}${p}`);
      expect(res.status()).toBe(200);
      const cc = res.headers()['cache-control'] || '';
      expect(cc.toLowerCase()).toContain('no-store');
    }

    await page.goto(`${WEB_URL}/vi/login`, { waitUntil: 'networkidle' });
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/password123|Đăng nhập nhanh/i);
  });

  test('Validation, typo suggestion, 72-byte boundary, real TENANT register & phone login', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });
    page.on('pageerror', (e) => consoleErrors.push(e.message));

    await page.route('https://accounts.google.com/gsi/client', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: 'window.google={accounts:{id:{initialize:()=>{},renderButton:(el)=>{el.innerHTML="<button type=button>Google</button>";},prompt:()=>{},cancel:()=>{}}}};',
      })
    );

    await page.goto(`${WEB_URL}/vi/register`, { waitUntil: 'networkidle' });

    // Submit empty -> focuses first invalid field & blocks API
    await page.click('button[type="submit"]');
    await expect(page.locator('#register-fullname')).toHaveAttribute('aria-invalid', 'true');

    // Check email typo suggestion pill & one-click fix
    await page.fill('#register-email', 'cuongtest@gmial.com');
    await page.locator('#register-email').blur();
    const fixBtn = page.getByRole('button', { name: /Dùng địa chỉ này/i });
    await expect(fixBtn).toBeVisible();
    await fixBtn.click();
    await expect(page.locator('#register-email')).toHaveValue('cuongtest@gmail.com');

    // Check 73-byte Vietnamese diacritics rejection vs 72-byte boundary pass
    const vi73 = 'TổẤmNhàĐẹpTổẤmNhàĐẹpTổẤmNhàĐẹpViệtNamxxxxxxxxxx'; // 73 UTF-8 bytes
    expect(Buffer.byteLength(vi73, 'utf8')).toBe(73);
    await page.fill('#register-password', vi73);
    await page.locator('#register-password').blur();
    await expect(page.locator('body')).toContainText(/73\/72/);
    await expect(page.locator('#register-password')).toHaveAttribute('aria-invalid', 'true');

    const vi72 = vi73.slice(0, -1); // 72 UTF-8 bytes
    expect(Buffer.byteLength(vi72, 'utf8')).toBe(72);
    await page.fill('#register-password', vi72);
    await page.locator('#register-password').blur();
    await expect(page.locator('body')).toContainText(/72\/72/);
    await expect(page.locator('#register-password')).toHaveAttribute('aria-invalid', 'false');

    // Real Tenant Registration + Phone Login
    const ts = Date.now();
    const email = `e2e_ui_tenant_${ts}@cozynest.vn`;
    const phone = uniquePhone();
    const password = 'CozyStrong@2026';

    await page.fill('#register-fullname', 'Nguyễn   Thanh   Cường');
    await page.locator('#register-fullname').blur();
    await expect(page.locator('#register-fullname')).toHaveValue('Nguyễn Thanh Cường');

    await page.fill('#register-email', email);
    await page.fill('#register-phone', phone);
    await page.fill('#register-password', password);
    await page.fill('#register-confirm-password', password);
    await expect(page.locator('body')).toContainText(/Mật khẩu xác nhận đã khớp/i);
    await page.check('#register-terms');

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/tenant/, { timeout: 15000 });

    // Clear session & test login by PHONE number on /vi/login
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${WEB_URL}/vi/login`, { waitUntil: 'networkidle' });

    await page.fill('#login-identifier', phone);
    await page.fill('#login-password', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/tenant/, { timeout: 15000 });
    expect(consoleErrors).toEqual([]);

    // Verify wrong credentials never leak account existence
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${WEB_URL}/vi/login`, { waitUntil: 'networkidle' });

    await page.fill('#login-identifier', email);
    await page.fill('#login-password', 'WrongPass@999');
    await page.click('button[type="submit"]');
    const alertBox = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    await expect(alertBox).toContainText(/Email, số điện thoại hoặc mật khẩu không chính xác/i);
    const existingErr = await alertBox.innerText();

    await page.fill('#login-identifier', `nonexistent_${ts}@cozynest.vn`);
    await page.fill('#login-password', 'WrongPass@999');
    await page.click('button[type="submit"]');
    await expect(alertBox).toHaveText(existingErr);
  });

  test('Full 2-step Forgot Password flow via real Mailpit OTP, no URL email param, old password check', async ({ page }) => {
    const ts = Date.now();
    const email = `e2e_ui_forgot_${ts}@cozynest.vn`;
    const oldPwd = 'CozyOldPass@2026';
    const newPwd = 'CozyNewPass@2026!';

    // Seed clean user via real register endpoint
    const regRes = await page.request.post(`${API_URL}/auth/register`, {
      data: {
        email,
        phone: uniquePhone(),
        password: oldPwd,
        fullName: 'Người Dùng Khôi Phục',
        role: 'TENANT',
      },
    });
    expect(regRes.status()).toBe(201);

    await page.goto(`${WEB_URL}/vi/forgot-password`, { waitUntil: 'networkidle' });
    const startTs = Date.now();
    await page.fill('#forgot-email', email);
    await page.click('button[type="submit"]');

    // Step 2 appears cleanly WITHOUT redirecting or putting ?email= in URL
    await expect(page.locator('input[name="otp"]')).toBeVisible({ timeout: 10000 });
    expect(page.url()).not.toContain('email=');
    expect(page.url()).toContain('/forgot-password');

    // Fetch real 6-digit OTP from Mailpit
    const realOtp = await fetchOtpFromMailpit(email, startTs);

    // Wrong OTP triggers error summary & OTP error
    const alertBox = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    await page.fill('input[name="otp"]', '000000');
    await page.fill('#forgot-new-password', newPwd);
    await page.fill('#forgot-confirm-password', newPwd);
    await page.click('button[type="submit"]');
    await expect(alertBox).toContainText(/không chính xác/i, { timeout: 10000 });

    // Real OTP + old password reuse rejected by backend
    await page.fill('input[name="otp"]', realOtp);
    await page.fill('#forgot-new-password', oldPwd);
    await page.fill('#forgot-confirm-password', oldPwd);
    await page.click('button[type="submit"]');
    await expect(alertBox).toContainText(/không được trùng/i, { timeout: 10000 });

    // Real OTP + brand new strong password succeeds -> /login
    await page.fill('input[name="otp"]', realOtp);
    await page.fill('#forgot-new-password', newPwd);
    await page.fill('#forgot-confirm-password', newPwd);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/login/, { timeout: 15000 });

    // Old password rejected, new password succeeds
    await page.fill('#login-identifier', email);
    await page.fill('#login-password', oldPwd);
    await page.click('button[type="submit"]');
    await expect(alertBox).toContainText(/không chính xác/i);

    await page.fill('#login-password', newPwd);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/tenant/, { timeout: 15000 });
  });

  test('Forgot Password 429 rate-limit honors Retry-After header countdown in UI', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi/forgot-password`, { waitUntil: 'networkidle' });

    await page.route('**/api/v1/auth/forgot-password', async (route, req) => {
      // Simulate 5th consecutive call hitting backend 429 with Retry-After: 42
      await route.fulfill({
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '42',
        },
        body: JSON.stringify({
          success: false,
          errorCode: 'ERR_RATE_LIMIT_EXCEEDED',
          message: 'Quá nhiều yêu cầu',
        }),
      });
    });

    await page.fill('#forgot-email', 'ratelimit@cozynest.vn');
    await page.click('button[type="submit"]');

    const alertBox = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    await expect(alertBox).toContainText(/42|41/);
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('Forgot Password 503 shows service unavailable alert and retry button', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi/forgot-password`, { waitUntil: 'networkidle' });

    await page.route('**/api/v1/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          errorCode: 'ERR_EMAIL_SERVICE_UNAVAILABLE',
          message: 'Dịch vụ email tạm thời gián đoạn',
        }),
      });
    });

    await page.fill('#forgot-email', 'outage@cozynest.vn');
    await page.click('button[type="submit"]');

    const alertBox = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    await expect(alertBox).toContainText(/không khả dụng|tạm thời|gián đoạn|Thử lại/i);
  });

  test('Google Auth rejects forged unsigned ID token on backend & register passes Landlord intendedRole', async ({ page }) => {
    // 1. Real backend rejects forged ID token
    const nonceRes = await page.request.get(`${API_URL}/auth/google/nonce`);
    expect(nonceRes.status()).toBe(200);
    const { data: nonceData } = await nonceRes.json();

    const forgedRes = await page.request.post(`${API_URL}/auth/google`, {
      data: {
        credential: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJmYWtlIn0.',
        nonce: nonceData.nonce,
        intendedRole: 'LANDLORD',
      },
    });
    expect(forgedRes.status()).toBeGreaterThanOrEqual(400);

    // 2. Simulated GIS callback from /vi/register after clicking Landlord RoleCard sends intendedRole=LANDLORD
    let capturedGooglePayload: any = null;
    await page.route('https://accounts.google.com/gsi/client', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.__gisCb = null;
          window.google = {
            accounts: {
              id: {
                initialize: (cfg) => { window.__gisCb = cfg.callback; },
                renderButton: (el) => {
                  const b = document.createElement('button');
                  b.type = 'button';
                  b.id = 'sim-gis-btn';
                  b.textContent = 'Simulated GIS';
                  b.onclick = () => window.__gisCb && window.__gisCb({ credential: 'sim-gis-id-token' });
                  el.appendChild(b);
                },
                prompt: () => {},
                cancel: () => {}
              }
            }
          };
        `,
      })
    );

    await page.route('**/api/v1/auth/google/status*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'OK',
          data: { enabled: true, clientIdFingerprint: 'e2e-mock-fp' },
        }),
      });
    });

    await page.route('**/api/v1/auth/google/nonce*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'OK',
          data: { nonce: 'e2e-sim-nonce' },
        }),
      });
    });

    await page.route('**/api/v1/auth/google', async (route) => {
      capturedGooglePayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'OK',
          data: {
            token: 'mock-jwt',
            refreshToken: 'mock-rt',
            isNewUser: true,
            user: {
              id: 'u-sim-1',
              email: 'sim@cozynest.vn',
              fullName: 'Sim User',
              roles: ['TENANT'],
            },
          },
        }),
      });
    });

    await page.goto(`${WEB_URL}/vi/register`, { waitUntil: 'networkidle' });
    await page.locator('[role="radio"]').nth(1).click(); // Switch to LANDLORD
    await expect(page.locator('body')).toContainText(/eKYC/i);
    await page.click('#sim-gis-btn');

    await expect.poll(() => capturedGooglePayload?.intendedRole).toBe('LANDLORD');
    expect(capturedGooglePayload.credential).toBe('sim-gis-id-token');
  });
});
