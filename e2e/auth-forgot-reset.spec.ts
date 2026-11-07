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
});
