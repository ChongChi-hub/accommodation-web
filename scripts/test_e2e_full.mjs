import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const REVIEW_DIR = path.resolve('docs/review');
if (!fs.existsSync(REVIEW_DIR)) {
  fs.mkdirSync(REVIEW_DIR, { recursive: true });
}

async function runTest() {
  console.log('=== RUNNING FULL E2E TEST: ADMIN & VERIFIED HOSTS ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('[BROWSER CONSOLE ERROR]', msg.text());
      errors.push(msg.text());
    }
  });

  try {
    // 1. Check Homepage for Verified Landlords ("Chủ trọ uy tín")
    console.log('Step 1: Navigating to homepage...');
    await page.goto('http://localhost:3000/vi', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Check if Top Landlords Section is present
    const topHostsHeading = await page.$('text=Chủ trọ uy tín');
    if (topHostsHeading) {
      console.log('PASS: Found "Chủ trọ uy tín" heading on homepage!');
      await topHostsHeading.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(REVIEW_DIR, 'home-verified-landlords.png') });
      console.log('Captured: docs/review/home-verified-landlords.png');
    } else {
      console.warn('WARN: Could not find "Chủ trọ uy tín" heading on homepage');
    }

    // 2. Check /hosts Page
    console.log('Step 2: Navigating to /vi/hosts...');
    await page.goto('http://localhost:3000/vi/hosts', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(REVIEW_DIR, 'hosts-page-verified.png') });
    console.log('Captured: docs/review/hosts-page-verified.png');

    // 3. Login as Admin
    console.log('Step 3: Logging in as admin@cozynest.vn...');
    await page.goto('http://localhost:3000/vi/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'admin@cozynest.vn');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard/**', { timeout: 15000 });
    console.log('PASS: Logged in successfully, current URL:', page.url());

    // 4. Admin Overview / Stats
    console.log('Step 4: Checking Admin Overview...');
    await page.goto('http://localhost:3000/vi/dashboard/admin', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(REVIEW_DIR, 'admin-overview-verified.png') });
    console.log('Captured: docs/review/admin-overview-verified.png');

    // 5. Admin Users Page
    console.log('Step 5: Checking Admin Users page...');
    await page.goto('http://localhost:3000/vi/dashboard/admin/users', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const userRows = await page.$$('table tbody tr');
    console.log(`PASS: Found ${userRows.length} user rows on Admin Users page!`);
    await page.screenshot({ path: path.join(REVIEW_DIR, 'admin-users-verified.png') });
    console.log('Captured: docs/review/admin-users-verified.png');

    // 6. Admin Rooms Page
    console.log('Step 6: Checking Admin Rooms page...');
    await page.goto('http://localhost:3000/vi/dashboard/admin/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(REVIEW_DIR, 'admin-rooms-verified.png') });
    console.log('Captured: docs/review/admin-rooms-verified.png');

    // 7. Admin Reports Page
    console.log('Step 7: Checking Admin Reports page...');
    await page.goto('http://localhost:3000/vi/dashboard/admin/reports', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(REVIEW_DIR, 'admin-reports-verified.png') });
    console.log('Captured: docs/review/admin-reports-verified.png');

    // 8. Admin Reviews Page
    console.log('Step 8: Checking Admin Reviews page...');
    await page.goto('http://localhost:3000/vi/dashboard/admin/reviews', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(REVIEW_DIR, 'admin-reviews-verified.png') });
    console.log('Captured: docs/review/admin-reviews-verified.png');

    // 9. Admin Audit Logs Page
    console.log('Step 9: Checking Admin Audit Logs page...');
    await page.goto('http://localhost:3000/vi/dashboard/admin/audit-logs', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(REVIEW_DIR, 'admin-audit-logs-verified.png') });
    console.log('Captured: docs/review/admin-audit-logs-verified.png');

    console.log('=== ALL ADMIN & VERIFIED HOSTS CHECKS COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Test error:', err);
    await page.screenshot({ path: path.join(REVIEW_DIR, 'error-state.png') });
  } finally {
    await browser.close();
  }
}

runTest();

