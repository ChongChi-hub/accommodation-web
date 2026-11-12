import { test, expect } from '@playwright/test';

test.describe('Sprint 1-2 Remediation Live Verification (HDR-1.1, SEARCH-FE.2, ROOM-01.2)', () => {
  test('HDR-1.1: Clicking RoomCard carousel button does not trigger card Link navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/rooms', { waitUntil: 'networkidle' });
    const nextBtn = page.locator('button[aria-label="Ảnh sau"]').first();
    await expect(nextBtn).toBeVisible({ timeout: 10000 });
    await nextBtn.click();
    await page.waitForTimeout(300);
    expect(page.url()).toMatch(/\/rooms$/);
  });

  test('SEARCH-FE.2: /vi/rooms renders pagination bar and requests page=1 when clicking page 2', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/rooms', { waitUntil: 'networkidle' });
    const nav = page.locator('nav[aria-label*="Phân trang"], nav[aria-label*="Pagination"]');
    await expect(nav).toBeVisible({ timeout: 10000 });

    const page2Btn = nav.getByRole('button', { name: /Đến trang 2/i });
    await expect(page2Btn).toBeVisible();

    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/v1/rooms') && r.url().includes('page=1') && r.status() === 200),
      page2Btn.click(),
    ]);
    expect(res.status()).toBe(200);
  });

  test('ROOM-01.2: /vi/hosts/4 displays real backend landlord profile instead of hardcoded mock data', async ({ page }) => {
    await page.goto('http://localhost:3000/vi/hosts/4', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Phan Thanh Bình', { timeout: 10000 });
    await expect(page.locator('body')).not.toContainText('Trần Minh Tuấn');
  });
});

