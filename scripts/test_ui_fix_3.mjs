import { chromium } from 'playwright';
import path from 'path';

const artDir = 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d';

(async () => {
  console.log('=== RUNNING UI-FIX-3 PLAYWRIGHT VERIFICATION & VISUAL CAPTURE ===');
  const browser = await chromium.launch({ headless: true });

  // 1. Test 308 Redirect: /rooms/128 -> /rooms/lieu-giai-128
  console.log('Testing 308 redirect for /rooms/128 ...');
  const testPage = await browser.newPage();
  const resp = await testPage.goto('http://localhost:3000/rooms/128', { waitUntil: 'networkidle' });
  const finalUrl = testPage.url();
  console.log(`Initial URL: /rooms/128 -> Final URL: ${finalUrl}`);
  if (!finalUrl.includes('/rooms/lieu-giai-128')) {
    throw new Error(`Expected redirect to /rooms/lieu-giai-128 but got: ${finalUrl}`);
  }
  await testPage.close();

  // 2. Desktop 1440px Inspection
  console.log('Inspecting Desktop 1440px ...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await desktopContext.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://localhost:3000/rooms/lieu-giai-128', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check room type translation
  const roomTypeBadge = await page.locator('#gallery').evaluate(() => {
    const el = document.querySelector('span[class*="Badge"], div[class*="Badge"]');
    return el ? el.innerText : '';
  });
  console.log('Room type badge text:', roomTypeBadge);

  // Bounding box test: Check Sidebar Action Buttons
  const buttonBoundingBoxes = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside button, div[class*="Card"] button, div[class*="Card"] div button'));
    return buttons.map(btn => {
      const rect = btn.getBoundingClientRect();
      const svg = btn.querySelector('svg');
      const textSpan = btn.querySelector('span');
      const svgRect = svg ? svg.getBoundingClientRect() : null;
      const textRect = textSpan ? textSpan.getBoundingClientRect() : null;

      let sameRow = false;
      let centerDiff = 0;
      if (svgRect && textRect) {
        const svgCenterY = svgRect.top + svgRect.height / 2;
        const textCenterY = textRect.top + textRect.height / 2;
        centerDiff = Math.abs(svgCenterY - textCenterY);
        sameRow = centerDiff <= 4; // Center alignment tolerance
      }

      return {
        text: btn.innerText.replace(/\n/g, ' ').trim(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        hasSvg: !!svg,
        sameRow,
        centerDiff: Math.round(centerDiff * 10) / 10,
      };
    });
  });

  console.log('BUTTON BOUNDING BOXES (Sample):');
  buttonBoundingBoxes.slice(0, 5).forEach((b, i) => {
    console.log(`[Button ${i + 1}] "${b.text}" -> height: ${b.height}px, sameRow: ${b.sameRow}, centerDiff: ${b.centerDiff}px`);
  });

  // Verify Share button bounding box
  const shareBtnBox = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Chia sẻ'));
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    const svg = btn.querySelector('svg');
    const svgRect = svg ? svg.getBoundingClientRect() : null;
    return {
      text: btn.innerText.trim(),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      hasSvg: !!svg,
      svgLeft: svgRect ? Math.round(svgRect.left) : 0,
      btnLeft: Math.round(rect.left),
    };
  });
  console.log('SHARE BUTTON TEST:', JSON.stringify(shareBtnBox));

  // Capture Desktop screenshots: Top, Middle, Bottom
  console.log('Capturing Desktop screenshots (top, middle, bottom) ...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artDir, 'desktop_room_detail_top.png') });

  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artDir, 'desktop_room_detail_middle.png') });

  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artDir, 'desktop_room_detail_bottom.png') });

  // 3. Mobile 390px Inspection
  console.log('Inspecting Mobile 390px ...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/rooms/lieu-giai-128', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);

  // Check mobile fixed bottom bar
  const mobileBottomBar = await mobilePage.evaluate(() => {
    const bar = document.querySelector('div[class*="fixed bottom-0"]');
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    const btn = bar.querySelector('button');
    return {
      exists: true,
      height: Math.round(rect.height),
      buttonText: btn ? btn.innerText.trim() : '',
    };
  });
  console.log('MOBILE BOTTOM BAR TEST:', JSON.stringify(mobileBottomBar));

  // Capture Mobile screenshots: Top, Middle, Bottom
  console.log('Capturing Mobile screenshots (top, middle, bottom) ...');
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(artDir, 'mobile_room_detail_top.png') });

  await mobilePage.evaluate(() => window.scrollTo(0, 700));
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(artDir, 'mobile_room_detail_middle.png') });

  await mobilePage.evaluate(() => window.scrollTo(0, 1500));
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(artDir, 'mobile_room_detail_bottom.png') });

  console.log(`CONSOLE ERRORS COUNT: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }

  await browser.close();
  console.log('=== TEST & CAPTURE COMPLETED SUCCESSFULLY ===');
})();
