import { test, expect } from '@playwright/test';

test.describe('[AUTH-03] RBAC Route Guard & Middleware Protection', () => {
  test('Unauthenticated user visiting /dashboard/admin is redirected to /login with returnUrl', async ({ page }) => {
    // Clear cookies
    await page.context().clearCookies();

    // Directly access protected admin dashboard
    await page.goto('http://localhost:3000/dashboard/admin');

    // Should redirect to login page with returnUrl query param
    await expect(page).toHaveURL(/.*\/login\?returnUrl=.*/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('Tenant user attempting to access /dashboard/admin is redirected to /403 Forbidden', async ({ page, context }) => {
    // Set TENANT role cookie
    await context.addCookies([
      {
        name: 'toam_role',
        value: 'TENANT',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Tenant attempts to access admin dashboard
    await page.goto('http://localhost:3000/dashboard/admin');

    // Should redirect to 403 Forbidden page
    await expect(page).toHaveURL(/.*\/403/);
    await expect(page.locator('body')).toContainText('403');
  });

  test('Admin user with ADMIN role cookie can access /dashboard/admin', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'toam_role',
        value: 'ADMIN',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Admin accesses admin dashboard
    await page.goto('http://localhost:3000/dashboard/admin');

    // Should stay on admin dashboard
    await expect(page).toHaveURL(/.*\/dashboard\/admin/);
  });

  test('Landlord user with LANDLORD role cookie can access /dashboard/landlord', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'toam_role',
        value: 'LANDLORD',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Landlord accesses landlord dashboard
    await page.goto('http://localhost:3000/dashboard/landlord');

    // Should stay on landlord dashboard
    await expect(page).toHaveURL(/.*\/dashboard\/landlord/);
  });
});
