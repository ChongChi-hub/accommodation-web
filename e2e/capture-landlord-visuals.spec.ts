import { test, expect } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

test.describe('Landlord Visual Matrix Screenshots (LANDLORD-04 & LANDLORD-02)', () => {
  test.beforeEach(async ({ context, page }) => {
    await authenticateAs(context, page, 'landlord@toam.vn');
  });

  test('01: Capture rooms list loading state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms?state=loading', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'docs/design/screenshots/landlord/01-rooms-loading-state.png',
      fullPage: true,
    });
  });

  test('02: Capture rooms list English version', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.route('**/api/v1/landlord/rooms?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 101,
              title: 'Studio with balcony in Dich Vong Hau Ward',
              address: '18 Duy Tan, Dich Vong Hau, Ha Noi',
              area: 28,
              price: 4500000,
              status: 'PUBLISHED',
              hidden: false,
              coverImage: '/rooms/room-1.jpg',
              createdAt: '2026-11-01T10:00:00Z',
            },
            {
              id: 102,
              title: 'Premium 1BR Serviced Apartment Co Giang Ward',
              address: '142 Co Bac, Co Giang, Ho Chi Minh City',
              area: 40,
              price: 7200000,
              status: 'DRAFT',
              hidden: false,
              coverImage: '/rooms/room-2.jpg',
              createdAt: '2026-11-02T10:00:00Z',
            },
          ],
          pagination: { page: 0, size: 10, totalElements: 2, totalPages: 1 },
        }),
      });
    });

    await page.goto('http://localhost:3000/en/dashboard/landlord/rooms', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'docs/design/screenshots/landlord/02-rooms-list-english.png',
      fullPage: true,
    });
  });

  test('03: Capture room edit page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.route('**/api/v1/landlord/rooms/101', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 101,
            title: 'Phòng studio full đồ ban công thoáng Phường Dịch Vọng Hậu',
            description: 'Phòng khép kín đầy đủ đồ, có thang máy, bảo vệ 24/7, giờ giấc tự do.',
            address: 'Số 18 Ngõ 86 Duy Tân, Phường Dịch Vọng Hậu, Hà Nội',
            area: 28,
            price: 4500000,
            deposit: 4500000,
            status: 'PUBLISHED',
            allowPets: false,
            allowCooking: true,
          },
        }),
      });
    });

    await page.route('**/api/v1/landlord/rooms/101/images', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 1, roomId: 101, imageUrl: '/rooms/room-1.jpg', thumbUrl: '/rooms/room-1.jpg', isCover: true, sortOrder: 0 },
            { id: 2, roomId: 101, imageUrl: '/rooms/room-2.jpg', thumbUrl: '/rooms/room-2.jpg', isCover: false, sortOrder: 1 },
            { id: 3, roomId: 101, imageUrl: '/rooms/room-3.jpg', thumbUrl: '/rooms/room-3.jpg', isCover: false, sortOrder: 2 },
          ],
        }),
      });
    });

    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms/101/edit', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'docs/design/screenshots/landlord/03-room-edit-page.png',
      fullPage: true,
    });
  });

  test('04: Capture delete confirmation modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.route('**/api/v1/landlord/rooms?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 101,
              title: 'Phòng studio full đồ ban công thoáng Phường Dịch Vọng Hậu',
              address: 'Số 18 Ngõ 86 Duy Tân, Phường Dịch Vọng Hậu, Hà Nội',
              area: 28,
              price: 4500000,
              status: 'DRAFT',
              hidden: false,
              coverImage: '/rooms/room-1.jpg',
              createdAt: '2026-11-01T10:00:00Z',
            },
          ],
          pagination: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
        }),
      });
    });

    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'networkidle' });
    const deleteButton = page.locator('button[aria-label*="Xóa"], button[aria-label*="Delete"], button[title*="Xóa"]').first();
    await deleteButton.click();

    // Wait for modal backdrop and content
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'docs/design/screenshots/landlord/04-room-delete-modal.png',
      fullPage: false,
    });
  });

  test('05: Capture mobile 390px upload screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms/new', { waitUntil: 'networkidle' });

    // Step 1
    await page.locator('input[placeholder*="VD: Chung cư mini"]').fill('Phòng Studio 390px Mobile');
    await page.locator('input[placeholder*="Số 15 ngõ 92"]').fill('123 Duy Tân, Hà Nội');
    await page.locator('button:has-text("Tiếp tục")').click();

    // Step 2
    await page.locator('input[placeholder="VD: 32"]').fill('25');
    await page.getByRole('spinbutton', { name: 'Giá thuê mỗi tháng (VNĐ)' }).fill('4000000');
    await page.locator('button:has-text("Tiếp tục")').click();

    // Step 3
    await page.locator('button:has-text("Tiếp tục")').click();

    // Step 4: Upload screen
    await expect(page.locator('text=Bước 4: Hình ảnh thực tế phòng trọ')).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'docs/design/screenshots/landlord/05-room-upload-mobile-390px.png',
      fullPage: true,
    });
  });
});
