import { chromium } from '@playwright/test';
import path from 'path';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log('Logging in as cuongdfle@gmail.com...');
  await page.goto('http://localhost:3000/vi/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="identifier"], #login-identifier', 'cuongdfle@gmail.com');
  await page.fill('input[type="password"], input[name="password"], #login-password', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  console.log('Navigating to tenant deposits page...');
  await page.goto('http://localhost:3000/dashboard/tenant/deposits', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check if VietQrRealPaymentCard is already rendered or need to click button
  const submitBtn = page.locator('button:has-text("Tạo mã thanh toán VietQR")');
  if (await submitBtn.isVisible() && await submitBtn.isEnabled()) {
    console.log('Clicking "Tạo mã thanh toán VietQR"...');
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  const outPath = 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/1ed0df2c-6bde-4b81-9508-0b1daea7062d/deposit_real_payment_screen.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Screenshot saved to:', outPath);

  await browser.close();
}

capture().catch((err) => {
  console.error('Error capturing screenshot:', err);
  process.exit(1);
});

