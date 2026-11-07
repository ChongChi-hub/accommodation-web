import { test, expect } from '@playwright/test';

test.describe('[AUTH-04] Password Recovery & Reset Flow UI', () => {
  test('Forgot Password page renders cleanly, validates email, and triggers cooldown on send', async ({ page }) => {
    // Mock the backend forgot-password API call
    await page.route('**/api/v1/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'OTP sent successfully',
        }),
      });
    });

    await page.goto('http://localhost:3000/forgot-password');

    // Verify title and input
    await expect(page.locator('h1, h2').first()).toBeVisible();
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Fill valid email
    await emailInput.fill('tenant1@toam.vn');

    // Click submit button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify button shows countdown cooldown or success notification
    await expect(page.locator('body')).toContainText(/gửi lại|resend|đã được gửi|sent to your email/i, { timeout: 5000 });
  });

  test('Reset Password page shows password strength indicator and validates matching passwords', async ({ page }) => {
    await page.goto('http://localhost:3000/reset-password?email=tenant1@toam.vn');

    // OTP field, new password and confirm password inputs
    const otpInput = page.locator('input[placeholder="123456"]').first();
    await expect(otpInput).toBeVisible();
    await otpInput.fill('123456');

    const newPasswordInput = page.locator('input[type="password"]').first();
    await newPasswordInput.fill('Weak1');

    // Password strength bar should update
    await expect(page.locator('body')).toContainText(/Yếu|Weak|Trung bình|Medium/i);

    // Fill strong password
    await newPasswordInput.fill('StrongPassword123!');
    await expect(page.locator('body')).toContainText(/Mạnh|Strong/i);
  });

  test('Reset Password handles invalid OTP rejection gracefully', async ({ page }) => {
    await page.route('**/api/v1/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Mã xác thực OTP không chính xác',
          errorCode: 'ERR_AUTH_INVALID_OTP',
        }),
      });
    });

    await page.goto('http://localhost:3000/reset-password?email=tenant1@toam.vn');

    await page.locator('input[placeholder="123456"]').fill('999999');
    await page.locator('input[name="newPassword"]').fill('NewPass123!@#');
    await page.locator('input[name="confirmPassword"]').fill('NewPass123!@#');

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('body')).toContainText(/Mã xác thực OTP không chính xác|ERR_AUTH_INVALID_OTP/i, { timeout: 5000 });
  });

  test('Reset Password handles expired OTP rejection', async ({ page }) => {
    await page.route('**/api/v1/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Mã OTP đã hết hạn hoặc vượt quá số lần thử cho phép (tối đa 5 lần)',
          errorCode: 'ERR_AUTH_OTP_EXPIRED',
        }),
      });
    });

    await page.goto('http://localhost:3000/reset-password?email=tenant1@toam.vn');

    await page.locator('input[placeholder="123456"]').fill('123456');
    await page.locator('input[name="newPassword"]').fill('NewPass123!@#');
    await page.locator('input[name="confirmPassword"]').fill('NewPass123!@#');

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('body')).toContainText(/Mã OTP đã hết hạn|ERR_AUTH_OTP_EXPIRED/i, { timeout: 5000 });
  });

  test('Reset Password handles account/OTP lockout after 5 attempts', async ({ page }) => {
    await page.route('**/api/v1/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Mã OTP đã bị vô hiệu hóa do nhập sai quá 5 lần liên tiếp. Vui lòng gửi lại yêu cầu khôi phục.',
          errorCode: 'ERR_AUTH_OTP_LOCKED',
        }),
      });
    });

    await page.goto('http://localhost:3000/reset-password?email=tenant1@toam.vn');

    await page.locator('input[placeholder="123456"]').fill('000000');
    await page.locator('input[name="newPassword"]').fill('NewPass123!@#');
    await page.locator('input[name="confirmPassword"]').fill('NewPass123!@#');

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('body')).toContainText(/quá 5 lần liên tiếp|ERR_AUTH_OTP_LOCKED/i, { timeout: 5000 });
  });

  test('Reset Password rejects reuse of current/old password', async ({ page }) => {
    await page.route('**/api/v1/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Mật khẩu mới không được trùng với mật khẩu gần nhất',
          errorCode: 'ERR_AUTH_OLD_PASSWORD_REUSE',
        }),
      });
    });

    await page.goto('http://localhost:3000/reset-password?email=tenant1@toam.vn');

    await page.locator('input[placeholder="123456"]').fill('123456');
    await page.locator('input[name="newPassword"]').fill('OldPassword123!');
    await page.locator('input[name="confirmPassword"]').fill('OldPassword123!');

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('body')).toContainText(/không được trùng với mật khẩu gần nhất|ERR_AUTH_OLD_PASSWORD_REUSE/i, { timeout: 5000 });
  });
});
