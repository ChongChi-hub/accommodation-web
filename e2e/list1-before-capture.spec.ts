import { test } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const OUT_DIR = path.resolve('docs/design/screenshots/list/before');

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

const pages = [
  { path: '/vi/phong-tro', name: 'phong-tro' },
  { path: '/vi/nha-nguyen-can', name: 'nha-nguyen-can' },
  { path: '/vi/can-ho', name: 'can-ho' },
  { path: '/vi/o-ghep', name: 'o-ghep' },
];

for (const pg of pages) {
  test(`Capture before - ${pg.name} - 1440`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:3000${pg.path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(OUT_DIR, `${pg.name}-1440-desktop-before.png`),
      fullPage: true,
    });
  });

  test(`Capture before - ${pg.name} - 390`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://localhost:3000${pg.path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(OUT_DIR, `${pg.name}-390-mobile-before.png`),
      fullPage: true,
    });
  });
}

