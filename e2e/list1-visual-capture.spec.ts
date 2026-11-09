import { test } from '@playwright/test';
import * as path from 'path';

const WEB_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve('docs/design/screenshots/list/after');

test.describe('Capture LIST-1 After Visual Screenshots', () => {
  const routes = [
    { name: 'phong-tro', path: '/vi/phong-tro' },
    { name: 'nha-nguyen-can', path: '/vi/nha-nguyen-can' },
    { name: 'can-ho', path: '/vi/can-ho' },
    { name: 'o-ghep', path: '/vi/o-ghep' },
  ];

  for (const r of routes) {
    test(`Capture ${r.name} desktop 1440`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${WEB_URL}${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(OUT_DIR, `${r.name}-1440-desktop-after.png`),
        fullPage: false,
      });
    });

    test(`Capture ${r.name} mobile 390`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${WEB_URL}${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(OUT_DIR, `${r.name}-390-mobile-after.png`),
        fullPage: false,
      });
    });
  }

  test('Capture Mega-menu open at 1440', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/vi/can-ho`, { waitUntil: 'networkidle' });
    const trigger = page.locator('header button:has-text("Khu vực")');
    await trigger.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(OUT_DIR, 'list-mega-menu-1440.png'),
      fullPage: false,
    });
  });

  test('Capture Combobox open at 1440', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    const combo = page.locator('button:has-text("Tất cả Tỉnh/Thành")').first();
    await combo.click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT_DIR, 'list-combobox-open-1440.png'),
      fullPage: false,
    });
  });

  test('Capture List View Mode at 1440', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    const listBtn = page.locator('button[aria-label="Xem danh sách"]');
    await listBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT_DIR, 'list-view-mode-1440.png'),
      fullPage: false,
    });
  });
});
