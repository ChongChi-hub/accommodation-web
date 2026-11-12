import { test, expect } from '@playwright/test';
import { authenticateAs, createRealSignedToken, DEMO_USERS } from './helpers/auth-helper';

test.describe('[AUTH-03/05] Silent Token Refresh Flow on Expired Session', () => {
  test('Expired cozynest_token automatically triggers silent refresh without redirecting to login', async ({ context, page }) => {
    // 1. Authenticate with initial valid session
    await authenticateAs(context, page, 'landlord@cozynest.vn');
    const renewedJwt = await createRealSignedToken(DEMO_USERS['landlord@cozynest.vn']);

    let refreshCalled = false;
    let originalRequestRetried = false;

    const corsHeaders = {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
    };

    // 2. Mock API Gateway behavior
    await page.route('**/api/v1/me', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 204, headers: corsHeaders });
      }
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'OK',
          data: {
            id: 'u-landlord-01',
            email: 'landlord@cozynest.vn',
            fullName: 'Chủ Trọ Demo',
            roles: ['LANDLORD'],
          },
        }),
      });
    });

    await page.route('**/api/v1/notifications**', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 204, headers: corsHeaders });
      }
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({ code: 200, message: 'OK', data: [], pagination: { page: 1, totalPages: 1, total: 0 } }),
      });
    });

    await page.route('**/api/v1/auth/refresh-token', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 204, headers: corsHeaders });
      }
      refreshCalled = true;
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'Làm mới token thành công',
          data: {
            token: renewedJwt,
            refreshToken: 'renewed-refresh-token-uuid-5678',
            user: {
              id: 'u-landlord-01',
              email: 'landlord@cozynest.vn',
              fullName: 'Chủ Trọ Demo',
              roles: ['LANDLORD'],
            },
          },
        }),
      });
    });

    // Mock landlord rooms call: first returns 401 (expired), second returns 200 (retried)
    let roomCallCount = 0;
    await page.route('**/api/v1/landlord/rooms**', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 204, headers: corsHeaders });
      }
      roomCallCount++;
      if (roomCallCount === 1) {
        await route.fulfill({
          status: 401,
          headers: corsHeaders,
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
          headers: corsHeaders,
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
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'domcontentloaded' });

    // 4. Assert silent refresh was executed seamlessly and retried request succeeded
    await expect.poll(() => refreshCalled).toBe(true);
    await expect.poll(() => originalRequestRetried).toBe(true);

    // Assert user is still on landlord rooms page and NOT redirected to login
    expect(page.url()).toContain('/dashboard/landlord/rooms');
    await expect(page).not.toHaveURL(/\/login/);
  });
});
