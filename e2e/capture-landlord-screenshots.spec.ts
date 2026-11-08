import { test } from '@playwright/test';

const SIZES = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
];

test.describe('Landlord Visual Matrix Screenshots', () => {
  for (const size of SIZES) {
    test(`Capture matrix at ${size.name}px`, async ({ context, page }) => {
      await context.addCookies([
        {
          name: 'cozynest_role',
          value: 'LANDLORD',
          domain: 'localhost',
          path: '/',
        },
      ]);
      await page.addInitScript(() => {
        localStorage.setItem('cozynest_access_token', 'mock_landlord_token');
        localStorage.setItem(
          'cozynest_user',
          JSON.stringify({
            id: 'u-landlord-01',
            email: 'landlord@cozynest.vn',
            fullName: 'Chủ Trọ Demo',
            phone: '0901234567',
            roles: ['LANDLORD'],
            isKycVerified: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          })
        );
      });

      await page.setViewportSize({ width: size.width, height: size.height });

      // 1. Light - Main Success List
      await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'networkidle' });
      await page.screenshot({ path: `docs/screenshots/landlord-rooms/rooms-${size.name}-light.png`, fullPage: true });

      // 2. Dark - Main Success List
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'networkidle' });
      await page.screenshot({ path: `docs/screenshots/landlord-rooms/rooms-${size.name}-dark.png`, fullPage: true });

      // Revert to light
      await page.emulateMedia({ colorScheme: 'light' });

      // 3. Empty state
      await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms?state=empty', { waitUntil: 'networkidle' });
      await page.screenshot({ path: `docs/screenshots/landlord-rooms/rooms-${size.name}-empty.png`, fullPage: true });

      // 4. Error state
      await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms?state=error', { waitUntil: 'networkidle' });
      await page.screenshot({ path: `docs/screenshots/landlord-rooms/rooms-${size.name}-error.png`, fullPage: true });

      // 5. Image manager in Step 4 of wizard (desktop only for clarity)
      if (size.name === '1440') {
        await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms/new', { waitUntil: 'networkidle' });
        await page.locator('input[placeholder*="VD: Chung cư mini"]').fill('Phòng Demo');
        await page.locator('input[placeholder*="Số 15 ngõ 92"]').fill('123 Đường Cầu Giấy');
        await page.locator('button:has-text("Tiếp tục")').click();
        await page.locator('input[placeholder="VD: 32"]').fill('30');
        await page.getByRole('spinbutton', { name: 'Giá thuê mỗi tháng (VNĐ)' }).fill('4500000');
        await page.locator('button:has-text("Tiếp tục")').click();
        await page.locator('button:has-text("Tiếp tục")').click();
        await page.screenshot({ path: `docs/screenshots/landlord-rooms/upload-step4-${size.name}.png`, fullPage: true });
      }
    });
  }
});
