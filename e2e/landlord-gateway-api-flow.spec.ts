import { test, expect } from '@playwright/test';
import { setupAuthMockRoutes, createRealSignedToken, DEMO_USERS } from './helpers/auth-helper';

test.describe('[LANDLORD-04] Landlord Real Authentication & API Access Matrix', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMockRoutes(page);

    // Mock landlord rooms API
    await page.route('**/api/v1/landlord/rooms**', async (route) => {
      const cors = {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
      };
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 204, headers: cors });
      }
      const headers = route.request().headers();
      const authHeader = headers['authorization'];

      // Check if request is authenticated
      if (!authHeader && !headers['cookie']?.includes('cozynest_token')) {
        await route.fulfill({
          status: 401,
          headers: cors,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Unauthorized' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: cors,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Lấy danh sách phòng thành công',
          data: [
            {
              id: 1,
              title: 'Phòng studio ban công thoáng Dịch Vọng Hậu, Hà Nội',
              price: 4500000,
              area: 28.5,
              status: 'PUBLISHED',
              coverImage: '/media/room-1-thumb.webp',
              createdAt: '2026-11-01T10:00:00',
            },
          ],
          pagination: {
            page: 1,
            size: 10,
            totalElements: 1,
            totalPages: 1,
          },
        }),
      });
    });
  });

  test('Real form login with landlord@cozynest.vn calls /api/v1/landlord/rooms with 200 OK', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.locator('#login-identifier').fill('landlord@cozynest.vn');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Land on landlord dashboard
    await page.waitForURL(/.*\/dashboard\/landlord/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/dashboard\/landlord/);

    // Navigate to landlord rooms page and verify API 200
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/v1/landlord/rooms') && res.status() === 200),
      page.goto('http://localhost:3000/dashboard/landlord/rooms'),
    ]);

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(json.data.length).toBeGreaterThan(0);
  });

  test('Namespace Security Matrix: Unauthenticated Guest cannot access /dashboard/landlord', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/landlord');
    await page.waitForURL(/.*\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('Namespace Security Matrix: Tenant cannot access /dashboard/landlord rooms dashboard', async ({ page, context }) => {
    const tenantUser = DEMO_USERS['tenant@cozynest.vn'];
    const tenantToken = await createRealSignedToken(tenantUser);
    await context.addCookies([
      { name: 'cozynest_token', value: tenantToken, domain: 'localhost', path: '/' },
      { name: 'cozynest_role', value: 'TENANT', domain: 'localhost', path: '/' },
    ]);

    await page.goto('http://localhost:3000/dashboard/landlord');
    await page.waitForURL(/.*\/(dashboard\/landlord\/kyc|dashboard\/tenant|403)/, { timeout: 10000 });
    expect(page.url()).not.toMatch(/\/dashboard\/landlord$/);
  });

  test('Namespace Security Matrix: Moderator cannot access /dashboard/landlord (403)', async ({ page, context }) => {
    const modUser = DEMO_USERS['moderator@cozynest.vn'];
    const modToken = await createRealSignedToken(modUser);
    await context.addCookies([
      { name: 'cozynest_token', value: modToken, domain: 'localhost', path: '/' },
      { name: 'cozynest_role', value: 'MODERATOR', domain: 'localhost', path: '/' },
    ]);

    await page.goto('http://localhost:3000/dashboard/landlord');
    await page.waitForURL(/.*\/403/, { timeout: 10000 });
    expect(page.url()).toContain('/403');
  });

  test('Namespace Security Matrix: Admin cannot access /dashboard/landlord (403)', async ({ page, context }) => {
    const adminUser = DEMO_USERS['admin@cozynest.vn'];
    const adminToken = await createRealSignedToken(adminUser);
    await context.addCookies([
      { name: 'cozynest_token', value: adminToken, domain: 'localhost', path: '/' },
      { name: 'cozynest_role', value: 'ADMIN', domain: 'localhost', path: '/' },
    ]);

    await page.goto('http://localhost:3000/dashboard/landlord');
    await page.waitForURL(/.*\/403/, { timeout: 10000 });
    expect(page.url()).toContain('/403');
  });
});
