import { test, expect } from '@playwright/test';

test.describe('Admin Overview Page (Visual & Layout)', () => {
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

  test('Desktop 1440px renders correctly without visual flaws', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/dashboard/admin', { waitUntil: 'networkidle' });

    // Verify main header and KPIs are rendered
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Tổng quan hệ thống')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Mobile 390px has zero horizontal overflow and full-width main content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/dashboard/admin', { waitUntil: 'networkidle' });

    // Ensure zero horizontal overflow
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Sidebar should be hidden on mobile until hamburger is clicked
    const desktopSidebar = page.locator('aside');
    await expect(desktopSidebar).toBeHidden();

    // Main area should occupy 100% viewport width
    const mainWidth = await page.locator('main').evaluate((el) => el.getBoundingClientRect().width);
    expect(mainWidth).toBe(390);
  });
});
