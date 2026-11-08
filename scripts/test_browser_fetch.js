const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000/rooms...');
  await page.goto('http://localhost:3000/rooms', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const text = await page.evaluate(() => document.body.innerText);
  console.log('=== BODY TEXT ===\n' + text);

  await browser.close();
})();
