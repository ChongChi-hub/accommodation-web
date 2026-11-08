import { chromium } from '@playwright/test';

async function check() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000/rooms...');
  await page.goto('http://localhost:3000/rooms', { waitUntil: 'networkidle' });
  
  const title = await page.title();
  console.log('Page title:', title);

  // Check for room cards
  const cards = await page.$$('.grid a[href*="/rooms/"]');
  console.log('Found room card links:', cards.length);

  const bodyText = await page.innerText('body');
  console.log('Contains "Tìm thấy":', bodyText.includes('Tìm thấy'));
  console.log('Contains "Không thể tải":', bodyText.includes('Không thể tải'));

  await page.screenshot({ path: 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d/scratch/rooms_rendered.png' });
  console.log('Screenshot saved to scratch/rooms_rendered.png');

  await browser.close();
}

check().catch(console.error);

