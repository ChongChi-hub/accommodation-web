import { test, expect } from '@playwright/test';
import { setupAuthMockRoutes, authenticateAs } from './helpers/auth-helper';
import * as path from 'path';

test.describe('[APPT-02] Landlord Appointments Visual Verification', () => {
  test.setTimeout(90000);
  const screenshotsDir = path.join(process.cwd(), 'docs/design/screenshots/landlord/appointments');

  const mockSummary = {
    totalPending: 5,
    totalConfirmed: 8,
    totalNeedingOutcomeUpdate: 2,
    totalCompleted: 12,
    totalCancelled: 6,
    totalExpired: 3,
    todayCount: 4,
  };

  const now = new Date();
  const todayStr = now.toISOString();
  const pastStr = new Date(now.getTime() - 2 * 3600000).toISOString();
  const tomorrowStr = new Date(now.getTime() + 24 * 3600000).toISOString();

  const mockAppointments = [
    {
      id: 'va-demo-01',
      roomId: 'room-00000001-0000-0000-0000-000000000001',
      roomTitle: 'Phòng studio ban công thoáng Dịch Vọng Hậu, Hà Nội',
      roomAddress: 'Số 15 ngõ 92 Trần Thái Tông, Cầu Giấy, Hà Nội',
      roomCoverThumbKey: '/media/room-1-thumb.webp',
      scheduledStart: todayStr,
      scheduledEnd: new Date(now.getTime() + 45 * 60000).toISOString(),
      status: 'PENDING',
      contactName: 'Nguyễn Văn Thuê',
      contactPhone: '090••••567',
      contactEmail: 'thue.nguyen@gmail.com',
      tenantNote: 'Em muốn xem phòng trực tiếp vào chiều nay lúc 15h ạ.',
      landlordNote: null,
      cancelReasonCode: null,
      cancelReasonNote: null,
      cancelledBy: null,
      confirmedAt: null,
      completedAt: null,
      version: 0,
      createdAt: todayStr,
    },
    {
      id: 'va-demo-02',
      roomId: 'room-00000001-0000-0000-0000-000000000002',
      roomTitle: 'Căn hộ dịch vụ full nội thất Quan Hoa view công viên',
      roomAddress: 'Ngõ 118 Nguyễn Khánh Toàn, Cầu Giấy, Hà Nội',
      roomCoverThumbKey: '/media/room-2-thumb.webp',
      scheduledStart: pastStr,
      scheduledEnd: new Date(now.getTime() - 75 * 60000).toISOString(),
      status: 'CONFIRMED',
      contactName: 'Lê Thị Mai',
      contactPhone: '0912345678',
      contactEmail: 'mai.le@gmail.com',
      tenantNote: 'Đi cùng bạn cùng phòng xem cùng lúc 13h.',
      landlordNote: 'Đã hẹn gặp tại sảnh tầng 1',
      cancelReasonCode: null,
      cancelReasonNote: null,
      cancelledBy: null,
      confirmedAt: pastStr,
      completedAt: null,
      version: 1,
      createdAt: pastStr,
    },
    {
      id: 'va-demo-03',
      roomId: 'room-00000001-0000-0000-0000-000000000003',
      roomTitle: 'Phòng trọ khép kín gần ĐH Bách Khoa, Hai Bà Trưng',
      roomAddress: 'Ngõ 27 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      roomCoverThumbKey: '/media/room-3-thumb.webp',
      scheduledStart: tomorrowStr,
      scheduledEnd: new Date(now.getTime() + 25 * 3600000).toISOString(),
      status: 'CONFIRMED',
      contactName: 'Trần Văn Hùng',
      contactPhone: '0987654321',
      contactEmail: 'hung.tran@gmail.com',
      tenantNote: 'Em đến tầm trưa mai sau giờ học.',
      landlordNote: null,
      cancelReasonCode: null,
      cancelReasonNote: null,
      cancelledBy: null,
      confirmedAt: todayStr,
      completedAt: null,
      version: 1,
      createdAt: todayStr,
    },
  ];

  const mockDetail = {
    ...mockAppointments[0],
    tenantId: 'u-tenant-01',
    landlordId: 'u-landlord-01',
    history: [
      {
        id: 1,
        appointmentId: 'va-demo-01',
        fromStatus: null,
        toStatus: 'PENDING',
        actorId: 'u-tenant-01',
        actorRole: 'TENANT',
        reason: 'Khách gửi yêu cầu hẹn xem phòng',
        createdAt: todayStr,
      },
    ],
  };

  test.beforeEach(async ({ page, context }) => {
    await setupAuthMockRoutes(page);
    await authenticateAs(context, page, 'landlord@toam.vn');

    await page.route('**/api/v1/landlord/appointments/summary**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Success', data: mockSummary }),
      });
    });

    await page.route('**/api/v1/landlord/appointments/va-demo-01**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Success', data: mockDetail }),
      });
    });

    await page.route('**/api/v1/landlord/appointments**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Success',
          data: mockAppointments,
          pagination: { page: 0, size: 20, totalElements: 3, totalPages: 1 },
        }),
      });
    });
  });

  test('Capture Responsive Screenshots (List, By Room, Calendar, Drawer, Modals, Dark Mode)', async ({ page }) => {
    // 1. Desktop 1440px
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/dashboard/landlord/appointments');
    await page.waitForSelector('h1');
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-list-desktop-1440.png'), fullPage: true });

    // 2. Tablet Landscape 1024px
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-list-tablet-1024.png') });

    // 3. Tablet Portrait 768px
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-list-tablet-768.png') });

    // 4. Mobile 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-list-mobile-390.png') });

    // Return to Desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    // 5. Dark mode screenshot
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-list-dark-1440.png'), fullPage: true });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(300);

    // 6. By-Room View
    const byRoomBtn = page.locator('button[aria-label*="phòng"], button[aria-label*="Room"]');
    await byRoomBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-by-room-desktop-1440.png'), fullPage: true });

    // 7. Calendar View
    const calendarBtn = page.locator('button[aria-label*="tuần"], button[aria-label*="Calendar"]');
    await calendarBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-calendar-desktop-1440.png'), fullPage: true });

    // Switch back to list to test drawer & modals
    const listBtn = page.locator('button[aria-label*="sách"], button[aria-label*="List"]');
    await listBtn.click();
    await page.waitForTimeout(400);

    // 8. Detail Drawer
    await page.locator('.space-y-3 button', { hasText: /Chi tiết|Details/ }).first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-detail-drawer.png') });
    await page.locator('button[aria-label*="Đóng"], button[aria-label*="Close"]').first().click();
    await page.waitForTimeout(400);

    // 9. Confirm Modal
    await page.locator('.space-y-3 button', { hasText: /^Xác nhận$|^Confirm$/ }).first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-confirm-modal.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // 10. Cancel Modal
    await page.locator('.space-y-3 button', { hasText: /Từ chối|Decline/ }).first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-cancel-modal.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // 11. Complete Modal
    await page.locator('.space-y-3 button', { hasText: /Cập nhật kết quả|Update Outcome/ }).first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, 'appointments-complete-modal.png') });
    await page.keyboard.press('Escape');
  });
});
