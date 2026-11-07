import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const outDir = path.join(rootDir, 'docs', 'design', 'screenshots', 'profile_kyc');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

const themes = ['light', 'dark'];
const locales = ['vi', 'en'];

async function run() {
  const browser = await chromium.launch();

  console.log(`Starting capture for User Profile & KYC to ${outDir}...`);

  for (const locale of locales) {
    for (const theme of themes) {
      for (const vp of viewports) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();

        // 1. Profile Page
        await page.addInitScript(({ theme }) => {
          localStorage.setItem('toam_access_token', 'mock_landlord_token');
          localStorage.setItem('toam_user', JSON.stringify({
            id: 'u-landlord-01',
            email: 'landlord@toam.vn',
            fullName: 'Nguyễn Văn Toàn',
            phone: '0902000001',
            roles: ['LANDLORD'],
            isKycVerified: true,
          }));
          localStorage.setItem('toam-theme', theme);
          if (theme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }, { theme });

        try {
          // Profile Details
          await page.goto(`http://localhost:3000/${locale}/dashboard/landlord/profile`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(outDir, `profile-${vp.name}-${theme}-${locale}.png`), fullPage: false });

          // Password Tab
          const pwdBtn = page.locator('button:has-text("Mật khẩu"), button:has-text("Password"), [data-tab="password"]').first();
          if (await pwdBtn.count() > 0) {
            await pwdBtn.click();
            await page.waitForTimeout(300);
          }
          await page.screenshot({ path: path.join(outDir, `password-${vp.name}-${theme}-${locale}.png`), fullPage: false });

          // KYC Page
          await page.goto(`http://localhost:3000/${locale}/dashboard/landlord/kyc`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(outDir, `kyc-${vp.name}-${theme}-${locale}.png`), fullPage: false });

          // Moderator KYC Page
          await page.goto(`http://localhost:3000/${locale}/dashboard/moderator/kyc`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(outDir, `moderator-kyc-${vp.name}-${theme}-${locale}.png`), fullPage: false });
        } catch (err) {
          console.warn(`Warning on ${locale}-${theme}-${vp.name}: ${err.message}`);
        }

        await context.close();
      }
    }
  }

  await browser.close();
  console.log('Capture completed successfully.');
}

run().catch(console.error);
