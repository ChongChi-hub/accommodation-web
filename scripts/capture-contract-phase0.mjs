import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  await page.fill('#login-identifier', 'lehuunhathao2k6@gmail.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  console.log('Waiting for dashboard navigation...');
  await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });
  console.log('Logged in successfully, URL:', page.url());

  const contractUrl = 'http://localhost:3000/dashboard/landlord/contracts/d8082a0f-c5c9-4d62-9016-1e493f66057c';
  console.log('Navigating to contract:', contractUrl);
  await page.goto(contractUrl);
  await page.waitForSelector('text=HỢP ĐỒNG THUÊ NHÀ', { timeout: 15000 });
  await page.waitForTimeout(1500);

  const outDir = path.resolve('accommodation-web/docs/screenshots/phase0');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('Capturing full page screenshot...');
  await page.screenshot({ path: path.join(outDir, 'contract_page_full.png'), fullPage: true });

  // Extract inner text of contract paper
  const contractDocElement = await page.$('.font-serif');
  if (contractDocElement) {
    const text = await contractDocElement.innerText();
    fs.writeFileSync(path.join(outDir, 'contract_web_text.txt'), text, 'utf-8');
    console.log('Saved contract_web_text.txt, length:', text.length);
  }

  // Section screenshots
  const partiesSection = await page.$('.grid.grid-cols-1.md\\:grid-cols-2');
  if (partiesSection) {
    await partiesSection.screenshot({ path: path.join(outDir, 'contract_parties.png') });
    console.log('Saved contract_parties.png');
  }

  const signSection = await page.$('.grid.grid-cols-2.gap-8');
  if (signSection) {
    await signSection.screenshot({ path: path.join(outDir, 'contract_signatures.png') });
    console.log('Saved contract_signatures.png');
  }

  await browser.close();
  console.log('Phase 0 browser capture completed successfully!');
}

run().catch((err) => {
  console.error('Error running capture:', err);
  process.exit(1);
});
