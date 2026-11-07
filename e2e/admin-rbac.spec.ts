import { test, expect } from '@playwright/test';

test.describe('Admin/Moderator RBAC & Menu Authorization', () => {
  test('Moderator sees only authorized menu items and is blocked from Admin-only routes', async ({ page }) => {
    // Authenticate as MODERATOR
    await page.addInitScript(() => {
      localStorage.setItem('toam_access_token', 'mock_moderator_token');
      localStorage.setItem('toam_user', JSON.stringify({
        id: 'usr_mod_1',
        email: 'moderator@toam.vn',
        fullName: 'Kiểm Duyệt Viên',
        phone: '0909999888',
        roles: ['MODERATOR'],
        isKycVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }));
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/dashboard/admin', { waitUntil: 'networkidle' });

    // Verify allowed menu items are present
    await expect(page.getByText('Duyệt phòng đăng')).toBeVisible();
    await expect(page.getByText('Duyệt hồ sơ KYC')).toBeVisible();
    await expect(page.getByText('Báo cáo vi phạm')).toBeVisible();
    await expect(page.getByText('Quản lý đánh giá')).toBeVisible();

    // Verify admin-only menu items are hidden from Moderator
    await expect(page.getByText('Quản lý người dùng')).toBeHidden();
    await expect(page.getByText('Danh mục & Từ điển')).toBeHidden();
    await expect(page.getByText('Nhật ký kiểm toán')).toBeHidden();
    await expect(page.getByText('Cấu hình hệ thống')).toBeHidden();

    // When Moderator tries to directly access admin-only route (/dashboard/admin/settings)
    await page.goto('http://localhost:3000/dashboard/admin/settings', { waitUntil: 'networkidle' });

    // Should display styled 403 Forbidden message
    await expect(page.getByText('Truy cập không được phép (403)')).toBeVisible();
  });

  test('Admin sees all menu items and can access system settings', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('toam_access_token', 'mock_admin_token');
      localStorage.setItem('toam_user', JSON.stringify({
        id: 'usr_admin_1',
        email: 'admin@toam.vn',
        fullName: 'Quản Trị Viên Cấp Cao',
        phone: '0901234567',
        roles: ['ADMIN'],
        isKycVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }));
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/dashboard/admin', { waitUntil: 'networkidle' });

    // Admin sees all
    await expect(page.getByText('Quản lý người dùng')).toBeVisible();
    await expect(page.getByText('Danh mục & Từ điển')).toBeVisible();
    await expect(page.getByText('Nhật ký kiểm toán')).toBeVisible();
    await expect(page.getByText('Cấu hình hệ thống')).toBeVisible();
  });
});

