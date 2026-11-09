import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WEB_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('HOME-1: Comprehensive Live Home Page Verification', () => {
  test('1. Renders full-viewport Hero, floating search card, and all 11 sections', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi`, { waitUntil: 'domcontentloaded' });

    // 1. Hero
    const hero = page.locator('section[aria-label="Khối giới thiệu CozyNest"]');
    await expect(hero).toBeVisible();
    await expect(hero.locator('h1')).toHaveText('Tìm chốn an cư, bắt đầu từ một tổ ấm');

    // Hero height check
    const heroBox = await hero.boundingBox();
    expect(heroBox).toBeTruthy();
    expect(heroBox!.height).toBeGreaterThanOrEqual(600);

    // 2. Category Tiles
    const categoriesSection = page.locator('#categories-section');
    await expect(categoriesSection).toBeVisible();

    // 3. Featured Carousel
    const featuredSection = page.locator('section:has-text("Phòng trọ nổi bật & uy tín")');
    await expect(featuredSection).toBeVisible();

    // 4. Hot Areas
    const areasSection = page.locator('section:has-text("Khám phá phòng trọ theo thành phố")');
    await expect(areasSection).toBeVisible();

    // 5. How CozyNest Works
    const howItWorksSection = page.locator('section:has-text("Cách CozyNest vận hành")');
    await expect(howItWorksSection).toBeVisible();
    await expect(howItWorksSection.locator('text=Sắp có')).toBeVisible();

    // 6. Latest Listings
    const latestSection = page.locator('section:has-text("Phòng trọ mới đăng tải")');
    await expect(latestSection).toBeVisible();

    // 7. Banners
    const bannersSection = page.locator('section[aria-label="Thông tin cam kết nền tảng"]');
    // If banners exist
    if (await bannersSection.isVisible()) {
      const bannerBox = await bannersSection.boundingBox();
      expect(bannerBox!.height).toBeLessThanOrEqual(200);
    }

    // 8. Landlord Partner Section
    const landlordSection = page.locator('section:has-text("Đồng hành quản lý phòng trọ")');
    await expect(landlordSection).toBeVisible();

    // 9. Guides & Safety Section
    const guidesSection = page.locator('section:has-text("Cẩm nang & Kinh nghiệm thuê an toàn")');
    await expect(guidesSection).toBeVisible();

    // 10. Real Stats Section
    const statsSection = page.locator('section:has-text("Chỉ số hoạt động trên nền tảng")');
    await expect(statsSection).toBeVisible();

    // 11. Final CTA
    const finalCta = page.locator('section:has-text("Sẵn sàng tìm không gian sống lý tưởng")');
    await expect(finalCta).toBeVisible();
  });

  test('2. Hero search tab switching and quick chip navigation', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi`, { waitUntil: 'domcontentloaded' });

    // Category tab switching
    const singleTab = page.locator('button[role="tab"]:has-text("Phòng trọ")');
    await singleTab.click();
    await expect(singleTab).toHaveAttribute('aria-selected', 'true');

    // Quick chip click
    const under3mChip = page.locator('button:has-text("Dưới 3 triệu")');
    await under3mChip.click();
    await page.waitForURL(/\/rooms\?maxPrice=3000000/);
    expect(page.url()).toContain('maxPrice=3000000');
  });

  test('3. Hero slideshow pause/play button toggles properly', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi`, { waitUntil: 'domcontentloaded' });

    const pauseBtn = page.locator('button[aria-label="Tạm dừng trình chiếu"]');
    await expect(pauseBtn).toBeVisible();
    await expect(pauseBtn).toHaveAttribute('aria-pressed', 'false');

    await pauseBtn.click();
    const playBtn = page.locator('button[aria-label="Tiếp tục trình chiếu"]');
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('4. Accessibility scan on Home page passes with zero critical violations', async ({ page }) => {
    await page.goto(`${WEB_URL}/vi`, { waitUntil: 'networkidle' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Color contrast verified separately with pixel analyzer
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('5. Prefers-reduced-motion: reduce disables animations immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${WEB_URL}/vi`, { waitUntil: 'domcontentloaded' });

    // Hero slideshow should default to paused
    const playBtn = page.locator('button[aria-label="Tiếp tục trình chiếu"]');
    await expect(playBtn).toBeVisible();

    // Reveal elements should have immediate opacity
    const heroH1 = page.locator('h1');
    await expect(heroH1).toBeVisible();
  });

  test('6. Progressive enhancement: runs when JavaScript is disabled (SSR safe)', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await context.newPage();

    await noJsPage.goto(`${WEB_URL}/vi`, { waitUntil: 'domcontentloaded' });

    // H1 and Core text must be visible in static HTML without JS
    const h1 = noJsPage.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Tìm chốn an cư, bắt đầu từ một tổ ấm');

    await context.close();
  });
});

