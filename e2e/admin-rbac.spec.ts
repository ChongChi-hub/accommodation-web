import { test, expect } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

test.describe('Admin/Moderator RBAC & Menu Authorization', () => {
  test('Moderator sees only authorized menu items and is blocked from Admin-only routes', async ({ context, page }) => {
    // Authenticate as MODERATOR
    await authenticateAs(context, page, 'moderator@cozynest.vn');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/dashboard/moderator', { waitUntil: 'networkidle' });

    // Verify allowed menu items are present
    await expect(page.getByRole('link', { name: /Duyệt.*phòng/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /KYC/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Báo cáo/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /đánh giá/i })).toBeVisible();

    // Verify admin-only menu items are hidden from Moderator
    await expect(page.getByText('Quản lý người dùng')).toBeHidden();
    await expect(page.getByText('Danh mục & Từ điển')).toBeHidden();
    await expect(page.getByText('Nhật ký kiểm toán')).toBeHidden();
    await expect(page.getByText('Cấu hình hệ thống')).toBeHidden();

    // When Moderator tries to directly access admin-only route (/dashboard/admin)
    await page.goto('http://localhost:3000/dashboard/admin', { waitUntil: 'networkidle' });

    // Should display styled 403 Forbidden message
    await expect(page.getByRole('heading', { name: /Access Denied|Truy cập/i })).toBeVisible();
  });

  test('Admin sees all menu items and can access system settings', async ({ context, page }) => {
    await authenticateAs(context, page, 'admin@cozynest.vn');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/dashboard/admin', { waitUntil: 'networkidle' });

    // Admin sees all
    await expect(page.getByText('Quản lý người dùng')).toBeVisible();
    await expect(page.getByText('Danh mục & Từ điển')).toBeVisible();
    await expect(page.getByText('Nhật ký kiểm toán')).toBeVisible();
    await expect(page.getByText('Cấu hình hệ thống')).toBeVisible();
  });
});

