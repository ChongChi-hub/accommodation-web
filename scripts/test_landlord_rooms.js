const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Logging in with landlord@cozynest.vn...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  await page.fill('input[type="email"], input[name="email"]', 'landlord@cozynest.vn');
  await page.fill('input[type="password"], input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('Current URL after login:', page.url());
  
  // Go to landlord rooms page
  console.log('Visiting landlord rooms page...');
  await page.goto('http://localhost:3000/dashboard/landlord/rooms', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const text = await page.innerText('body');
  console.log('LANDLORD ROOMS BODY SNIPPET:');
  console.log(text.slice(0, 1000));

  await page.screenshot({ path: 'scripts/landlord_rooms_page.png' });
  await browser.close();
  console.log('Done test_landlord_rooms!');
})().catch(err => { console.error('SCRIPT ERROR:', err); process.exit(1); });
