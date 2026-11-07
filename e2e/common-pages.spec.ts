import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const pages = [
  { name: '403', path: '/403', title: 'Truy cập bị từ chối' },
  { name: 'session-expired', path: '/session-expired', title: 'Phiên làm việc đã hết hạn' },
  { name: 'account-locked', path: '/account-locked', title: 'Tài khoản tạm thời bị khóa' },
  { name: 'maintenance', path: '/maintenance', title: 'Nâng cấp hạ tầng dịch vụ' },
  { name: 'support', path: '/support', title: 'Trung tâm Hỗ trợ & Trợ giúp' },
  { name: 'support-new', path: '/support/new', title: 'Tạo phiếu hỗ trợ mới' },
  { name: 'support-detail', path: '/support/TK-1001', title: 'Lỗi quét mã VietQR' },
];

const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

test.describe('Common Pages Visual & Responsive Inspection', () => {
  for (const p of pages) {
    for (const vp of viewports) {
      test(`Render ${p.name} on ${vp.name}px without horizontal overflow or error`, async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`http://localhost:3000${p.path}`, { waitUntil: 'networkidle' });

        // Ensure page content has rendered
        await expect(page.locator('body')).toBeVisible();

        // Check horizontal overflow (scrollWidth should not exceed clientWidth)
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBeFalsy();

        // Check console errors
        expect(consoleErrors).toEqual([]);

        // Save screenshot
        const screenshotDir = path.join(process.cwd(), 'docs', 'design', 'screenshots', 'common');
        fs.mkdirSync(screenshotDir, { recursive: true });
        await page.screenshot({
          path: path.join(screenshotDir, `${p.name}-${vp.name}-light.png`),
          fullPage: true,
        });

        // Test Dark mode
        await page.evaluate(() => {
          document.documentElement.classList.add('dark');
        });
        await page.waitForTimeout(100);
        await page.screenshot({
          path: path.join(screenshotDir, `${p.name}-${vp.name}-dark.png`),
          fullPage: true,
        });
      });
    }
  }
});

