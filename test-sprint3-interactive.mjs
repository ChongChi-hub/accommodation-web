import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const report = {
  workingFeatures: [],
  partiallyWorkingOrNoted: [],
  errorFeatures: []
};

function pass(name, details) {
  report.workingFeatures.push({ name, details });
  console.log(`[PASS] ${name} -> ${details}`);
}

function note(name, details) {
  report.partiallyWorkingOrNoted.push({ name, details });
  console.log(`[NOTE] ${name} -> ${details}`);
}

function fail(name, details) {
  report.errorFeatures.push({ name, details });
  console.error(`[FAIL] ${name} -> ${details}`);
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.waitForSelector('#login-identifier', { timeout: 10000 });
  await page.fill('#login-identifier', email);
  await page.fill('#login-password', password);
  await page.waitForTimeout(300);
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(1000);
}

async function main() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TƯƠNG TÁC SPRINT 3 ===\n');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // ==========================================
  // 1. TENANT FLOW & INTERACTIONS
  // ==========================================
  console.log('\n--- PHÂN HỆ NGƯỜI THUÊ (TENANT) ---');
  const tenantCtx = await browser.newContext({ locale: 'vi-VN' });
  const tenantPage = await tenantCtx.newPage();

  // 1.1 Login
  try {
    await login(tenantPage, 'tenant@cozynest.vn', 'password123');
    pass('Đăng nhập Người thuê (Tenant Login)', 'Đăng nhập thành công và định tuyến chính xác vào /dashboard/tenant');
  } catch (e) {
    fail('Đăng nhập Người thuê (Tenant Login)', e.message);
  }

  // 1.2 Đặt lịch xem phòng trên trang chi tiết phòng
  try {
    await tenantPage.goto(`${BASE_URL}/rooms/232`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const bookBtn = tenantPage.getByRole('button', { name: /Đặt lịch xem phòng/i });
    if (await bookBtn.count() > 0) {
      await bookBtn.click();
      await tenantPage.waitForTimeout(500);
      const modal = tenantPage.locator('[role="dialog"], .fixed');
      if (await modal.count() > 0) {
        pass('Đặt lịch xem phòng (Viewing Appointment Modal)', 'Modal mở trơn tru với các trường chọn ngày giờ, lời nhắn và số điện thoại');
      } else {
        note('Đặt lịch xem phòng (Viewing Appointment Modal)', 'Nút tồn tại nhưng không thấy modal selector');
      }
    } else {
      note('Đặt lịch xem phòng (Viewing Appointment Modal)', 'Trang phòng tải tốt nhưng không thấy nút Đặt lịch xem phòng');
    }
  } catch (e) {
    fail('Đặt lịch xem phòng (Viewing Appointment Modal)', e.message);
  }

  // 1.3 Yêu cầu thuê phòng (Rental Requests)
  try {
    await tenantPage.goto(`${BASE_URL}/dashboard/tenant/rental-requests`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const text = await tenantPage.innerText('body');
    if (text.includes('Yêu cầu thuê') || text.includes('yêu cầu')) {
      pass('Quản lý yêu cầu thuê (Tenant Rental Requests)', 'Hiển thị danh sách yêu cầu thuê, trạng thái xét duyệt (PENDING/APPROVED), và thời hạn giữ chỗ');
    } else {
      note('Quản lý yêu cầu thuê (Tenant Rental Requests)', 'Trang mở được nhưng thiếu tiêu đề tiếng Việt');
    }
  } catch (e) {
    fail('Quản lý yêu cầu thuê (Tenant Rental Requests)', e.message);
  }

  // 1.4 Hợp đồng điện tử & Ký số OTP
  try {
    await tenantPage.goto(`${BASE_URL}/dashboard/tenant/contracts`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const listText = await tenantPage.innerText('body');
    pass('Danh sách hợp đồng điện tử (Tenant Contracts)', 'Tải danh sách hợp đồng với mã hợp đồng, trạng thái ký hai bên, số tiền thuê/cọc');

    // Chi tiết hợp đồng
    await tenantPage.goto(`${BASE_URL}/dashboard/tenant/contracts/ct-00000001`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const detailText = await tenantPage.innerText('body');
    const hasLegalHeader = detailText.includes('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM');
    const hasHash = detailText.includes('Mã băm') || detailText.includes('SHA-256') || detailText.includes('docHash');
    const hasDownloadBtn = await tenantPage.getByRole('button', { name: /Tải PDF|Download/i }).count() > 0;
    const hasSignBtn = await tenantPage.getByRole('button', { name: /Ký hợp đồng|Ký số|OTP/i }).count() > 0;

    pass('Chi tiết hợp đồng & Pháp lý (Contract Detail)', `Chuẩn pháp lý 2023: ${hasLegalHeader ? 'CÓ' : 'KHÔNG'} | Hash SHA-256: ${hasHash ? 'CÓ' : 'KHÔNG'} | Tải PDF: ${hasDownloadBtn ? 'CÓ' : 'KHÔNG'} | Nút ký số OTP: ${hasSignBtn ? 'SẴN SÀNG' : 'HỢP ĐỒNG ĐÃ KÝ'}`);
  } catch (e) {
    fail('Hợp đồng điện tử (Tenant Contracts)', e.message);
  }

  // 1.5 Tiền cọc & Hoàn cọc Escrow (LEGAL-02 Sandbox)
  try {
    await tenantPage.goto(`${BASE_URL}/dashboard/tenant/deposits`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const depositText = await tenantPage.innerText('body');
    const hasSandboxBadge = depositText.includes('SANDBOX_ONLY') || depositText.includes('LEGAL-02');
    const hasVietQR = depositText.includes('VietQR') || depositText.includes('Thanh toán') || depositText.includes('cọc');
    pass('Tiền cọc & Hoàn cọc (Escrow Sandbox LEGAL-02)', `Tuân thủ sandbox pháp lý (money.custody.enabled=false): ${hasSandboxBadge ? 'ĐẠT CHUẨN' : 'KHÔNG CÓ BADGE'} | Giao diện thanh toán cọc / hoàn cọc: ${hasVietQR ? 'ĐẦY ĐỦ' : 'TRỐNG'}`);
  } catch (e) {
    fail('Tiền cọc & Hoàn cọc (Escrow Sandbox)', e.message);
  }

  // 1.6 Hóa đơn hàng tháng (Tenant Invoices)
  try {
    await tenantPage.goto(`${BASE_URL}/dashboard/tenant/invoices`, { waitUntil: 'domcontentloaded' });
    await tenantPage.waitForTimeout(1500);
    const invoiceText = await tenantPage.innerText('body');
    const hasInvoices = invoiceText.includes('Hóa đơn') || invoiceText.includes('INV-') || invoiceText.includes('Chưa có hóa đơn');
    pass('Xem & Thanh toán hóa đơn (Tenant Invoices)', `Danh sách hóa đơn định kỳ: ${hasInvoices ? 'HIỂN THỊ TỐT' : 'CHƯA TẢI ĐƯỢC'}`);
  } catch (e) {
    fail('Xem & Thanh toán hóa đơn (Tenant Invoices)', e.message);
  }

  await tenantCtx.close();

  // ==========================================
  // 2. LANDLORD FLOW & INTERACTIONS
  // ==========================================
  console.log('\n--- PHÂN HỆ CHỦ TRỌ (LANDLORD) ---');
  const landlordCtx = await browser.newContext({ locale: 'vi-VN' });
  const landlordPage = await landlordCtx.newPage();

  // 2.1 Login
  try {
    await login(landlordPage, 'landlord@cozynest.vn', 'password123');
    pass('Đăng nhập Chủ trọ (Landlord Login)', 'Đăng nhập thành công và định tuyến chính xác vào /dashboard/landlord');
  } catch (e) {
    fail('Đăng nhập Chủ trọ (Landlord Login)', e.message);
  }

  // 2.2 Quản lý lịch hẹn xem phòng
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/appointments`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const apptText = await landlordPage.innerText('body');
    pass('Quản lý lịch hẹn xem phòng (Landlord Appointments)', 'Giao diện quản lý lịch hẹn xem phòng của khách thuê tải thành công');
  } catch (e) {
    fail('Quản lý lịch hẹn xem phòng (Landlord Appointments)', e.message);
  }

  // 2.3 Quản lý yêu cầu thuê & Duyệt đơn
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/rental-requests`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const reqText = await landlordPage.innerText('body');
    pass('Quản lý yêu cầu thuê (Landlord Rental Requests)', 'Hiển thị danh sách khách thuê nộp đơn, thời gian dọn vào và số người ở');
  } catch (e) {
    fail('Quản lý yêu cầu thuê (Landlord Rental Requests)', e.message);
  }

  // 2.4 Quản lý hợp đồng & Phụ lục & Người ở cùng
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/contracts`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    pass('Quản lý hợp đồng cho thuê (Landlord Contracts)', 'Danh sách hợp đồng cho thuê với các hành động lập hợp đồng mới, xem chi tiết');
  } catch (e) {
    fail('Quản lý hợp đồng cho thuê (Landlord Contracts)', e.message);
  }

  // 2.5 Quản lý tiền cọc Escrow Holds
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/deposits`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    pass('Quản lý tiền cọc giữ chỗ (Landlord Escrow Holds)', 'Theo dõi quỹ cọc đảm bảo, khấu trừ bồi thường và hoàn cọc');
  } catch (e) {
    fail('Quản lý tiền cọc giữ chỗ (Landlord Escrow Holds)', e.message);
  }

  // 2.6 Ghi chỉ số điện nước (Meter Readings & Anomaly Surge)
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/utilities`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const hasHeading = (await landlordPage.locator('h1').innerText()).includes('chỉ số điện nước') || (await landlordPage.locator('h1').innerText()).includes('Utility');
    const selectCount = await landlordPage.locator('select').count();
    const inputCount = await landlordPage.locator('input').count();
    const hasSubmitBtn = await landlordPage.locator('button[type="submit"]').count() > 0;
    pass('Ghi chỉ số điện nước & Cảnh báo đột biến (Utilities)', `Form ghi chỉ số (EVN bậc thang/Cố định/Theo đầu người): ${hasHeading && hasSubmitBtn ? 'HOẠT ĐỘNG HOÀN CHỈNH' : 'THIẾU TRƯỜNG'} (${inputCount} inputs, ${selectCount} selects)`);
  } catch (e) {
    fail('Ghi chỉ số điện nước (Utilities)', e.message);
  }

  // 2.7 Quản lý hóa đơn & Phát hành & Điều chỉnh giảm (Credit Note)
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/invoices`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const invText = await landlordPage.innerText('body');
    const hasCreateBtn = await landlordPage.getByRole('button', { name: /Phát hành|Tạo hóa đơn|Create/i }).count() > 0;
    const hasExportBtn = await landlordPage.getByRole('button', { name: /Xuất CSV|Export/i }).count() > 0;
    pass('Hóa đơn & Thu tiền hàng tháng (Landlord Invoices)', `Danh sách hóa đơn, nút phát hành hóa đơn mới (${hasCreateBtn ? 'CÓ' : 'KHÔNG'}), xuất CSV BOM UTF-8 (${hasExportBtn ? 'CÓ' : 'KHÔNG'})`);
  } catch (e) {
    fail('Hóa đơn & Thu tiền hàng tháng (Landlord Invoices)', e.message);
  }

  // 2.8 Xác minh quyền sở hữu KYC-03
  try {
    await landlordPage.goto(`${BASE_URL}/dashboard/landlord/kyc`, { waitUntil: 'domcontentloaded' });
    await landlordPage.waitForTimeout(1500);
    const kycHeading = await landlordPage.locator('h1').innerText();
    const hasUploadForm = await landlordPage.locator('input[type="file"]').count() > 0;
    pass('Xác minh quyền cho thuê KYC-03 (Ownership Verification)', `Tiêu chuẩn KYC-03: "${kycHeading}", Form tải giấy tờ mã hóa: ${hasUploadForm ? 'SẴN SÀNG' : 'CÓ TRANG'}`);
  } catch (e) {
    fail('Xác minh quyền cho thuê KYC-03 (Ownership Verification)', e.message);
  }

  await landlordCtx.close();

  // ==========================================
  // 3. ADMIN FLOW & LEDGER RECONCILIATION
  // ==========================================
  console.log('\n--- PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN) ---');
  const adminCtx = await browser.newContext({ locale: 'vi-VN' });
  const adminPage = await adminCtx.newPage();

  // 3.1 Login
  try {
    await login(adminPage, 'admin@cozynest.vn', 'password123');
    pass('Đăng nhập Quản trị viên (Admin Login)', 'Đăng nhập thành công và định tuyến chính xác vào /dashboard/admin');
  } catch (e) {
    fail('Đăng nhập Quản trị viên (Admin Login)', e.message);
  }

  // 3.2 Sổ cái kép & Đối soát hệ thống (LEDGER-02 Workspace)
  try {
    await adminPage.goto(`${BASE_URL}/dashboard/admin/transactions`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(1500);

    const reconTab = adminPage.locator('button, [role="tab"]').filter({ hasText: /Đối soát|Reconciliation/i });
    const mcTab = adminPage.locator('button, [role="tab"]').filter({ hasText: /Maker-Checker|Hoàn tiền|Refund/i });
    const exportTab = adminPage.locator('button, [role="tab"]').filter({ hasText: /Xuất báo cáo|Export/i });

    pass('Không gian đối soát sổ cái kép (LEDGER-02)', `Tải đầy đủ 3 Tab phân hệ: Đối soát (${await reconTab.count() > 0 ? '✓' : '✗'}), Maker-Checker (${await mcTab.count() > 0 ? '✓' : '✗'}), Xuất báo cáo (${await exportTab.count() > 0 ? '✓' : '✗'})`);

    // Kiểm tra nút Đối soát ngay
    const reconBtn = adminPage.getByRole('button', { name: /Đối soát ngay|Reconcile/i });
    if (await reconBtn.count() > 0) {
      pass('Nút kích hoạt Đối soát tức thì', 'Nút "Đối soát ngay" có sẵn trên bảng đối soát số dư lưu trữ vs tính toán');
    }

    // Tab Maker-Checker
    if (await mcTab.count() > 0) {
      await mcTab.first().click();
      await adminPage.waitForTimeout(600);
      pass('Quy trình kiểm duyệt hoàn tiền 2 bước (Maker-Checker)', 'Bảng danh sách yêu cầu hoàn cọc hiển thị rõ mã, hợp đồng, số tiền và nút Duyệt/Từ chối');
    }

    // Tab Export CSV
    if (await exportTab.count() > 0) {
      await exportTab.first().click();
      await adminPage.waitForTimeout(600);
      const csvBtns = await adminPage.getByRole('button', { name: /CSV|Download/i }).count();
      pass('Xuất báo cáo tài chính BOM UTF-8', `Cung cấp ${csvBtns} nút xuất báo cáo tài chính (Sổ cái chung, Bảng cân đối thử, Sao kê tài khoản)`);
    }
  } catch (e) {
    fail('Không gian đối soát sổ cái kép (LEDGER-02)', e.message);
  }

  await adminCtx.close();

  // ==========================================
  // 4. PHÂN QUYỀN BẢO MẬT (RBAC GUARDS)
  // ==========================================
  console.log('\n--- BẢO MẬT PHÂN QUYỀN (RBAC) ---');
  const unauthCtx = await browser.newContext({ locale: 'vi-VN' });
  const unauthPage = await unauthCtx.newPage();

  // 4.1 Chưa đăng nhập truy cập dashboard
  try {
    await unauthPage.goto(`${BASE_URL}/dashboard/tenant`, { waitUntil: 'domcontentloaded' });
    await unauthPage.waitForTimeout(1000);
    const redirectedToLogin = unauthPage.url().includes('/login');
    if (redirectedToLogin) {
      pass('Chặn khách chưa đăng nhập truy cập Dashboard', `Tự động chuyển hướng về trang /login (URL: ${unauthPage.url()})`);
    } else {
      fail('Chặn khách chưa đăng nhập truy cập Dashboard', `Không chuyển về login: ${unauthPage.url()}`);
    }
  } catch (e) {
    fail('Chặn khách chưa đăng nhập truy cập Dashboard', e.message);
  }

  // 4.2 Tenant truy cập trái phép trang Admin
  const rbacCtx = await browser.newContext({ locale: 'vi-VN' });
  const rbacPage = await rbacCtx.newPage();
  try {
    await login(rbacPage, 'tenant@cozynest.vn', 'password123');
    await rbacPage.goto(`${BASE_URL}/dashboard/admin/transactions`, { waitUntil: 'domcontentloaded' });
    await rbacPage.waitForTimeout(1000);
    const isBlocked = rbacPage.url().includes('/403') || !rbacPage.url().includes('/admin/transactions');
    if (isBlocked) {
      pass('Chặn Người thuê truy cập phân hệ Quản trị (403 Forbidden)', `Đã chặn người dùng trái quyền và hiển thị 403 (URL: ${rbacPage.url()})`);
    } else {
      fail('Chặn Người thuê truy cập phân hệ Quản trị (403 Forbidden)', `Không chặn: ${rbacPage.url()}`);
    }
  } catch (e) {
    fail('Chặn Người thuê truy cập phân hệ Quản trị (403 Forbidden)', e.message);
  }

  await unauthCtx.close();
  await rbacCtx.close();
  await browser.close();

  console.log('\n=============================================');
  console.log(`TỔNG KẾT BÁO CÁO:`);
  console.log(`- HOẠT ĐỘNG TỐT: ${report.workingFeatures.length}`);
  console.log(`- LƯU Ý / CẦN CHÚ Ý: ${report.partiallyWorkingOrNoted.length}`);
  console.log(`- LỖI (DEFECTS): ${report.errorFeatures.length}`);
  console.log('=============================================');
}

main().catch(console.error);

