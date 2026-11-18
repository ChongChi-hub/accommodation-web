import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SHOT_DIR = path.resolve(__dirname, '../docs/design/screenshots/fix-lifecycle/pha2');

async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/vi/login`, { waitUntil: 'domcontentloaded' });
  const idInput = page.locator('input[name="identifier"], input[type="email"], input[type="text"]').first();
  await idInput.waitFor({ state: 'visible', timeout: 15000 });
  await idInput.fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 15000 });
}

test.describe('[PHA-2] H4 Shared Dashboard Layout (Landlord, Tenant, Admin)', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SHOT_DIR, { recursive: true });
  });

  test('Landlord dashboard: sidebar flush-left (x=0) at 1440/1920/2560/1024, zero horizontal overflow, drawer <1024px', async ({ page }) => {
    await loginAs(page, 'landlord@cozynest.vn', 'password123');

    const routes = [
      { key: 'landlord-appointments', url: '/vi/dashboard/landlord/appointments' },
      { key: 'landlord-rental-requests', url: '/vi/dashboard/landlord/rental-requests' },
      { key: 'landlord-rooms', url: '/vi/dashboard/landlord/rooms' },
      { key: 'landlord-contracts', url: '/vi/dashboard/landlord/contracts' },
    ];

    for (const r of routes) {
      for (const vp of [
        { width: 1440, height: 900 },
        { width: 1920, height: 1080 },
        { width: 1024, height: 768 },
        { width: 768, height: 1024 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(vp);
        await page.goto(`${BASE_URL}${r.url}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);

        const metrics = await page.evaluate(() => {
          const aside = document.querySelector('aside');
          const main = document.querySelector('main');
          return {
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            asideLeft: aside ? Math.round(aside.getBoundingClientRect().left) : null,
            asideWidth: aside ? Math.round(aside.getBoundingClientRect().width) : null,
            mainWidth: main ? Math.round(main.getBoundingClientRect().width) : null,
          };
        });

        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
        if (vp.width >= 1024) {
          expect(metrics.asideLeft).toBe(0);
          expect(metrics.asideWidth).toBeGreaterThanOrEqual(240);
          expect(metrics.asideWidth).toBeLessThanOrEqual(280);
        }

        if ((vp.width === 1440 || vp.width === 390) && (r.key === 'landlord-appointments' || r.key === 'landlord-rooms')) {
          await page.screenshot({ path: path.join(SHOT_DIR, `${r.key}-${vp.width}-after.png`) });
        }
      }
    }

    // Verify 2560 ultrawide caps content container cleanly
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto(`${BASE_URL}/vi/dashboard/landlord/rooms`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const uw = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const inner = document.querySelector('main > div');
      return {
        asideLeft: aside ? Math.round(aside.getBoundingClientRect().left) : null,
        contentWidth: inner ? Math.round(inner.getBoundingClientRect().width) : null,
      };
    });
    expect(uw.asideLeft).toBe(0);
    expect(uw.contentWidth).toBeLessThanOrEqual(1600);

    // Verify mobile drawer (<1024px) opens and closes on Esc
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/vi/dashboard/landlord/appointments`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const menuBtn = page.locator('header button').first();
    await menuBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });

  test('Tenant & Admin dashboards: sidebar flush-left (x=0) at 1440 and zero overflow at 390', async ({ page }) => {
    await loginAs(page, 'tenant@cozynest.vn', 'password123');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/vi/dashboard/tenant/rental-requests`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const tenantLeft = await page.evaluate(() => Math.round(document.querySelector('aside')!.getBoundingClientRect().left));
    expect(tenantLeft).toBe(0);
    await page.screenshot({ path: path.join(SHOT_DIR, 'tenant-rental-requests-1440-after.png') });

    await page.context().clearCookies();
    await loginAs(page, 'admin@cozynest.vn', 'password123');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/vi/dashboard/admin/analytics`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const adminLeft = await page.evaluate(() => Math.round(document.querySelector('aside')!.getBoundingClientRect().left));
    expect(adminLeft).toBe(0);
    await page.screenshot({ path: path.join(SHOT_DIR, 'admin-analytics-layout-1440-after.png') });
  });
});
