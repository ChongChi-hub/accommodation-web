import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.addInitScript(() => {
    localStorage.setItem('toam_access_token', 'mock_admin_token');
    localStorage.setItem('toam_user', JSON.stringify({
      id: 'usr_admin_1',
      email: 'admin@toam.vn',
      fullName: 'Quản Trị Viên',
      phone: '0901234567',
      roles: ['ADMIN'],
      isKycVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    }));
  });

  console.log('=== DIAGNOSTIC AT 1440px ===');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/dashboard/admin', { waitUntil: 'networkidle' });
  
  const lightStyles = await page.evaluate(() => {
    const body = document.querySelector('body');
    const main = document.querySelector('main');
    const sidebar = document.querySelector('aside');
    return {
      bodyBg: window.getComputedStyle(body).backgroundColor,
      bodyFont: window.getComputedStyle(body).fontFamily,
      sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : null,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  console.log('Light 1440:', JSON.stringify(lightStyles, null, 2));

  // Check dark mode
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const darkStyles = await page.evaluate(() => {
    const body = document.querySelector('body');
    const card = document.querySelector('[class*="bg-white"], [class*="bg-surface"]') || document.querySelector('main > div');
    const h1 = document.querySelector('h1');
    return {
      bodyBg: window.getComputedStyle(body).backgroundColor,
      bodyColor: window.getComputedStyle(body).color,
      h1Color: h1 ? window.getComputedStyle(h1).color : null,
      cardBg: card ? window.getComputedStyle(card).backgroundColor : 'none',
      cardColor: card ? window.getComputedStyle(card).color : 'none',
    };
  });
  console.log('Dark 1440:', JSON.stringify(darkStyles, null, 2));

  console.log('=== DIAGNOSTIC AT 390px ===');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  const mobileOverview = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    const main = document.querySelector('main');
    const header = document.querySelector('header');
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      sidebarDisplay: sidebar ? window.getComputedStyle(sidebar).display : 'none',
      sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : null,
      mainWidth: main ? main.getBoundingClientRect().width : null,
      headerWidth: header ? header.getBoundingClientRect().width : null,
    };
  });
  console.log('Mobile 390 Overview:', JSON.stringify(mobileOverview, null, 2));

  // Check rooms at 390px
  await page.goto('http://localhost:3000/dashboard/admin/rooms', { waitUntil: 'networkidle' });
  const mobileRooms = await page.evaluate(() => {
    const table = document.querySelector('table');
    const main = document.querySelector('main');
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      tableWidth: table ? table.getBoundingClientRect().width : null,
      mainWidth: main ? main.getBoundingClientRect().width : null,
    };
  });
  console.log('Mobile 390 Rooms:', JSON.stringify(mobileRooms, null, 2));

  await browser.close();
}

run().catch(console.error);

