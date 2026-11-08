import { test, expect } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

test.describe('Landlord Rooms Page (LANDLORD-04)', () => {
  test.beforeEach(async ({ context, page }) => {
    await authenticateAs(context, page, 'landlord@cozynest.vn');
  });

  test('Desktop 1440px renders table and controls without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="Tìm theo"]')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Mobile 390px renders responsive cards with zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms', { waitUntil: 'networkidle' });

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Simulated state=empty renders EmptyState component', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms?state=empty', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Chưa có phòng trọ nào')).toBeVisible();
  });

  test('Simulated state=error renders ErrorState component with retry', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms?state=error', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Không thể tải dữ liệu')).toBeVisible();
    await expect(page.locator('button:has-text("Thử lại")')).toBeVisible();
  });

  test('Simulated state=loading renders skeleton loader', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms?state=loading', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });

  test('New Room form validates minimum 3 images before submitting for review', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms/new', { waitUntil: 'networkidle' });

    // Fill Step 1
    await page.getByRole('textbox', { name: /Tiêu đề/i }).fill('Phòng Thử Nghiệm Duyệt');
    await page.getByRole('textbox', { name: /Địa chỉ/i }).fill('Số 99 Phố Duy Tân');
    await page.getByRole('button', { name: /Tiếp tục/i }).click();

    // Step 2
    await page.getByLabel(/Diện tích/i).fill('28');
    await page.getByLabel(/Giá thuê/i).fill('4500000');
    await page.getByRole('button', { name: /Tiếp tục/i }).click();

    // Step 3
    await page.getByRole('button', { name: /Tiếp tục/i }).click();

    // Step 4 - Submit for review without images
    await page.getByRole('button', { name: /Gửi duyệt tin đăng/i }).click();

    // Should show error toast demanding at least 3 images
    await expect(page.getByText(/tối thiểu 3 ảnh/i).first()).toBeVisible();
  });
});
