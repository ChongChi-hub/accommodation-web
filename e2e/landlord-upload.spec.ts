import { test, expect } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

test.describe('Landlord Image Upload & Validation (LANDLORD-02)', () => {
  test.beforeEach(async ({ context, page }) => {
    await authenticateAs(context, page, 'landlord@toam.vn');
  });

  test('Step 4 wizard validates file upload constraints', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/dashboard/landlord/rooms/new', { waitUntil: 'networkidle' });

    // Step 1: fill required fields
    await page.locator('input[placeholder*="VD: Chung cư mini"]').fill('Phòng trọ thử nghiệm E2E');
    await page.locator('input[placeholder*="Số 15 ngõ 92"]').fill('123 Đường Cầu Giấy, Hà Nội');
    await page.locator('button:has-text("Tiếp tục")').click();

    // Step 2: fill area and price
    await page.locator('input[placeholder="VD: 32"]').fill('30');
    await page.getByRole('spinbutton', { name: 'Giá thuê mỗi tháng (VNĐ)' }).fill('4500000');
    await page.locator('button:has-text("Tiếp tục")').click();

    // Step 3: amenities
    await page.locator('button:has-text("Tiếp tục")').click();

    // Step 4: image upload view
    await expect(page.locator('text=Bước 4: Hình ảnh thực tế phòng trọ')).toBeVisible();
    await expect(page.locator('text=Kéo thả hoặc chọn ảnh phòng')).toBeVisible();

    // Upload an invalid text file using setInputFiles
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not an image'),
    });

    // An error overlay or toast appears
    await expect(page.locator('text=Định dạng không được hỗ trợ')).toBeVisible();

    // Upload an oversized file (> 5MB)
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    await fileInput.setInputFiles({
      name: 'large_photo.jpg',
      mimeType: 'image/jpeg',
      buffer: bigBuffer,
    });
    await expect(page.locator('text=Ảnh vượt quá dung lượng 5MB')).toBeVisible();

    // Upload valid image
    const validBuffer1 = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    await fileInput.setInputFiles({
      name: 'room_front.jpg',
      mimeType: 'image/jpeg',
      buffer: validBuffer1,
    });

    // Check thumbnail is visible
    await expect(page.locator('text=room_front.jpg')).toBeVisible();

    // With only 1 valid image, "Gửi duyệt tin đăng" should display validation error
    await page.locator('button:has-text("Gửi duyệt tin đăng")').click();
    await expect(page.locator('text=Cần tối thiểu 3 ảnh thực tế hợp lệ').first()).toBeVisible();

    // "Lưu nháp" button should be available
    await expect(page.locator('button:has-text("Lưu nháp")')).toBeVisible();
  });
});
