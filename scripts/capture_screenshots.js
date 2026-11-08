const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop Home
  const pageHome = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  console.log('Navigating to Home...');
  await pageHome.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageHome.waitForTimeout(2000);
  await pageHome.screenshot({ path: 'scripts/desktop_home.png', fullPage: true });
  console.log('Saved scripts/desktop_home.png');

  // 2. Mobile Home
  const pageHomeMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageHomeMobile.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageHomeMobile.waitForTimeout(1500);
  await pageHomeMobile.screenshot({ path: 'scripts/mobile_home.png', fullPage: true });
  console.log('Saved scripts/mobile_home.png');

  // 3. Desktop Rooms
  const pageRooms = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  console.log('Navigating to Rooms...');
  await pageRooms.goto('http://localhost:3000/rooms', { waitUntil: 'networkidle' });
  await pageRooms.waitForTimeout(2000);
  await pageRooms.screenshot({ path: 'scripts/desktop_rooms.png', fullPage: true });
  console.log('Saved scripts/desktop_rooms.png');

  // 4. Mobile Rooms
  const pageRoomsMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageRoomsMobile.goto('http://localhost:3000/rooms', { waitUntil: 'networkidle' });
  await pageRoomsMobile.waitForTimeout(1500);
  await pageRoomsMobile.screenshot({ path: 'scripts/mobile_rooms.png', fullPage: true });
  console.log('Saved scripts/mobile_rooms.png');

  await browser.close();
  console.log('All screenshots captured successfully.');
})();
