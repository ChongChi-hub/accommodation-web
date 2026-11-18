import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SHOT_DIR = path.resolve(__dirname, '../docs/design/screenshots/fix-lifecycle/pha4');

test.describe('[PHA-4] H5 Admin Platform Statistics (Real API + Gateway Guard)', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SHOT_DIR, { recursive: true });
  });

  test('Gateway blocks /internal/stats/** with 404 and Admin Analytics renders real DB-backed metrics', async ({ page, request }) => {
    const internalRes = await request.get('http://localhost:8080/internal/stats/identity');
    expect(internalRes.status()).toBe(404);

    // Login as ADMIN
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/vi/login', { waitUntil: 'domcontentloaded' });
    const idInput = page.locator('input[name="identifier"], input[type="email"], input[type="text"]').first();
    await idInput.waitFor({ state: 'visible', timeout: 15000 });
    await idInput.fill('admin@cozynest.vn');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 });

    const overviewPromise = page.waitForResponse(
      (res) => res.url().includes('/api/v1/admin/stats/overview') && res.status() === 200,
      { timeout: 20000 },
    );

    await page.goto('/vi/dashboard/admin/analytics', { waitUntil: 'domcontentloaded' });
    const overviewRes = await overviewPromise;
    const overviewJson = await overviewRes.json();

    expect(overviewJson.data).toBeTruthy();
    expect(overviewJson.data.degraded).toBe(false);
    expect(overviewJson.data.kpis.totalUsers).toBeGreaterThanOrEqual(20);
    expect(overviewJson.data.kpis.totalRooms).toBeGreaterThanOrEqual(50);
    expect(overviewJson.data.kpis.fintechMode).toBe('SANDBOX_ONLY');

    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Thử nghiệm (SANDBOX_ONLY)').first()).toBeVisible({ timeout: 10000 });

    // Confirm fake hardcoded numbers are GONE
    await expect(page.getByText('+6.2%')).toHaveCount(0);
    await expect(page.getByText('+24.8%')).toHaveCount(0);

    await page.screenshot({
      path: path.join(SHOT_DIR, 'admin-analytics-1440-light.png'),
      fullPage: true,
    });

    // Switch metric tab to Revenue
    await page.getByRole('button', { name: 'Doanh thu' }).click();
    await page.waitForTimeout(400);

    // Mobile 390 check (zero horizontal overflow)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    await page.screenshot({
      path: path.join(SHOT_DIR, 'admin-analytics-390.png'),
      fullPage: false,
    });
  });
});
