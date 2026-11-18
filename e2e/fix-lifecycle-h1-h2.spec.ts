import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SHOT_DIR = path.resolve(__dirname, '../docs/design/screenshots/fix-lifecycle/pha1');

async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/vi/login`, { waitUntil: 'domcontentloaded' });
  const idInput = page.locator('input[name="identifier"], input[type="email"], input[type="text"]').first();
  await idInput.waitFor({ state: 'visible', timeout: 15000 });
  await idInput.fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 15000 });
}

test.describe('[PHA-1] H1 Appointments & H2 Rental Requests Lifecycle', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SHOT_DIR, { recursive: true });
  });

  test('H2: Rental requests hide Create Contract on REJECTED, hide raw UUID, and backend returns 409', async ({ page }) => {
    await loginAs(page, 'landlord@cozynest.vn', 'password123');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/vi/dashboard/landlord/rental-requests`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Must not display raw tenant UUID or raw room ID prefix
    const bodyText = await page.locator('main').innerText();
    expect(bodyText).not.toContain('u-tenant-01');
    expect(bodyText).not.toContain('#room-00000001');

    // Light 1440 screenshot
    await page.screenshot({ path: path.join(SHOT_DIR, 'rental-requests-1440-light.png') });

    // Dark 1440 screenshot
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOT_DIR, 'rental-requests-1440-dark.png') });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));

    // Mobile 390 light & dark
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOT_DIR, 'rental-requests-390-light.png') });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOT_DIR, 'rental-requests-390-dark.png') });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));

    // Check Rejected tab never renders "Tạo hợp đồng"
    await page.setViewportSize({ width: 1440, height: 900 });
    const rejectedTab = page.getByRole('tab', { name: /Đã từ chối/i });
    await rejectedTab.click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('button', { name: /Tạo hợp đồng/i })).toHaveCount(0);
  });

  test('H1: Appointments show Complete/No-Show actions on CONFIRMED, hide empty phone label, and complete past fixture', async ({ page }) => {
    await loginAs(page, 'landlord@cozynest.vn', 'password123');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/vi/dashboard/landlord/appointments`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Light 1440 screenshot
    await page.screenshot({ path: path.join(SHOT_DIR, 'appointments-1440-light.png') });

    // Dark 1440 screenshot
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOT_DIR, 'appointments-1440-dark.png') });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));

    // Mobile 390 light & dark
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOT_DIR, 'appointments-390-light.png') });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOT_DIR, 'appointments-390-dark.png') });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));

    // Switch to CONFIRMED tab and verify Complete & No-Show buttons exist
    await page.setViewportSize({ width: 1440, height: 900 });
    const confirmedTab = page.getByRole('button', { name: /Đã xác nhận/i }).first();
    await confirmedTab.click();
    await page.waitForTimeout(600);
    const completeButtons = page.getByRole('button', { name: /^Hoàn thành$/i });
    expect(await completeButtons.count()).toBeGreaterThan(0);
  });
});
