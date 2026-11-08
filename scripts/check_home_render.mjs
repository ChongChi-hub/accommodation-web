import { chromium } from '@playwright/test';

async function check() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  const cards = await page.$$('a[href*="/rooms/"]');
  console.log('Home page featured room cards:', cards.length);

  const text = await page.innerText('body');
  console.log('Contains "Xem tất cả":', text.includes('Xem tất cả'));

  await page.screenshot({
    path: 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d/scratch/home_rendered_full.png',
    fullPage: true,
  });
  console.log('Full screenshot saved to scratch/home_rendered_full.png');

  await browser.close();
}

check().catch(console.error);
