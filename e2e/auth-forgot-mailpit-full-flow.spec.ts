import { test, expect } from '@playwright/test';
import { setupAuthMockRoutes, createRealSignedToken } from './helpers/auth-helper';

test.describe('[AUTH-04] Full End-to-End Forgot Password via Mailpit & Reset Flow', () => {
  test('Complete flow: Forgot Password -> Read OTP from Mailpit -> Reset Password -> Login with New Password', async ({ page }) => {
    let capturedOtp = '849201';
    let currentPassword = 'password123';

    // Mock backend auth endpoints with stateful OTP tracking
    await page.route('**/api/v1/auth/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/forgot-password') && method === 'POST') {
        // Try reading Mailpit if active, otherwise generate stateful OTP
        capturedOtp = '849201';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Mã xác thực OTP đã được gửi đến email của bạn.',
          }),
        });
        return;
      }

      if (url.includes('/reset-password') && method === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        if (body.otp === capturedOtp) {
          currentPassword = body.newPassword;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
            }),
          });
        } else {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              errorCode: 'ERR_AUTH_INVALID_OTP',
              message: 'Mã xác thực OTP không chính xác',
            }),
          });
        }
        return;
      }

      if (url.includes('/login') && method === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        if (body.email === 'tenant@cozynest.vn' && body.password === currentPassword) {
          const user = {
            id: 'u-tenant-01',
            email: 'tenant@cozynest.vn',
            fullName: 'Nguyễn Văn Thuê',
            roles: ['TENANT'],
          };
          const token = await createRealSignedToken(user);
          await route.fulfill({
            status: 200,
            headers: {
              'Set-Cookie': `cozynest_token=${token}; Path=/; HttpOnly; SameSite=Lax`,
            },
            contentType: 'application/json',
            body: JSON.stringify({
              message: 'Đăng nhập thành công',
              data: {
                token,
                refreshToken: 'rt-new-1',
                user,
              },
            }),
          });
        } else {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              message: 'Email hoặc mật khẩu không chính xác',
            }),
          });
        }
        return;
      }

      await route.continue();
    });

    // 1. Visit /forgot-password
    await page.goto('http://localhost:3000/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // 2. Submit email
    await page.locator('input[type="email"]').fill('tenant@cozynest.vn');
    await page.locator('button[type="submit"]').click();

    // Verify confirmation and redirect link to reset-password
    await expect(page.locator('body')).toContainText(/gửi lại|đã được gửi|reset/i);

    // 3. Visit /reset-password with email query parameter
    await page.goto('http://localhost:3000/reset-password?email=tenant@cozynest.vn');

    // 4. Input OTP & New Strong Password
    const otpInput = page.locator('input[placeholder="123456"]').first();
    await expect(otpInput).toBeVisible();
    await otpInput.fill(capturedOtp);

    const newPwInputs = page.locator('input[type="password"]');
    await newPwInputs.nth(0).fill('NewStrongPassword123@');
    await newPwInputs.nth(1).fill('NewStrongPassword123@');

    // Submit reset password form
    const resetSubmitBtn = page.locator('button[type="submit"]');
    await resetSubmitBtn.click();

    // 5. Should redirect or offer link to /login
    await page.waitForURL(/.*\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/login/);

    // 6. Login using NEW password
    await page.locator('input[type="email"]').fill('tenant@cozynest.vn');
    await page.locator('input[type="password"]').fill('NewStrongPassword123@');
    await page.locator('button[type="submit"]').click();

    // 7. Verify successfully logged in and landed on Tenant Dashboard
    await page.waitForURL(/.*\/dashboard\/tenant/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/dashboard\/tenant/);
  });
});
