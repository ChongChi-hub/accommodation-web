import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const [routePath, role, pageName] = process.argv.slice(2);

if (!routePath || !role || !pageName) {
  console.error('Usage: node scripts/capture-page.mjs <route-suffix> <role> <page-name>');
  console.error('Example: node scripts/capture-page.mjs /dashboard/admin admin overview');
  process.exit(1);
}

const outDir = path.join(rootDir, 'docs', 'design', 'screenshots', role);
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
];

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Capturing screenshots for ${pageName} (${routePath}) into ${outDir}...`);

  for (const locale of ['vi', 'en']) {
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
      const lightFile = path.join(outDir, `${pageName}-${vp.name}-light-${locale}.png`);
      await page.screenshot({ path: lightFile, fullPage: false });

      // Dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('toam-theme', 'dark');
      });
      await page.waitForTimeout(300);
      const darkFile = path.join(outDir, `${pageName}-${vp.name}-dark-${locale}.png`);
      await page.screenshot({ path: darkFile, fullPage: false });
    }
  }

  // Also capture states on 1440 light vi if available
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const state of ['empty', 'loading', 'error']) {
    const stateUrl = `http://localhost:3000/vi${routePath}?state=${state}`;
    await page.goto(stateUrl, { waitUntil: 'load' });
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    await page.waitForTimeout(300);
    const stateFile = path.join(outDir, `${pageName}-1440-state-${state}.png`);
    await page.screenshot({ path: stateFile, fullPage: false });
  }

  await browser.close();
  console.log(`Finished capturing screenshots for ${pageName}.`);
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});

