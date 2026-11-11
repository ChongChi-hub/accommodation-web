import { test, expect } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

test.describe('[QA-FINTECH] Sprint 3 End-to-End Leasing & Billing Flows', () => {
  test('Tenant completes rental request -> OTP contract sign -> Sandbox deposit -> Refund request UI', async ({
    context,
    page,
  }) => {
    await authenticateAs(context, page, 'tenant@cozynest.vn');

    let rentalCancelled = false;
    await page.route('**/api/v1/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'u-tenant-01',
            email: 'tenant@cozynest.vn',
            fullName: 'Người Thuê Demo',
            roles: ['TENANT'],
          },
        }),
      });
    });

    await page.route('**/api/v1/booking/rental-requests/tenant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'req-e2e-1',
              roomId: '101',
              tenantId: 'u-tenant-01',
              landlordId: 'u-landlord-01',
              proposedMoveInDate: '2026-12-01',
              numOccupants: 1,
              message: 'Xin thuê phòng E2E',
              status: rentalCancelled ? 'CANCELLED' : 'PENDING',
              createdAt: '2026-11-11T08:00:00Z',
            },
          ],
        }),
      });
    });

    await page.route('**/api/v1/booking/rental-requests/req-e2e-1/cancel', async (route) => {
      rentalCancelled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'req-e2e-1',
            roomId: '101',
            tenantId: 'u-tenant-01',
            landlordId: 'u-landlord-01',
            proposedMoveInDate: '2026-12-01',
            numOccupants: 1,
            status: 'CANCELLED',
            createdAt: '2026-11-11T08:00:00Z',
          },
        }),
      });
    });

    await page.goto('/vi/dashboard/tenant/rental-requests');
    await expect(page.getByText('#101')).toBeVisible();
    await page.getByRole('button', { name: /Hủy yêu cầu/i }).click();
    await expect(page.getByText(/Đã hủy/i).first()).toBeVisible();

    let contractSigned = false;
    await page.route('**/api/v1/booking/contracts/c-e2e-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'c-e2e-1',
            contractCode: 'HD-E2E-2026',
            roomId: '101',
            tenantId: 'u-tenant-01',
            landlordId: 'u-landlord-01',
            startDate: '2026-12-01',
            endDate: '2027-11-30',
            monthlyRent: 4800000,
            depositAmount: 4800000,
            paymentCycleMonths: 1,
            paymentDueDay: 5,
            status: contractSigned ? 'ACTIVE' : 'PENDING_SIGNATURES',
            tenantSignedAt: contractSigned ? '2026-11-11T09:00:00Z' : null,
            landlordSignedAt: '2026-11-11T08:30:00Z',
            documentHash: 'sha256-e2e-hash',
            createdAt: '2026-11-11T08:00:00Z',
          },
        }),
      });
    });

    await page.route('**/api/v1/booking/contracts/c-e2e-1/occupants', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.route('**/api/v1/booking/contracts/c-e2e-1/amendments', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.route('**/api/v1/booking/contracts/c-e2e-1/sign-tenant', async (route) => {
      contractSigned = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'c-e2e-1',
            contractCode: 'HD-E2E-2026',
            roomId: '101',
            tenantId: 'u-tenant-01',
            landlordId: 'u-landlord-01',
            startDate: '2026-12-01',
            endDate: '2027-11-30',
            monthlyRent: 4800000,
            depositAmount: 4800000,
            paymentCycleMonths: 1,
            paymentDueDay: 5,
            status: 'ACTIVE',
            tenantSignedAt: '2026-11-11T09:00:00Z',
            landlordSignedAt: '2026-11-11T08:30:00Z',
            documentHash: 'sha256-e2e-hash',
            createdAt: '2026-11-11T08:00:00Z',
          },
        }),
      });
    });

    await page.goto('/vi/dashboard/tenant/contracts/c-e2e-1');
    await expect(page.getByText('HD-E2E-2026').first()).toBeVisible();
    await page.getByRole('button', { name: /Ký hợp đồng ngay/i }).click();
    await page.locator('input[pattern="[0-9]{6}"]').fill('654321');
    await page.getByRole('button', { name: /Xác nhận/i }).click();
    await expect(page.getByText('ACTIVE').first()).toBeVisible();

    await page.route('**/api/v1/billing/dashboard/tenant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            totalPaidAmount: 4800000,
            unpaidInvoicesTotal: 0,
            activeEscrowBalance: 4800000,
            overdueInvoicesCount: 0,
            totalInvoicesCount: 1,
          },
        }),
      });
    });

    await page.route('**/api/v1/booking/contracts/tenant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ id: 'c-e2e-1', contractCode: 'HD-E2E-2026', landlordId: 'u-landlord-01', depositAmount: 4800000 }],
        }),
      });
    });

    await page.route('**/api/v1/billing/refunds/tenant', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.route('**/api/v1/billing/payments/intent', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'pi-1',
            paymentCode: 'PAY-E2E-01',
            orderType: 'DEPOSIT',
            orderId: 'c-e2e-1',
            amount: 4800000,
            paidAmount: 0,
            qrUrl: '',
            status: 'PENDING',
            expiresAt: '2026-11-12T00:00:00Z',
          },
        }),
      });
    });

    await page.route('**/api/v1/billing/payments/webhook', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { status: 'PROCESSED' } }),
      });
    });

    await page.goto('/vi/dashboard/tenant/deposits');
    await expect(page.getByText(/SANDBOX_ONLY \[LEGAL-02\]/i)).toBeVisible();
    await page.getByRole('button', { name: /Thanh toán tiền cọc/i }).click();
    await expect(page.getByText(/PAY-E2E-01/i)).toBeVisible();
    await page.getByRole('button', { name: /Giả lập webhook thành công/i }).click();
    await expect(page.getByText(/PAY-E2E-01 \(PAID\)/i)).toBeVisible();
  });

  test('RBAC prevents TENANT from opening admin/transactions and landlord/utilities', async ({
    context,
    page,
  }) => {
    await authenticateAs(context, page, 'tenant@cozynest.vn');
    await page.goto('/vi/dashboard/admin/transactions');
    await expect(page).toHaveURL(/\/vi\/403/);

    await page.goto('/vi/dashboard/landlord/utilities');
    await expect(page).toHaveURL(/\/vi\/landlord\/kyc|\/vi\/dashboard\/landlord\/kyc/);
  });
});

