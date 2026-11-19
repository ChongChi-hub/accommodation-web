import { test, expect, Page } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

const SHOT_DIR = 'docs/screenshots/wallet-verify-ledger';

async function setTheme(page: Page, dark: boolean) {
  await page.evaluate((isDark) => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    localStorage.setItem('cookie_consent', 'accepted');
  }, dark);
  const acceptBtn = page.getByRole('button', { name: /Chấp nhận tất cả/i });
  if (await acceptBtn.isVisible().catch(() => false)) {
    await acceptBtn.click();
  }
  await page.waitForTimeout(200);
}

test.describe('[WALLET-VERIFY-LEDGER] UI & Visual Verification', () => {
  test('Tenant deposits: short ref, locked check-in, 50% retained deposit, light/dark/mobile', async ({ context, page }) => {
    await authenticateAs(context, page, 'tenant@cozynest.vn');
    await page.route('**/api/v1/billing/escrow/tenant', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [
        {
          id: 'esc-1', contractId: 'd8082a0f-c5c9-4d62-9016-1e493f66057c',
          tenantId: 'u-tenant-01', landlordId: 'u-landlord-01',
          amount: 10000, releasedAmount: 0, retainedAmount: 10000,
          status: 'AWAITING_DEPOSIT', tenantConfirmedMoveIn: false, landlordConfirmedMoveIn: false,
          createdAt: '2026-11-19T08:00:00Z',
        },
        {
          id: 'esc-2', contractId: '9fccca0f-e9f8-44ab-ae58-d8478b771a4f',
          tenantId: 'u-tenant-01', landlordId: 'u-landlord-01',
          amount: 1000000, releasedAmount: 500000, retainedAmount: 500000,
          status: 'PARTIALLY_RELEASED', tenantConfirmedMoveIn: true, landlordConfirmedMoveIn: true,
          createdAt: '2026-11-18T08:00:00Z',
        },
      ] }),
    }));
    await page.route('**/api/v1/booking/contracts**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/v1/billing/refunds**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/v1/billing/bank-accounts/me', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: { bankCode: 'VCB', bankName: 'Vietcombank', accountNumber: '1042701900', accountHolder: 'LE THANH CUONG', qrCodeUrl: 'https://img.vietqr.io/image/970436-1042701900-compact2.png' } }),
    }));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/vi/dashboard/tenant/deposits', { waitUntil: 'networkidle' });
    await expect(page.getByText('HD-3F66057C')).toBeVisible();
    await expect(page.getByText('d8082a0f-c5c9-4d62-9016-1e493f66057c')).toHaveCount(0);
    await expect(page.getByText(/đang giữ đến hết hợp đồng/i)).toBeVisible();
    await setTheme(page, false);
    await page.screenshot({ path: `${SHOT_DIR}/tenant-deposits-1440-light.png`, fullPage: true });
    await setTheme(page, true);
    await page.screenshot({ path: `${SHOT_DIR}/tenant-deposits-1440-dark.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await setTheme(page, false);
    await page.screenshot({ path: `${SHOT_DIR}/tenant-deposits-390-mobile.png`, fullPage: true });
  });

  test('Landlord wallet & deposits: 4 KPIs, 5% commission ledger split, payout cancel, light/dark/mobile', async ({ context, page }) => {
    await authenticateAs(context, page, 'landlord@cozynest.vn');
    await page.route('**/api/v1/billing/wallet/summary', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: {
        availableBalance: 1145000, pendingBalance: 0, withdrawalHoldBalance: 500000,
        escrowRetainedBalance: 500000, commissionPercent: 5, depositReleasePercent: 50,
        withdrawalHoldDays: 0, withdrawalMinAmount: 1000,
      } }),
    }));
    await page.route('**/api/v1/billing/wallet/ledger**', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [{
        id: 'je-1', entryNumber: 'JE-2026-0001',
        description: 'Thu tiền thuê tháng 11 + tiền điện (trừ 5% hoa hồng sàn)',
        referenceType: 'INVOICE_PAYMENT', referenceId: 'INV-2026-01', totalAmount: 1200000,
        status: 'POSTED', createdBy: 'WEBHOOK_PAYOS', createdAt: '2026-11-19T09:00:00Z',
        postings: [
          { accountNumber: '1010-GATEWAY', direction: 'DEBIT', amount: 1200000 },
          { accountNumber: '4010-REVENUE', direction: 'CREDIT', amount: 60000 },
          { accountNumber: '2020-WALLET-u-landlord-01', direction: 'CREDIT', amount: 1140000 },
        ],
      }] }),
    }));
    await page.route('**/api/v1/billing/escrow/landlord', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [{
        id: 'esc-l1', contractId: 'd8082a0f-c5c9-4d62-9016-1e493f66057c',
        tenantId: 'u-tenant-01', landlordId: 'u-landlord-01',
        amount: 1000000, releasedAmount: 500000, retainedAmount: 500000,
        status: 'PARTIALLY_RELEASED', tenantConfirmedMoveIn: true, landlordConfirmedMoveIn: true,
        createdAt: '2026-11-18T08:00:00Z',
      }] }),
    }));
    await page.route('**/api/v1/billing/payouts', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [{
        id: 'po-1', payoutCode: 'PO-2026-001', landlordId: 'u-landlord-01',
        amount: 500000, bankCode: 'VCB', accountNumber: '1042701900', accountHolder: 'LE THANH CUONG',
        status: 'REQUESTED', createdAt: '2026-11-19T10:00:00Z',
      }] }),
    }));
    await page.route('**/api/v1/billing/bank-accounts/me', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: { bankCode: 'VCB', bankName: 'Vietcombank', accountNumber: '1042701900', accountHolder: 'LE THANH CUONG', qrCodeUrl: 'https://img.vietqr.io/image/970436-1042701900-compact2.png' } }),
    }));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/vi/dashboard/landlord/deposits', { waitUntil: 'networkidle' });
    await expect(page.getByText('1.145.000 đ')).toBeVisible();
    await expect(page.getByText(/60\.000 đ/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Hủy yêu cầu/i })).toBeVisible();
    await setTheme(page, false);
    await page.screenshot({ path: `${SHOT_DIR}/landlord-wallet-1440-light.png`, fullPage: true });
    await setTheme(page, true);
    await page.screenshot({ path: `${SHOT_DIR}/landlord-wallet-1440-dark.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await setTheme(page, false);
    await page.screenshot({ path: `${SHOT_DIR}/landlord-wallet-390-mobile.png`, fullPage: true });
  });

  test('Admin verify & withdrawal queue: unmatched inflows, manual confirm, system VietQR modal', async ({ context, page }) => {
    await authenticateAs(context, page, 'admin@cozynest.vn');
    await page.route('**/api/v1/billing/ledger/reconcile-now', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { balanced: true, totalDebits: 1200000, totalCredits: 1200000, checkedAt: '2026-11-19T10:00:00Z' } }) }));
    await page.route('**/api/v1/billing/dashboard/admin', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { platformFeeRevenue: 60000, escrowBalance: 500000, totalEscrowCount: 1 } }) }));
    await page.route('**/api/v1/billing/ledger/accounts', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/v1/billing/ledger/entries**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/v1/billing/payments/admin**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/v1/billing/escrow/admin', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/v1/billing/maker-checker/requests', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/v1/billing/refunds/admin', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/v1/billing/risk/profiles', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/v1/billing/payments/unmatched**', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [{
        id: 'um-1', provider: 'PAYOS', providerTxId: 'FT261119999', amount: 9000,
        rawContent: 'TOAMABCDEF123456789', mismatchReason: 'AMOUNT_MISMATCH', status: 'UNMATCHED',
        receivedAt: '2026-11-19T10:05:00Z',
      }] }),
    }));
    await page.route('**/api/v1/billing/payments/admin/pending-approvals', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [{
        id: 'pi-1', paymentCode: 'TOAM987654321ABCDEF', payerId: 'u-tenant-01',
        tenantName: 'Cường Lê', orderType: 'DEPOSIT',
        orderId: 'd8082a0f-c5c9-4d62-9016-1e493f66057c', amount: 10000, paidAmount: 0,
        status: 'SUBMITTED', submittedBankTxCode: 'FT261119888', hasProofImage: true,
        createdAt: '2026-11-19T10:00:00Z',
      }] }),
    }));
    await page.route('**/api/v1/billing/payouts/admin', (r) => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [{
        id: 'po-1', payoutCode: 'PO-2026-001', landlordId: 'u-landlord-01',
        amount: 500000, bankCode: 'VCB', accountNumber: '1042701900', accountHolder: 'LE THANH CUONG',
        status: 'REQUESTED',
        systemVietQrUrl: 'https://img.vietqr.io/image/970436-1042701900-compact2.png?amount=500000&addInfo=PO-2026-001',
        createdAt: '2026-11-19T10:00:00Z',
      }] }),
    }));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/vi/dashboard/admin/transactions', { waitUntil: 'networkidle' });
    await expect(page.getByText('Cường Lê')).toBeVisible();
    await expect(page.getByText('TOAM987654321ABCDEF')).toBeVisible();
    await expect(page.getByRole('button', { name: /Duyệt giao dịch/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Hủy giao dịch/i })).toBeVisible();
    await expect(page.getByText('60.000 đ')).toBeVisible();
    await setTheme(page, false);
    await page.screenshot({ path: `${SHOT_DIR}/admin-verify-queue-1440-light.png`, fullPage: true });
    await page.getByRole('button', { name: /QR hệ thống/i }).click();
    await expect(page.getByText(/QR VietQR Hệ Thống Sinh/i)).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/admin-payout-qr-modal-1440-light.png` });
    await page.getByRole('button', { name: 'Đóng' }).click();
    await setTheme(page, true);
    await page.screenshot({ path: `${SHOT_DIR}/admin-verify-queue-1440-dark.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await setTheme(page, false);
    await page.screenshot({ path: `${SHOT_DIR}/admin-verify-queue-390-mobile.png`, fullPage: true });
  });
});
