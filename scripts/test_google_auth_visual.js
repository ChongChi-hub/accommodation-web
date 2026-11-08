const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const artDir = 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d';

(async () => {
  const browser = await chromium.launch({ headless: true });
  console.log('--- Starting Playwright Visual Capture for AUTH-02 ---');

  const configs = [
    { name: 'login_desktop_vi_light', url: 'http://localhost:3000/vi/login', width: 1440, height: 900, dark: false },
    { name: 'login_mobile_vi_light', url: 'http://localhost:3000/vi/login', width: 390, height: 844, dark: false },
    { name: 'login_desktop_en_dark', url: 'http://localhost:3000/en/login', width: 1440, height: 900, dark: true },
    { name: 'register_desktop_vi_light', url: 'http://localhost:3000/vi/register', width: 1440, height: 900, dark: false },
    { name: 'register_mobile_vi_light', url: 'http://localhost:3000/vi/register', width: 390, height: 844, dark: false },
    { name: 'register_desktop_en_dark', url: 'http://localhost:3000/en/register', width: 1440, height: 900, dark: true },
  ];

  for (const c of configs) {
    const context = await browser.newContext({
      viewport: { width: c.width, height: c.height },
      colorScheme: c.dark ? 'dark' : 'light',
    });
    const page = await context.newPage();
    console.log(`Navigating to ${c.url} (${c.name})...`);
    await page.goto(c.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const outLocal = path.join('D:/RIKKEI/THUC_TAP/PROJECT/accommodation-web/scripts', `${c.name}.png`);
    const outArt = path.join(artDir, `${c.name}.png`);
    await page.screenshot({ path: outLocal, fullPage: true });
    fs.copyFileSync(outLocal, outArt);
    console.log(`Saved screenshot: ${c.name}.png`);
    await context.close();
  }

  await browser.close();
  console.log('All visual screenshots captured successfully!');
})();

