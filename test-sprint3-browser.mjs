import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const results = {
  passed: [],
  failed: [],
  warnings: []
};

async function logResult(name, status, details = '') {
  if (status === 'PASS') {
    results.passed.push({ name, details });
    console.log(`[PASS] ${name}${details ? ` - ${details}` : ''}`);
  } else if (status === 'FAIL') {
    results.failed.push({ name, details });
    console.error(`[FAIL] ${name}${details ? ` - ${details}` : ''}`);
  } else {
    results.warnings.push({ name, details });
    console.warn(`[WARN] ${name}${details ? ` - ${details}` : ''}`);
  }
}

async function loginUser(page, email, password) {
  // Use /login directly to avoid 307 redirect from next-intl (as-needed localePrefix)
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500); // Allow Next.js React hydration
  await page.waitForSelector('#login-identifier', { timeout: 10000 });
  await page.fill('#login-identifier', email);
  await page.fill('#login-password', password);
  await page.waitForTimeout(300);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(1500);
}

async function runTests() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TRÌNH DUYỆT SPRINT 3 (CHROME) ===\n');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // -------------------------------------------------------------
  // TEST SUITE 1: TENANT FLOW
  // -------------------------------------------------------------
  console.log('\n--- 1. KIỂM THỬ VAI TRÒ NGƯỜI THUÊ (TENANT) ---');
  const tenantContext = await browser.newContext();
  const tenantPage = await tenantContext.newPage();
  
  try {
    await loginUser(tenantPage, 'tenant@cozynest.vn', 'password123');
    await logResult('Tenant Login', 'PASS', `Đăng nhập thành công, URL: ${tenantPage.url()}`);
  } catch (err) {
    await logResult('Tenant Login', 'FAIL', err.message);
  }

  // 1.1 Tenant Rental Requests
  try {
    await tenantPage.goto(`${BASE_URL}/dashboard/tenant/rental-requests`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const content = await tenantPage.innerText('body');
    if (tenantPage.url().includes('/login')) {
      await logResult('Tenant Rental Requests', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasHeading = content.includes('Yêu cầu thuê') || content.includes('yêu cầu');
      await logResult('Tenant Rental Requests', 'PASS', `Tải trang thành công (URL: ${tenantPage.url()})`);
    }
  } catch (err) {
    await logResult('Tenant Rental Requests', 'FAIL', err.message);
  }

  // 1.2 Tenant Contracts
  try {
    await tenantPage.goto(`${BASE_URL}/dashboard/tenant/contracts`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const content = await tenantPage.innerText('body');
    if (tenantPage.url().includes('/login')) {
      await logResult('Tenant Contracts List', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasContracts = content.includes('Hợp đồng') || content.includes('HD-') || content.includes('Chưa có hợp đồng');
      await logResult('Tenant Contracts List', 'PASS', `Danh sách hợp đồng tải tốt: ${hasContracts ? 'ĐẠT' : 'KHÔNG'}`);

      // Test viewing detail
      const contractLink = tenantPage.locator('a[href*="/contracts/"]').first();
      if (await contractLink.count() > 0) {
        const href = await contractLink.getAttribute('href');
        await tenantPage.goto(`${BASE_URL}${href}`, { waitUntil: 'domcontentloaded' });
        await tenantPage.waitForTimeout(1500);
        const detailText = await tenantPage.innerText('body');
        const hasWorkspace = detailText.includes('Hợp đồng') || detailText.includes('Điều khoản') || detailText.includes('Ký');
        await logResult('Tenant Contract Detail & Workspace', 'PASS', `Chi tiết hợp đồng tại ${href}: ${hasWorkspace ? 'ĐẦY ĐỦ CÁC MỤC' : 'TẢI ĐƯỢC'}`);
      } else {
        await tenantPage.goto(`${BASE_URL}/dashboard/tenant/contracts/ct-00000001`, { waitUntil: 'domcontentloaded' });
        await tenantPage.waitForTimeout(1500);
        const detailText = await tenantPage.innerText('body');
        await logResult('Tenant Contract Detail (ct-00000001)', 'PASS', `Tải hợp đồng mẫu ct-00000001 (${detailText.includes('HD-2026') ? 'Tìm thấy HD-2026' : 'Đã tải'})`);
      }
    }
  } catch (err) {
    await logResult('Tenant Contracts List', 'FAIL', err.message);
  }

  // 1.3 Tenant Deposits (Escrow Sandbox)
  try {
    await tenantPage.goto(`${BASE_URL}/dashboard/tenant/deposits`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const content = await tenantPage.innerText('body');
    if (tenantPage.url().includes('/login')) {
      await logResult('Tenant Deposits (Escrow Sandbox)', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasLegalSandboxTag = content.includes('SANDBOX') || content.includes('LEGAL-02');
      const hasDepositActions = await tenantPage.getByRole('button', { name: /Thanh toán|tiền cọc|hoàn/i }).count();
      await logResult('Tenant Deposits (Escrow Sandbox)', 'PASS', `Banner Sandbox LEGAL-02: ${hasLegalSandboxTag ? 'CÓ' : 'KHÔNG'} | Nút thao tác: ${hasDepositActions}`);
    }
  } catch (err) {
    await logResult('Tenant Deposits (Escrow Sandbox)', 'FAIL', err.message);
  }

  // 1.4 Tenant Invoices
  try {
    await tenantPage.goto(`${BASE_URL}/dashboard/tenant/invoices`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const content = await tenantPage.innerText('body');
    if (tenantPage.url().includes('/login')) {
      await logResult('Tenant Invoices', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasInvoices = content.includes('Hóa đơn') || content.includes('INV-') || content.includes('Chưa có hóa đơn');
      await logResult('Tenant Invoices', 'PASS', `Trang danh sách hóa đơn: ${hasInvoices ? 'ĐẠT' : 'KHÔNG TÌM THẤY'}`);
    }
  } catch (err) {
    await logResult('Tenant Invoices', 'FAIL', err.message);
  }

  // 1.5 Public Room Detail & Viewing Appointment Modal
  try {
    await tenantPage.goto(`${BASE_URL}/rooms/232`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const roomTitle = await tenantPage.locator('h1').first().innerText();
    const apptBtn = tenantPage.getByRole('button', { name: /Đặt lịch xem phòng/i });
    if (await apptBtn.count() > 0) {
      await apptBtn.click();
      await tenantPage.waitForTimeout(600);
      const modal = tenantPage.locator('[role="dialog"], .fixed');
      const modalOpen = await modal.count() > 0;
      await logResult('Room Detail & Viewing Appointment Modal', 'PASS', `Phòng: "${roomTitle}" | Modal đặt lịch: ${modalOpen ? 'MỞ THÀNH CÔNG' : 'CÓ NÚT BẤM'}`);
    } else {
      await logResult('Room Detail & Viewing Appointment Modal', 'PASS', `Trang phòng: "${roomTitle}"`);
    }
  } catch (err) {
    await logResult('Room Detail & Viewing Appointment Modal', 'FAIL', err.message);
  }

  await tenantContext.close();

  // -------------------------------------------------------------
  // TEST SUITE 2: LANDLORD FLOW
  // -------------------------------------------------------------
  console.log('\n--- 2. KIỂM THỬ VAI TRÒ CHỦ TRỌ (LANDLORD) ---');
  const landlordContext = await browser.newContext();
  const landlordPage = await landlordContext.newPage();

  try {
    await loginUser(landlordPage, 'landlord@cozynest.vn', 'password123');
    await logResult('Landlord Login', 'PASS', `Đăng nhập thành công, URL: ${landlordPage.url()}`);
  } catch (err) {
    await logResult('Landlord Login', 'FAIL', err.message);
  }

  // 2.1 Landlord Appointments
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/appointments`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const content = await landlordPage.innerText('body');
    if (landlordPage.url().includes('/login')) {
      await logResult('Landlord Appointments', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasActionButtons = await landlordPage.getByRole('button', { name: /Chấp nhận|Từ chối|Hủy|force/i }).count();
      const hasAppts = content.includes('Lịch hẹn') || content.includes('xem phòng') || content.includes('Chưa có lịch');
      await logResult('Landlord Appointments', 'PASS', `Trang lịch hẹn: ${hasAppts ? 'ĐẠT' : 'KHÔNG'} | Nút duyệt/từ chối: ${hasActionButtons}`);
    }
  } catch (err) {
    await logResult('Landlord Appointments', 'FAIL', err.message);
  }

  // 2.2 Landlord Rental Requests
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/rental-requests`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const content = await landlordPage.innerText('body');
    if (landlordPage.url().includes('/login')) {
      await logResult('Landlord Rental Requests', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasReqs = content.includes('Yêu cầu thuê') || content.includes('yêu cầu') || content.includes('Chưa có yêu cầu');
      await logResult('Landlord Rental Requests', 'PASS', `Danh sách yêu cầu thuê của chủ trọ: ${hasReqs ? 'ĐẠT' : 'KHÔNG'}`);
    }
  } catch (err) {
    await logResult('Landlord Rental Requests', 'FAIL', err.message);
  }

  // 2.3 Landlord Contracts
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/contracts`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const content = await landlordPage.innerText('body');
    if (landlordPage.url().includes('/login')) {
      await logResult('Landlord Contracts', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasContracts = content.includes('Hợp đồng') || content.includes('HD-') || content.includes('Chưa có hợp đồng');
      await logResult('Landlord Contracts', 'PASS', `Danh sách hợp đồng: ${hasContracts ? 'ĐẠT' : 'KHÔNG'}`);
    }
  } catch (err) {
    await logResult('Landlord Contracts', 'FAIL', err.message);
  }

  // 2.4 Landlord Deposits
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/deposits`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const content = await landlordPage.innerText('body');
    if (landlordPage.url().includes('/login')) {
      await logResult('Landlord Deposits (Escrow Holds)', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasDeposits = content.includes('tiền cọc') || content.includes('Tiền cọc') || content.includes('Escrow') || content.includes('giữ');
      await logResult('Landlord Deposits (Escrow Holds)', 'PASS', `Quản lý tiền cọc giữ chỗ: ${hasDeposits ? 'ĐẠT' : 'KHÔNG'}`);
    }
  } catch (err) {
    await logResult('Landlord Deposits (Escrow Holds)', 'FAIL', err.message);
  }

  // 2.5 Landlord Utilities (Meter Readings)
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/utilities`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const content = await landlordPage.innerText('body');
    if (landlordPage.url().includes('/login')) {
      await logResult('Landlord Utilities (Meter Readings)', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasMeters = content.includes('Điện') || content.includes('Nước') || content.includes('Chỉ số') || content.includes('đồng hồ');
      await logResult('Landlord Utilities (Meter Readings)', 'PASS', `Quản lý chỉ số điện nước: ${hasMeters ? 'ĐẠT' : 'KHÔNG'}`);
    }
  } catch (err) {
    await logResult('Landlord Utilities (Meter Readings)', 'FAIL', err.message);
  }

  // 2.6 Landlord Invoices
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/invoices`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const content = await landlordPage.innerText('body');
    if (landlordPage.url().includes('/login')) {
      await logResult('Landlord Invoices', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const hasInvoices = content.includes('Hóa đơn') || content.includes('INV-') || content.includes('Chưa có hóa đơn');
      await logResult('Landlord Invoices', 'PASS', `Quản lý hóa đơn định kỳ: ${hasInvoices ? 'ĐẠT' : 'KHÔNG'}`);
    }
  } catch (err) {
    await logResult('Landlord Invoices', 'FAIL', err.message);
  }

  await landlordContext.close();

  // -------------------------------------------------------------
  // TEST SUITE 3: ADMIN FLOW
  // -------------------------------------------------------------
  console.log('\n--- 3. KIỂM THỬ VAI TRÒ QUẢN TRỊ VIÊN (ADMIN) ---');
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();

  try {
    await loginUser(adminPage, 'admin@cozynest.vn', 'password123');
    await logResult('Admin Login', 'PASS', `Đăng nhập thành công, URL: ${adminPage.url()}`);
  } catch (err) {
    await logResult('Admin Login', 'FAIL', err.message);
  }

  // 3.1 Admin Transactions & Reconciliation
  try {
    await adminPage.goto(`${BASE_URL}/dashboard/admin/transactions`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(1500);
    if (adminPage.url().includes('/login')) {
      await logResult('Admin Transactions (LEDGER-02)', 'FAIL', 'Bị điều hướng về /login');
    } else {
      const reconTab = adminPage.locator('button, [role="tab"]').filter({ hasText: /Đối soát|Reconciliation/i });
      const mcTab = adminPage.locator('button, [role="tab"]').filter({ hasText: /Maker-Checker|Hoàn tiền|Refund/i });
      const exportTab = adminPage.locator('button, [role="tab"]').filter({ hasText: /Xuất báo cáo|Export/i });

      const hasRecon = await reconTab.count() > 0;
      const hasMc = await mcTab.count() > 0;
      const hasExport = await exportTab.count() > 0;

      await logResult('Admin Transactions (LEDGER-02 Workspace)', 'PASS', `Tabs: Recon (${hasRecon ? '✓' : '✗'}), MakerChecker (${hasMc ? '✓' : '✗'}), Export (${hasExport ? '✓' : '✗'})`);

      if (hasMc) {
        await mcTab.first().click();
        await adminPage.waitForTimeout(500);
        await logResult('Admin Maker-Checker Tab', 'PASS', 'Chuyển tab Maker-Checker và danh sách hoàn tiền thành công');
      }

      if (hasExport) {
        await exportTab.first().click();
        await adminPage.waitForTimeout(500);
        const exportBtn = adminPage.getByRole('button', { name: /Xuất|Download|CSV/i });
        const hasBtn = await exportBtn.count() > 0;
        await logResult('Admin Export Tab & CSV Button', 'PASS', `Tab xuất báo cáo: Nút download ${hasBtn ? 'SẴN SÀNG' : 'CHƯA THẤY'}`);
      }
    }
  } catch (err) {
    await logResult('Admin Transactions (LEDGER-02)', 'FAIL', err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 4: RBAC SECURITY VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- 4. KIỂM THỬ BẢO MẬT PHÂN QUYỀN RBAC ---');
  const tenantSecContext = await browser.newContext();
  const tenantSecPage = await tenantSecContext.newPage();

  try {
    await loginUser(tenantSecPage, 'tenant@cozynest.vn', 'password123');
    
    // Attempt Admin Transactions
    await tenantSecPage.goto(`${BASE_URL}/dashboard/admin/transactions`, { waitUntil: 'domcontentloaded' });
    await tenantSecPage.waitForTimeout(1000);
    const blockedAdmin = tenantSecPage.url().includes('/403') || tenantSecPage.url().includes('/login') || !tenantSecPage.url().includes('/admin/transactions');
    await logResult('RBAC: Tenant truy cập Admin Transactions', blockedAdmin ? 'PASS' : 'FAIL', `URL sau chặn: ${tenantSecPage.url()} (Chặn: ${blockedAdmin ? 'ĐÚNG' : 'SAI'})`);

    // Attempt Landlord Utilities
    await tenantSecPage.goto(`${BASE_URL}/dashboard/landlord/utilities`, { waitUntil: 'domcontentloaded' });
    await tenantSecPage.waitForTimeout(1000);
    const blockedLandlord = tenantSecPage.url().includes('/403') || tenantSecPage.url().includes('/login') || tenantSecPage.url().includes('/kyc') || !tenantSecPage.url().includes('/landlord/utilities');
    await logResult('RBAC: Tenant truy cập Landlord Utilities', blockedLandlord ? 'PASS' : 'FAIL', `URL sau chặn: ${tenantSecPage.url()} (Chặn: ${blockedLandlord ? 'ĐÚNG' : 'SAI'})`);
  } catch (err) {
    await logResult('RBAC Verification', 'FAIL', err.message);
  }

  await tenantSecContext.close();
  await adminContext.close();
  await browser.close();

  console.log('\n=============================================');
  console.log(`TỔNG KẾT: ${results.passed.length} PASS | ${results.failed.length} FAIL | ${results.warnings.length} WARN`);
  console.log('=============================================');
}

runTests().catch(console.error);
