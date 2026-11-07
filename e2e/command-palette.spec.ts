import { test, expect } from '@playwright/test';

test.describe('Command Palette Role Access Enforcement', () => {
  test('TENANT role can only see tenant & public commands, never admin or landlord commands', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('toam_access_token', 'mock_tenant_token');
      localStorage.setItem('toam_user', JSON.stringify({
        id: 'usr_tenant_test',
        fullName: 'Nguyễn Văn Thuê',
        email: 'tenant@toam.vn',
        phone: '0987654321',
        roles: ['TENANT'],
        isKycVerified: true,
      }));
    });

    await page.goto('http://localhost:3000/dashboard/tenant', { waitUntil: 'networkidle' });

    // Trigger Command Palette with keyboard shortcut
    await page.keyboard.press('Control+k');
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Verify forbidden commands are NOT present
    const forbiddenCommandIds = [
      'adm-users',
      'adm-audit',
      'adm-settings',
      'adm-contracts',
      'adm-trans',
      'll-rooms',
      'll-new-room',
      'll-invoices',
    ];

    for (const id of forbiddenCommandIds) {
      const item = dialog.locator(`[data-command-id="${id}"]`);
      await expect(item).toHaveCount(0);
    }

    // Verify allowed tenant commands are present
    await expect(dialog.locator('[data-command-id="tn-ov"]')).toBeVisible();
    await expect(dialog.locator('[data-command-id="tn-my-room"]')).toBeVisible();
    await expect(dialog.locator('[data-command-id="support"]')).toBeVisible();
  });

  test('ADMIN role can access administrative commands', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('toam_access_token', 'mock_admin_token');
      localStorage.setItem('toam_user', JSON.stringify({
        id: 'usr_admin_test',
        fullName: 'Quản Trị Viên Sàn',
        email: 'admin@toam.vn',
        phone: '0901234567',
        roles: ['ADMIN'],
        isKycVerified: true,
      }));
    });

    await page.goto('http://localhost:3000/dashboard/admin', { waitUntil: 'networkidle' });
    await page.keyboard.press('Control+k');
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Verify admin commands are accessible
    await expect(dialog.locator('[data-command-id="adm-ov"]')).toBeVisible();
    await expect(dialog.locator('[data-command-id="adm-users"]')).toBeVisible();
    await expect(dialog.locator('[data-command-id="adm-settings"]')).toBeVisible();
    await expect(dialog.locator('[data-command-id="adm-rooms"]')).toBeVisible();
  });
});

