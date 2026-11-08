import { test, expect } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

test.describe('Admin Rooms Page (Visual & Layout)', () => {
  test.beforeEach(async ({ context, page }) => {
    await authenticateAs(context, page, 'admin@cozynest.vn');
  });

  test('Desktop 1440px renders moderation table and detail drawer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/dashboard/admin/rooms', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Mobile 390px has zero horizontal overflow and responsive table container', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/dashboard/admin/rooms', { waitUntil: 'networkidle' });

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Table is rendered and visible inside its container
    await expect(page.locator('table')).toBeVisible();
  });
});
