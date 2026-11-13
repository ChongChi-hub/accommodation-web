import { chromium } from '@playwright/test';

async function test() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ locale: 'vi-VN' });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.fill('#login-identifier', 'landlord@cozynest.vn');
  await page.fill('#login-password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.pathname.includes('/login'));
  
  await page.goto('http://localhost:3000/dashboard/landlord/utilities', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  console.log('Current URL:', page.url());
  console.log('Heading:', await page.locator('h1').innerText());
  console.log('Select count:', await page.locator('select').count());
  console.log('Input count:', await page.locator('input').count());
  console.log('Submit button text:', await page.locator('button[type="submit"]').innerText());
  
  await browser.close();
}

test().catch(console.error);

