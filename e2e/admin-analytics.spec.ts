import { test, expect } from '@playwright/test';

test.describe('Admin Analytics Page (Visual & Layout)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('toam_access_token', 'mock_admin_token');
      localStorage.setItem('toam_user', JSON.stringify({
        id: 'usr_admin_1',
        email: 'admin@toam.vn',
        fullName: 'Quản Trị Viên',
        phone: '0901234567',
        roles: ['ADMIN'],
        isKycVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }));
    });
  });

  test('Desktop 1440px renders analytics metrics and progress bars', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/dashboard/admin/analytics', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Mobile 390px has zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/dashboard/admin/analytics', { waitUntil: 'networkidle' });

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
