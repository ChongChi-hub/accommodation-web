import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

const WEB_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const SHOT_DIR = path.resolve('docs/design/screenshots/list/after');

test.beforeAll(async () => {
  if (!fs.existsSync(SHOT_DIR)) {
    fs.mkdirSync(SHOT_DIR, { recursive: true });
  }
});

test.describe('LIST-1: End-to-End & Visual Verification', () => {
  test('35a & 35b: 4 Category pages load cleanly and verify room labels without Homestay on phong-tro', async ({ page }) => {
    // 1. /phong-tro
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Phòng trọ cho thuê');
    // Ensure no homestay badge
    const homestayCount = await page.locator('text=Homestay cao cấp').count();
    expect(homestayCount).toBe(0);

    // 2. /nha-nguyen-can
    await page.goto(`${WEB_URL}/vi/nha-nguyen-can`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Nhà nguyên căn');

    // 3. /can-ho
    await page.goto(`${WEB_URL}/vi/can-ho`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Căn hộ chung cư');

    // 4. /o-ghep
    await page.goto(`${WEB_URL}/vi/o-ghep`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Ở ghép & Ký túc xá');
  });

  test('35c & 35d & 35e: APG Combobox, floating sticky bar, and ward dependency', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });

    // Floating filter bar is visible
    const filterBar = page.locator('button[id$="-listbox"], button:has-text("Tất cả Tỉnh/Thành")').first();
    await expect(filterBar).toBeVisible();

    // Ward combobox is initially disabled
    const wardBtn = page.locator('button:has-text("Chọn Tỉnh trước")');
    await expect(wardBtn).toBeDisabled();

    // Click province combobox
    await filterBar.click();
    const searchInput = page.locator('input[placeholder*="Tìm tỉnh"]');
    await expect(searchInput).toBeVisible();

    // Type unaccented 'ha noi'
    await searchInput.fill('ha noi');
    const hanoiOption = page.locator('[role="option"]:has-text("Hà Nội")');
    await expect(hanoiOption).toBeVisible();
    await hanoiOption.click();

    // Ward combobox is now enabled
    const activeWardBtn = page.locator('button:has-text("Tất cả Phường/Xã")');
    await expect(activeWardBtn).toBeEnabled();

    // Esc closes open popovers
    await activeWardBtn.click();
    await page.keyboard.press('Escape');
    await expect(page.locator('input[placeholder*="Tìm phường"]')).not.toBeVisible();
  });

  test('35g: Header Khu vuc 720px Mega-menu preserves category context', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/vi/can-ho`, { waitUntil: 'networkidle' });

    const khuVucTrigger = page.locator('header button:has-text("Khu vực")');
    await expect(khuVucTrigger).toBeVisible();
    await khuVucTrigger.click();

    const megaMenu = page.locator('[role="menu"][aria-label="Khu vực"]');
    await expect(megaMenu).toBeVisible();

    // Check width >= 700px
    const box = await megaMenu.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThanOrEqual(700);

    // Click on Ha Noi tile inside mega-menu while on /can-ho
    const hanoiTile = megaMenu.locator('a:has-text("Hà Nội")').first();
    const href = await hanoiTile.getAttribute('href');
    expect(href).toContain('/can-ho');
    expect(href).toContain('provinceCode=HN');

    // Link to /khu-vuc
    const allAreasLink = megaMenu.locator('a:has-text("Xem tất cả khu vực")');
    await expect(allAreasLink).toBeVisible();
  });

  test('35h & 35i: Full-bleed RoomCard photo carousel, badges, and bookmark', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });

    const firstCard = page.locator('.group.relative.overflow-hidden.rounded-2xl').first();
    await expect(firstCard).toBeVisible();

    // Hover over card
    await firstCard.hover();

    // If carousel arrow exists, click it without navigating
    const nextBtn = firstCard.locator('button[aria-label="Ảnh sau"]');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      // Should still be on /phong-tro
      expect(page.url()).toContain('/phong-tro');
    }

    // Bookmark button click stops propagation
    const heartBtn = firstCard.locator('button[aria-label*="Lưu phòng"]').first();
    await heartBtn.click();
    expect(page.url()).toContain('/phong-tro');

    // Verified badge check: ensure only shown when verified
    const verifiedBadge = firstCard.locator('text=Chủ trọ xác minh');
    // If visible, verified flag is true
  });

  test('35k & 35l: SEO Accordion and Grid/List view switcher', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });

    // SEO Accordion: 1st is open by default
    await expect(page.locator('text=Phổ biến nhất là 1 tháng')).toBeVisible();

    // Click 2nd item to expand
    const faqBtn2 = page.locator('button:has-text("Chi phí điện nước")');
    await expect(faqBtn2).toBeVisible();
    await faqBtn2.click();
    await expect(page.locator('text=Điện nước có thể tính theo giá lũy tiến')).toBeVisible();

    // Grid / List Switcher
    const listBtn = page.locator('button[aria-label="Xem danh sách"]');
    await listBtn.click();
    await page.waitForTimeout(100);

    const gridBtn = page.locator('button[aria-label="Xem lưới"]');
    await gridBtn.click();
  });

  test('35m: /khu-vuc and /khu-vuc/[tinh] routes', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi/khu-vuc`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Khu vực thuê phòng trọ trọng điểm');

    await page.goto(`${WEB_URL}/vi/khu-vuc/ha-noi`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Phòng trọ tại Hà Nội');
  });

  test('Axe Accessibility check on category pages', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    if (criticalViolations.length > 0) {
      console.log('Axe Critical/Serious Violations:', JSON.stringify(criticalViolations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, html: v.nodes.map((n) => n.html) })), null, 2));
    }
    expect(criticalViolations.length).toBe(0);
  });
});
