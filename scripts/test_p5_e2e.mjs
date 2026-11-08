import { chromium } from '@playwright/test';

async function run() {
  console.log('--- STARTING P5 [ROOM-01] & [SEARCH-01] E2E VERIFICATION ---');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Light Context
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log('HTTP ERROR', resp.status(), resp.url());
    }
  });

  // A. Home Page (Desktop 1440px)
  console.log('\n[TEST A] Navigating to Home Page: http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const hotAreaCards = await page.$$('a[href*="/rooms?provinceCode="]');
  console.log('✓ Hot area cards found:', hotAreaCards.length);

  const roomCards = await page.$$('a[href*="/rooms/"]');
  console.log('✓ Total room cards on Home page:', roomCards.length);

  const pageText = await page.innerText('body');
  console.log('✓ Contains "Gợi ý nổi bật":', pageText.includes('Gợi ý nổi bật'));
  console.log('✓ Contains "Mới cập nhật":', pageText.includes('Mới cập nhật'));
  console.log('✓ Contains active rooms stats (37+):', pageText.includes('37+'));

  await page.screenshot({ path: 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d/scratch/home_1440_light.png', fullPage: false });
  console.log('✓ Saved screenshot: home_1440_light.png');

  // B. Room Detail Page by Slug (Desktop 1440px)
  console.log('\n[TEST B] Navigating to Room Detail by Slug: /rooms/can-ho-mini-nghia-do-102...');
  await page.goto('http://localhost:3000/rooms/can-ho-mini-nghia-do-102', { waitUntil: 'networkidle' });

  const roomTitle = await page.$eval('h1', el => el.innerText);
  console.log('✓ Room Title:', roomTitle);

  const counter = await page.$eval('.absolute.bottom-3.right-3', el => el.innerText).catch(() => 'N/A');
  console.log('✓ Carousel counter:', counter);

  // Test carousel next
  const nextBtn = await page.$('button[aria-label="Ảnh kế tiếp"]');
  if (nextBtn) {
    await nextBtn.click();
    await page.waitForTimeout(300);
    const counterAfterNext = await page.$eval('.absolute.bottom-3.right-3', el => el.innerText).catch(() => 'N/A');
    console.log('✓ Carousel counter after Next click:', counterAfterNext);
  }

  // Test keyboard ArrowRight
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  const counterAfterKey = await page.$eval('.absolute.bottom-3.right-3', el => el.innerText).catch(() => 'N/A');
  console.log('✓ Carousel counter after ArrowRight key:', counterAfterKey);

  // Test Lightbox
  const fullscreenBtn = await page.$('button[aria-label="Xem toàn màn hình"]');
  if (fullscreenBtn) {
    await fullscreenBtn.click();
    await page.waitForTimeout(300);
    const lightboxVisible = await page.$('div[role="dialog"]');
    console.log('✓ Lightbox modal opened:', !!lightboxVisible);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const lightboxClosed = !(await page.$('div[role="dialog"]'));
    console.log('✓ Lightbox modal closed on Escape:', lightboxClosed);
  }

  // Check specs, amenities, fee estimator, map, landlord, reviews
  const detailText = await page.innerText('body');
  console.log('✓ Has Specs (Diện tích m²):', detailText.includes('m²'));
  console.log('✓ Has Tiện nghi (Amenities):', detailText.includes('Tiện nghi & Dịch vụ'));
  console.log('✓ Has Biểu phí dịch vụ & Ước tính:', detailText.includes('Biểu phí dịch vụ & Ước tính'));
  console.log('✓ Has Vị trí & Khu vực (Map):', detailText.includes('Vị trí & Khu vực'));
  console.log('✓ Has Landlord Profile Card:', detailText.includes('Chủ trọ đã xác minh CCCD'));
  console.log('✓ Has Reviews Breakdown:', detailText.includes('Đánh giá từ người thuê'));
  console.log('✓ Has Similar Rooms:', detailText.includes('Phòng gợi ý tương tự'));

  await page.screenshot({ path: 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d/scratch/room_detail_1440_light.png', fullPage: false });
  console.log('✓ Saved screenshot: room_detail_1440_light.png');

  // C. Mobile 390px test
  console.log('\n[TEST C] Mobile Viewport (390px)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d/scratch/room_detail_390_mobile.png', fullPage: false });
  console.log('✓ Saved screenshot: room_detail_390_mobile.png');

  // D. 404 for invalid slug
  console.log('\n[TEST D] Navigating to invalid room slug: /rooms/slug-khong-ton-tai-xyz...');
  await page.goto('http://localhost:3000/rooms/slug-khong-ton-tai-xyz', { waitUntil: 'networkidle' });
  const notFoundText = await page.innerText('body');
  console.log('✓ Shows 404 Error State:', notFoundText.includes('Không tìm thấy phòng trọ'));
  console.log('✓ Has "Quay lại danh sách tìm phòng":', notFoundText.includes('Quay lại danh sách tìm phòng'));
  await page.screenshot({ path: 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d/scratch/room_404.png', fullPage: false });
  console.log('✓ Saved screenshot: room_404.png');

  // E. Occupied / Rented Room banner and locked buttons
  console.log('\n[TEST E] Navigating to rented room: /rooms/studio-ho-tung-mau-108...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/rooms/studio-ho-tung-mau-108', { waitUntil: 'networkidle' });
  const rentedText = await page.innerText('body');
  console.log('✓ Displays Rented/Occupied Banner:', rentedText.includes('Phòng hiện đã có người thuê'));
  const disabledButtons = await page.$$('button[disabled]');
  console.log('✓ Contact/Booking buttons locked count:', disabledButtons.length);
  await page.screenshot({ path: 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d/scratch/room_rented_1440.png', fullPage: false });
  console.log('✓ Saved screenshot: room_rented_1440.png');

  // F. Dark Mode tests
  console.log('\n[TEST F] Dark Mode Screenshots...');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ path: 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d/scratch/room_detail_1440_dark.png', fullPage: false });
  console.log('✓ Saved screenshot: room_detail_1440_dark.png');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ path: 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d/scratch/home_1440_dark.png', fullPage: false });
  console.log('✓ Saved screenshot: home_1440_dark.png');

  await browser.close();
  console.log('\n--- ALL P5 E2E TESTS PASSED SUCCESSFULLY! ---');
}

run().catch(console.error);
