import { test, expect } from '@playwright/test';
import { setupAuthMockRoutes } from './helpers/auth-helper';

test.describe('[AUTH-03] Cryptographic RBAC Route Guard & Next.js Middleware Protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/**', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { success: true, data: [] },
      });
    });
    await setupAuthMockRoutes(page);
    await page.context().clearCookies();
  });

  test('1. Unauthenticated guest visiting /dashboard/admin is redirected to /login with returnUrl', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/.*\/login\?returnUrl=.*/);
    await expect(page.locator('#login-identifier')).toBeVisible();
  });

  test('2. Real form login with Tenant account lands on /dashboard/tenant, cannot access /dashboard/admin (403)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-identifier', 'tenant@cozynest.vn');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Successfully redirects to tenant dashboard
    await expect(page).toHaveURL(/.*\/dashboard\/tenant/);

    // Tenant attempts to access /dashboard/admin -> blocked with 403
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/.*\/403/);
    await expect(page.locator('body')).toContainText('403');
  });

  test('3. Role spoofing attempt: Tenant modifying document.cookie cozynest_role=ADMIN is still blocked by signed JWT', async ({ page }) => {
    // Perform genuine tenant login
    await page.goto('/login');
    await page.fill('#login-identifier', 'tenant@cozynest.vn');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard\/tenant/);

    // Malicious tenant attempts to forge cozynest_role cookie in client browser
    await page.evaluate(() => {
      document.cookie = 'cozynest_role=ADMIN; path=/; SameSite=Lax';
    });

    // Tenant attempts to access admin dashboard with forged cookie
    await page.goto('/dashboard/admin');

    // Middleware MUST reject because cozynest_token cryptographic signature shows role=TENANT
    await expect(page).toHaveURL(/.*\/403/);
    await expect(page.locator('body')).toContainText('403');
  });

  test('4. Real form login with Landlord account lands on /dashboard/landlord, cannot access /dashboard/admin (403)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-identifier', 'landlord@cozynest.vn');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Successfully redirects to landlord dashboard
    await expect(page).toHaveURL(/.*\/dashboard\/landlord/);

    // Landlord attempts to access /dashboard/admin -> blocked with 403
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/.*\/403/);
    await expect(page.locator('body')).toContainText('403');
  });

  test('5. Real form login with Moderator account lands on /dashboard/moderator, cannot access /dashboard/admin (403)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-identifier', 'moderator@cozynest.vn');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Successfully redirects to moderator dashboard
    await expect(page).toHaveURL(/.*\/dashboard\/moderator/);

    // Moderator attempts to access /dashboard/admin -> blocked with 403
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/.*\/403/);
    await expect(page.locator('body')).toContainText('403');
  });

  test('6. Real form login with Admin account lands on /dashboard/admin and has full access', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-identifier', 'admin@cozynest.vn');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Successfully redirects to admin dashboard
    await expect(page).toHaveURL(/.*\/dashboard\/admin/);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cấu hình hệ thống' })).toBeVisible();
  });
});
