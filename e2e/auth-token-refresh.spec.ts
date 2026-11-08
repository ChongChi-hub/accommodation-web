import { test, expect } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

test.describe('[AUTH-03/05] Silent Token Refresh Flow on Expired Session', () => {
  test('Expired cozynest_token automatically triggers silent refresh without redirecting to login', async ({ context, page }) => {
    // 1. Authenticate with initial valid session
    await authenticateAs(context, page, 'landlord@cozynest.vn');

    let refreshCalled = false;
    let originalRequestRetried = false;

    // 2. Mock API Gateway behavior
    await page.route('**/api/v1/auth/refresh-token', async (route) => {
      refreshCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'Làm mới token thành công',
          data: {
            token: 'new-valid-refreshed-rs256-jwt-token',
            refreshToken: 'renewed-refresh-token-uuid-5678',
            user: {
              id: 'u-landlord-01',
              email: 'landlord@cozynest.vn',
              fullName: 'Chủ Trọ Demo',
              roles: ['ROLE_LANDLORD'],
            },
          },
        }),
      });
    });

    // Mock landlord rooms call: first returns 401 (expired), second returns 200 (retried)
    let roomCallCount = 0;
    await page.route('**/api/v1/landlord/rooms**', async (route) => {
      roomCallCount++;
      if (roomCallCount === 1) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 401,
            errorCode: 'ERR_TOKEN_EXPIRED',
            message: 'Token đã hết hạn hoặc không hợp lệ',
          }),
        });
      } else {
        originalRequestRetried = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            message: 'Success',
            data: [],
            pagination: { page: 0, size: 10, totalElements: 0, totalPages: 1 },
          }),
        });
      }
    });

    // 3. User accesses landlord dashboard
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'networkidle' });

    // 4. Assert silent refresh was executed seamlessly
    expect(refreshCalled).toBe(true);
    expect(originalRequestRetried).toBe(true);

    // Assert user is still on landlord rooms page and NOT redirected to login
    expect(page.url()).toContain('/dashboard/landlord/rooms');
    await expect(page).not.toHaveURL(/\/login/);
  });
});
