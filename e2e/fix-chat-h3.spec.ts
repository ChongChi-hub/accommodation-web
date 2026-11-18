import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOT_DIR = path.resolve(__dirname, '../docs/design/screenshots/fix-lifecycle/pha3');

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/vi/login', { waitUntil: 'domcontentloaded' });
  const idInput = page.locator('input[name="identifier"], input[type="email"], input[type="text"]').first();
  await idInput.waitFor({ state: 'visible', timeout: 15000 });
  await idInput.fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 });
}

test.describe('H3 Chat two-browser real-time & XSS safety', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SHOT_DIR, { recursive: true });
  });

  test('Tenant and Landlord exchange messages safely with XSS escaped', async ({ browser }) => {
    const tenantCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const landlordCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const tenantPage = await tenantCtx.newPage();
    const landlordPage = await landlordCtx.newPage();

    try {
      await loginAs(tenantPage, 'tenant@cozynest.vn', 'password123');
      await loginAs(landlordPage, 'landlord@cozynest.vn', 'password123');

      const marker = `H3-PING-${Date.now()}`;
      const xssPayload = `${marker} <img src=x onerror="window.__xss=1"> https://cozynest.vn/ok`;

      await tenantPage.goto(
        '/vi/dashboard/tenant/messages?landlordId=u-landlord-01&landlordName=Tran+Thi+Lan&roomId=1&roomTitle=Studio',
      );
      await tenantPage.waitForLoadState('networkidle');

      const tenantInput = tenantPage.locator('textarea').first();
      await expect(tenantInput).toBeVisible({ timeout: 15000 });
      await tenantInput.fill(xssPayload);
      await tenantInput.press('Enter');

      await expect(tenantPage.getByText(marker).first()).toBeVisible({ timeout: 15000 });
      const xssRanTenant = await tenantPage.evaluate(() => Boolean((window as unknown as { __xss?: number }).__xss));
      expect(xssRanTenant).toBe(false);
      await expect(tenantPage.locator('a[href="https://cozynest.vn/ok"]').first()).toBeVisible();

      await tenantPage.screenshot({
        path: path.join(SHOT_DIR, 'tenant-messages-1440.png'),
        fullPage: false,
      });

      await landlordPage.goto('/vi/dashboard/landlord/messages');
      await landlordPage.waitForLoadState('networkidle');

      // Select the conversation containing our marker or first conversation
      const convWithMarker = landlordPage.locator('button', { hasText: marker }).first();
      if (await convWithMarker.isVisible({ timeout: 8000 }).catch(() => false)) {
        await convWithMarker.click();
      } else {
        await landlordPage.locator('button').filter({ hasText: /Nguyễn|Minh|Tenant|Khách/i }).first().click();
      }

      await expect(landlordPage.getByText(marker).first()).toBeVisible({ timeout: 15000 });
      const xssRanLandlord = await landlordPage.evaluate(() => Boolean((window as unknown as { __xss?: number }).__xss));
      expect(xssRanLandlord).toBe(false);

      const replyMarker = `H3-REPLY-${Date.now()}`;
      const landlordInput = landlordPage.locator('textarea').first();
      await expect(landlordInput).toBeVisible({ timeout: 10000 });
      await landlordInput.fill(replyMarker);
      await landlordInput.press('Enter');

      await expect(landlordPage.getByText(replyMarker).first()).toBeVisible({ timeout: 15000 });
      await landlordPage.screenshot({
        path: path.join(SHOT_DIR, 'landlord-messages-1440.png'),
        fullPage: false,
      });

      // Verify tenant receives reply via polling
      await expect(tenantPage.getByText(replyMarker).first()).toBeVisible({ timeout: 15000 });

      // Mobile 390 single-column view check
      await landlordPage.setViewportSize({ width: 390, height: 844 });
      await landlordPage.waitForTimeout(300);
      await landlordPage.screenshot({
        path: path.join(SHOT_DIR, 'landlord-messages-390.png'),
        fullPage: false,
      });
    } finally {
      await tenantCtx.close();
      await landlordCtx.close();
    }
  });
});
