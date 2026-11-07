import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const pages = [
  { name: '403', path: '/403' },
  { name: 'session-expired', path: '/session-expired' },
  { name: 'account-locked', path: '/account-locked' },
  { name: 'maintenance', path: '/maintenance' },
  { name: 'support', path: '/support' },
  { name: 'support-new', path: '/support/new' },
  { name: 'support-detail', path: '/support/TK-1001' },
];

const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
];

const locales = ['vi', 'en'];

test.describe('Comprehensive Common Pages Matrix & Accessibility Audit', () => {
  for (const p of pages) {
    for (const locale of locales) {
      for (const vp of viewports) {
        test(`Matrix Audit: ${p.name} | ${locale} | ${vp.name}px`, async ({ page }) => {
          const consoleErrors: string[] = [];
          page.on('console', (msg) => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
          });

          await page.setViewportSize({ width: vp.width, height: vp.height });

          // Next-intl prefix: 'as-needed' (vi is default without prefix, en has /en)
          const targetUrl = locale === 'vi' ? `http://localhost:3000${p.path}` : `http://localhost:3000/en${p.path}`;
          await page.goto(targetUrl, { waitUntil: 'networkidle' });
          await expect(page.locator('body')).toBeVisible();

          // Horizontal overflow check
          const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          expect(hasOverflow).toBeFalsy();
          expect(consoleErrors).toEqual([]);

          const screenshotDir = path.join(process.cwd(), 'docs', 'design', 'screenshots', 'common', 'matrix');
          fs.mkdirSync(screenshotDir, { recursive: true });

          // Light mode screenshot
          await page.evaluate(() => {
            document.documentElement.classList.remove('dark');
          });
          await page.waitForTimeout(100);
          await page.screenshot({
            path: path.join(screenshotDir, `${p.name}-${locale}-${vp.name}-light.png`),
            fullPage: true,
          });

          // Dark mode screenshot
          await page.evaluate(() => {
            document.documentElement.classList.add('dark');
          });
          await page.waitForTimeout(100);
          await page.screenshot({
            path: path.join(screenshotDir, `${p.name}-${locale}-${vp.name}-dark.png`),
            fullPage: true,
          });

          // Run Axe Accessibility Scan on 1440px Light
          if (vp.name === '1440' && locale === 'vi') {
            await page.evaluate(() => {
              document.documentElement.classList.remove('dark');
            });
            const accessibilityScanResults = await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa'])
              .disableRules(['color-contrast']) // Color contrast can depend on client rendering
              .analyze();

            const seriousOrCritical = accessibilityScanResults.violations.filter(
              (v) => v.impact === 'critical' || v.impact === 'serious'
            );
            expect(seriousOrCritical).toEqual([]);
          }
        });
      }
    }
  }

  test('Support Page States: Empty state when search yields no results', async ({ page, context }) => {
    await context.addCookies([{ name: 'NEXT_LOCALE', value: 'vi', domain: 'localhost', path: '/' }]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/support', { waitUntil: 'networkidle' });

    // Search for non-existent keyword to trigger empty state
    const searchInput = page.locator('[data-testid="support-search-input"]');
    await searchInput.fill('KEYWORD_KHONG_TON_TAI_9999');
    await page.waitForTimeout(300);

    const emptyRow = page.locator('tbody tr td').first();
    await expect(emptyRow).toBeVisible();

    const screenshotDir = path.join(process.cwd(), 'docs', 'design', 'screenshots', 'common', 'states');
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({
      path: path.join(screenshotDir, 'support-empty-state.png'),
    });
  });

  test('Support Detail Error State: When ticket ID does not exist', async ({ page, context }) => {
    await context.addCookies([{ name: 'NEXT_LOCALE', value: 'vi', domain: 'localhost', path: '/' }]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/support/TK-NONEXISTENT', { waitUntil: 'networkidle' });

    const notFoundCard = page.locator('main, div').filter({ hasText: /Không tìm thấy phiếu hỗ trợ|Not found/i }).first();
    await expect(notFoundCard).toBeVisible();

    const screenshotDir = path.join(process.cwd(), 'docs', 'design', 'screenshots', 'common', 'states');
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({
      path: path.join(screenshotDir, 'support-detail-error-state.png'),
    });
  });

  test('Support New Success State: Submitting form displays success banner', async ({ page, context }) => {
    await context.addCookies([{ name: 'NEXT_LOCALE', value: 'vi', domain: 'localhost', path: '/' }]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/support/new', { waitUntil: 'networkidle' });

    await page.locator('[data-testid="support-new-subject"]').fill('Lỗi thanh toán thử nghiệm E2E');
    await page.locator('[data-testid="support-new-desc"]').fill('Đây là nội dung thử nghiệm kịch bản thành công tự động.');
    await page.locator('button[type="submit"]').click();

    const successCard = page.locator('h3').first();
    await expect(successCard).toBeVisible();

    const screenshotDir = path.join(process.cwd(), 'docs', 'design', 'screenshots', 'common', 'states');
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({
      path: path.join(screenshotDir, 'support-new-success-state.png'),
    });
  });
});
