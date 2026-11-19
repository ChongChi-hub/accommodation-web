import { chromium } from '@playwright/test';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log('Logging in as cuongdfle@gmail.com...');
  await page.goto('http://localhost:3000/vi/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="identifier"], #login-identifier', 'cuongdfle@gmail.com');
  await page.fill('input[name="password"], #login-password', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(1000);

  console.log('Navigating to notifications page...');
  await page.goto('http://localhost:3000/dashboard/tenant/notifications', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const screenshotPath = 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/1ed0df2c-6bde-4b81-9508-0b1daea7062d/notifications_page_verified.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Verified notifications page screenshot saved to', screenshotPath);

  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

