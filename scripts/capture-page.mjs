import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const [routePath, role, pageName, phase = 'after'] = process.argv.slice(2);

if (!routePath || !role || !pageName) {
  console.error('Usage: node scripts/capture-page.mjs <route-suffix> <role> <page-name> [before|after]');
  console.error('Example: node scripts/capture-page.mjs /dashboard/admin admin overview after');
  process.exit(1);
}

const outDir = path.join(rootDir, 'docs', 'design', 'screenshots', role, 'before-after');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set authenticated admin session
  await page.addInitScript(() => {
    localStorage.setItem('toam_access_token', 'mock_admin_token');
    localStorage.setItem('toam_user', JSON.stringify({
      id: 'usr_admin_1',
      email: 'admin@toam.vn',
      fullName: 'Quản Trị Viên',
      phone: '0901234567',
      roles: ['ADMIN'],
      isKycVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    }));
  });

  console.log(`Capturing ${phase} screenshots for ${pageName} (${routePath}) into ${outDir}...`);

  for (const locale of ['vi']) {
    const fullUrl = `http://localhost:3000/${locale}${routePath}`;

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Light mode
      await page.goto(fullUrl, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('toam-theme', 'light');
      });
      await page.waitForTimeout(300);
      const lightFile = path.join(outDir, `${pageName}-${phase}-${vp.name}-light.png`);
      await page.screenshot({ path: lightFile, fullPage: false });

      // Dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('toam-theme', 'dark');
      });
      await page.waitForTimeout(300);
      const darkFile = path.join(outDir, `${pageName}-${phase}-${vp.name}-dark.png`);
      await page.screenshot({ path: darkFile, fullPage: false });

      // Check overflow on mobile
      if (vp.name === '390') {
        const overflow = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
          };
        });
        if (overflow.hasOverflow) {
          console.warn(`WARNING: Horizontal overflow detected on ${pageName} at 390px! scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`);
        } else {
          console.log(`SUCCESS: Zero horizontal overflow on ${pageName} at 390px.`);
        }
      }
    }
  }

  await browser.close();
  console.log(`Finished capturing ${phase} screenshots for ${pageName}.`);
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
