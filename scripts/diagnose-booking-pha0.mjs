import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/LE THANH CUONG/.gemini/antigravity/brain/a58b5293-0c05-4142-af20-831350631c3d';
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runDiagnosis() {
  console.log('=== STARTING PHA 0 BOOKING DIAGNOSIS ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  const networkLogs = [];
  const consoleLogs = [];

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      console.error('[BROWSER ERROR]', msg.text());
    }
  });

  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      networkLogs.push({
        event: 'REQ',
        url: req.url(),
        method: req.method(),
        postData: req.postData(),
      });
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      let body = '';
      try {
        body = await res.text();
      } catch (e) {
        body = '<unable to read body>';
      }
      networkLogs.push({
        event: 'RES',
        url: res.url(),
        status: res.status(),
        body: body.substring(0, 500),
      });
    }
  });

  try {
    // 1. Đăng nhập Tenant
    console.log('\n--- Bước 1: Đăng nhập Tenant ---');
    await page.goto('http://localhost:3000/vi/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Tìm ô nhập tài khoản
    const idInput = page.locator('input[autocomplete="username"], input[type="text"]').first();
    await idInput.fill('tenant@cozynest.vn');
    
    // Tìm ô nhập mật khẩu
    const pwdInput = page.locator('input[type="password"]').first();
    await pwdInput.fill('password123');
    
    // Bấm đăng nhập
    const loginBtn = page.locator('button[type="submit"]').first();
    await loginBtn.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pha0-01-tenant-login.png'), fullPage: true });
    console.log('Đã đăng nhập và chụp ảnh login.');

    // 2. Mở chi tiết phòng
    console.log('\n--- Bước 2: Mở chi tiết phòng ---');
    const roomUrl = 'http://localhost:3000/vi/rooms/studio-view-bien-da-nang-232';
    await page.goto(roomUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pha0-02-room-detail.png'), fullPage: true });
    console.log('Đã mở trang chi tiết phòng và chụp ảnh.');

    // 3. Đặt lịch xem phòng
    console.log('\n--- Bước 3: Thử Đặt Lịch Xem Phòng ---');
    const apptBtn = page.locator('button:has-text("Đặt lịch xem phòng"), button:has-text("Đặt lịch xem")').first();
    const apptVisible = await apptBtn.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Nút Đặt lịch xem visible:', apptVisible);

    if (apptVisible) {
      await apptBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pha0-03-appointment-modal.png') });

      // Điền form hẹn
      const dateInput = page.locator('input[type="date"], input[name*="date"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.fill('2026-11-20');
      }
      const noteInput = page.locator('textarea').first();
      if (await noteInput.isVisible()) {
        await noteInput.fill('Pha 0 test: kiểm tra đặt lịch xem phòng');
      }

      const submitBtn = page.locator('button[type="submit"]:has-text("Xác nhận"), button[type="submit"]:has-text("đặt lịch")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pha0-04-appointment-submitted.png') });
    }

    // 4. Đặt thuê phòng
    console.log('\n--- Bước 4: Thử Đặt Thuê Phòng ---');
    await page.goto(roomUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const rentBtn = page.locator('button:has-text("Gửi yêu cầu thuê"), button:has-text("Đặt thuê")').first();
    const rentVisible = await rentBtn.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Nút Đặt thuê visible:', rentVisible);

    if (rentVisible) {
      await rentBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pha0-05-rental-modal.png') });

      const dateInput = page.locator('input[type="date"], input[name*="date"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.fill('2026-12-01');
      }
      const occInput = page.locator('input[type="number"]').first();
      if (await occInput.isVisible()) {
        await occInput.fill('2');
      }
      const noteInput = page.locator('textarea').first();
      if (await noteInput.isVisible()) {
        await noteInput.fill('Pha 0 test: kiểm tra đặt thuê phòng');
      }

      const submitBtn = page.locator('button[type="submit"]:has-text("Gửi yêu cầu"), button[type="submit"]:has-text("yêu cầu")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pha0-06-rental-submitted.png') });
    }

    // 5. Kiểm tra dashboard tenant
    console.log('\n--- Bước 5: Mở Dashboard Tenant Kiểm Tra Danh Sách Đơn ---');
    await page.goto('http://localhost:3000/vi/dashboard/tenant/appointments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pha0-07-tenant-appointments.png'), fullPage: true });

  } catch (err) {
    console.error('Lỗi trong quá trình chẩn đoán:', err);
  } finally {
    await browser.close();
  }

  console.log('\n=== NETWORK ACTIVITY SUMMARY ===');
  for (const n of networkLogs) {
    if (n.event === 'REQ') {
      console.log(`[REQ] ${n.method} ${n.url} - Data: ${n.postData || '(none)'}`);
    } else {
      console.log(`[RES] ${n.status} ${n.url} - Body: ${n.body}`);
    }
  }

  console.log('\n=== CONSOLE ERRORS ===');
  for (const c of consoleLogs.filter((l) => l.type === 'error')) {
    console.log(`[CONSOLE ERROR] ${c.text}`);
  }
}

runDiagnosis();
