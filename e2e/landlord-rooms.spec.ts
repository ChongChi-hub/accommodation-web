import { test, expect } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

test.describe('Landlord Rooms Page (LANDLORD-04)', () => {
  test.beforeEach(async ({ context, page }) => {
    await authenticateAs(context, page, 'landlord@toam.vn');
  });

  test('Desktop 1440px renders table and controls without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="Tìm theo"]')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Mobile 390px renders responsive cards with zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'networkidle' });

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Simulated state=empty renders EmptyState component', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms?state=empty', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Chưa có phòng trọ nào')).toBeVisible();
  });

  test('Simulated state=error renders ErrorState component with retry', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms?state=error', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Không thể tải dữ liệu')).toBeVisible();
    await expect(page.locator('button:has-text("Thử lại")')).toBeVisible();
  });

  test('Simulated state=loading renders skeleton loader', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms?state=loading', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });
});
