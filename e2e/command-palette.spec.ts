import { test, expect } from '@playwright/test';
import { authenticateAs } from './helpers/auth-helper';

test.describe('Command Palette Role Access Enforcement', () => {
  test('TENANT role can only see tenant & public commands, never admin or landlord commands', async ({ context, page }) => {
    await authenticateAs(context, page, 'tenant@toam.vn');

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

  test('ADMIN role can access administrative commands', async ({ context, page }) => {
    await authenticateAs(context, page, 'admin@toam.vn');

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

