const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('response', res => {
    if (res.url().includes('8080') || res.url().includes('dashboard')) {
      console.log('HTTP RESP:', res.status(), res.url());
    }
  });

  await page.goto('http://localhost:3000/vi/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  await page.fill('input[type="email"]', 'landlord@cozynest.vn');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(2500);
  console.log('URL after login:', page.url());

  console.log('Navigating to http://localhost:3000/vi/dashboard/landlord/rooms ...');
  await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  console.log('Final URL:', page.url());
  const h1 = await page.$eval('h1', el => el.innerText).catch(() => 'No h1');
  console.log('H1 Title:', h1);
  
  const text = await page.innerText('body');
  console.log('BODY CONTAINS "Quản lý phòng":', text.includes('Quản lý phòng'));
  console.log('BODY SNIPPET (main):', text.slice(text.indexOf('Quản lý phòng') || 0, (text.indexOf('Quản lý phòng') || 0) + 600));

  await browser.close();
})().catch(err => { console.error('SCRIPT ERROR:', err); process.exit(1); });
