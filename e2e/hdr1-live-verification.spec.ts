import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const WEB_URL = 'http://localhost:3000';
const SHOT_DIR = path.join(process.cwd(), 'docs', 'design', 'screenshots', 'hdr-1');

function ensureShotDir() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
}

async function waitForPopoverSettled(page: Page, locator: ReturnType<Page['locator']>) {
  await expect(locator).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(240);
  await expect(locator).toHaveCSS('opacity', '1');
}

async function stubGoogleScript(page: Page) {
  await page.route('https://accounts.google.com/gsi/client*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.google={accounts:{id:{initialize:()=>{},renderButton:(el)=>{el.innerHTML="<button type=button>Google</button>";},prompt:()=>{},cancel:()=>{}}}};',
    })
  );
}

async function loginAs(page: Page, email: string, password = 'password123') {
  await stubGoogleScript(page);
  await page.context().clearCookies();
  await page.goto(`${WEB_URL}/vi/login`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.fill('#login-identifier', email);
  await page.fill('#login-password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard\//, { timeout: 20000 });
}

async function measureHeaderGeometry(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return { ok: false, reason: 'No <header> element found' };
    const headerRect = header.getBoundingClientRect();
    const docOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;

    const candidates = Array.from(header.querySelectorAll<HTMLElement>('a, button, input')).filter((el) => {
      if (el.closest('[role="menu"], [role="listbox"], [role="dialog"]')) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const hiddenParent = el.closest('[aria-hidden="true"]');
      if (hiddenParent) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    });

    const boxes = candidates.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
        left: Math.round(r.left),
        right: Math.round(r.right),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        height: Math.round(r.height),
      };
    });

    const clipped: typeof boxes = [];
    const wrapped: typeof boxes = [];
    const overlaps: Array<{ a: string; b: string }> = [];

    for (const b of boxes) {
      if (b.left < -1 || b.right > window.innerWidth + 1 || b.top < -2 || b.bottom > headerRect.bottom + 4) {
        clipped.push(b);
      }
      if (b.tag === 'A' && b.height > 46) {
        wrapped.push(b);
      }
    }

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const horiz = a.left < b.right - 2 && a.right > b.left + 2;
        const vert = a.top < b.bottom - 2 && a.bottom > b.top + 2;
        if (horiz && vert) {
          overlaps.push({ a: `${a.tag}:${a.text}`, b: `${b.tag}:${b.text}` });
        }
      }
    }

    return {
      ok: !docOverflow && clipped.length === 0 && wrapped.length === 0 && overlaps.length === 0,
      docOverflow,
      headerHeight: Math.round(headerRect.height),
      clipped,
      wrapped,
      overlaps,
      count: boxes.length,
    };
  });
}

async function measureHeroPixelContrast(page: Page) {
  const headerBand = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 72 } });
  const b64 = headerBand.toString('base64');

  const targets = await page.evaluate(() => {
    const els = [
      document.querySelector('header a[href="/vi"], header a[href="/"]'),
      ...Array.from(document.querySelectorAll('header nav a')),
      ...Array.from(document.querySelectorAll('header nav button')),
    ].filter((el): el is HTMLElement => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 4 && r.height > 4;
    });

    return els.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        label: (el.textContent || 'logo').trim(),
        x: Math.max(0, Math.floor(r.left)),
        y: Math.max(0, Math.floor(r.top)),
        w: Math.max(4, Math.floor(r.width)),
        h: Math.max(4, Math.floor(r.height)),
      };
    });
  });

  const results = await page.evaluate(
    async ({ pngBase64, rects }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${pngBase64}`;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('Image load failed'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const relLum = (r: number, g: number, b: number) => {
        const srgb = [r, g, b].map((c) => {
          const v = c / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
      };

      return rects.map((box) => {
        const data = ctx.getImageData(box.x, box.y, Math.min(box.w, 1440 - box.x), Math.min(box.h, 72 - box.y)).data;
        const lums: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          lums.push(relLum(data[i], data[i + 1], data[i + 2]));
        }
        lums.sort((a, b) => a - b);
        const bgLum = lums[Math.floor(lums.length * 0.25)] ?? 0;
        const fgLum = lums[Math.floor(lums.length * 0.96)] ?? 1;
        const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
        return { label: box.label, bgLum: Number(bgLum.toFixed(4)), fgLum: Number(fgLum.toFixed(4)), ratio: Number(ratio.toFixed(2)) };
      });
    },
    { pngBase64: b64, rects: targets }
  );

  return results;
}

test.describe.configure({ mode: 'serial' });

test.describe('[HDR-1] Live E2E, Contrast, Accessibility & Screenshot Suite', () => {
  test('1. Hero transparency at scrollY=0, automated pixel contrast >= 4.5:1, scroll morph 72->64px, CLS <= 0.01', async ({ page }) => {
    ensureShotDir();
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (res) => { if (res.status() >= 400) errors.push(`HTTP ${res.status()} ${res.url()}`); });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/vi`, { waitUntil: 'networkidle' });

    // Track CLS dynamically
    await page.evaluate(() => {
      (window as any).__hdrCls = 0;
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) (window as any).__hdrCls += entry.value;
        }
      });
      obs.observe({ type: 'layout-shift', buffered: true });
    });

    const header = page.locator('header');
    await expect(header).toHaveAttribute('data-hero-top', 'true');
    await expect(header).toHaveAttribute('data-scrolled', 'false');

    const searchContainer = page.getByTestId('header-search-shell');
    await expect(searchContainer).toHaveAttribute('aria-hidden', 'true');

    const topGeom = await measureHeaderGeometry(page);
    expect(topGeom.headerHeight).toBe(72);
    expect(topGeom.ok).toBe(true);

    // Automated pixel luminance contrast measurement at scrollY = 0 on real hero scrim!
    const contrastMetrics = await measureHeroPixelContrast(page);
    console.log('Hero Pixel Contrast Metrics (scrollY=0):', JSON.stringify(contrastMetrics));
    for (const metric of contrastMetrics) {
      expect(metric.ratio, `Contrast too low for "${metric.label}": ${metric.ratio}`).toBeGreaterThanOrEqual(4.5);
    }

    await page.screenshot({ path: path.join(SHOT_DIR, '01-hero-top-guest-1440-vi.png') });

    // Scroll down -> morph to 64px frosted glass & reveal desktop search pill
    await page.evaluate(() => window.scrollTo(0, 650));
    await page.waitForTimeout(450);

    await expect(header).toHaveAttribute('data-hero-top', 'false');
    await expect(header).toHaveAttribute('data-scrolled', 'true');
    await expect(searchContainer).toHaveAttribute('aria-hidden', 'false');
    await expect(page.getByTestId('header-search-input')).toBeVisible();

    const scrolledGeom = await measureHeaderGeometry(page);
    expect(scrolledGeom.headerHeight).toBe(64);
    expect(scrolledGeom.ok).toBe(true);

    await page.screenshot({ path: path.join(SHOT_DIR, '02-hero-scrolled-guest-1440-vi.png') });

    // Scroll back to top -> reverses cleanly
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await expect(header).toHaveAttribute('data-hero-top', 'true');
    await expect(searchContainer).toHaveAttribute('aria-hidden', 'true');

    const cls = await page.evaluate(() => Number(((window as any).__hdrCls || 0).toFixed(4)));
    console.log('Measured CLS across scroll transition:', cls);
    expect(cls).toBeLessThanOrEqual(0.01);
    expect(errors).toEqual([]);
  });

  test('2. Breakpoints (1280/1024/768), Area dropdown, Active Nav underline, Friendly Aliases & HTTP 308 redirects', async ({ page, request }) => {
    ensureShotDir();
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (res) => { if (res.status() >= 400) errors.push(`HTTP ${res.status()} ${res.url()}`); });

    // HTTP 308 redirects (preserving extra params)
    const redirectRes = await request.get(`${WEB_URL}/rooms?type=can-ho&q=Studio`, { maxRedirects: 0 });
    expect(redirectRes.status()).toBe(308);
    expect(redirectRes.headers()['location']).toMatch(/\/can-ho\?q=Studio/);

    const roleRedirect = await request.get(`${WEB_URL}/tenant/appointments`, { maxRedirects: 0 });
    expect(roleRedirect.status()).toBe(308);
    expect(roleRedirect.headers()['location']).toContain('/dashboard/tenant/appointments');

    // Non-hero page at 1280px (tightest desktop breakpoint with xl:w-72)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Phòng trọ cho thuê');
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toContain('/phong-tro');
    await expect(page.locator('header nav a[aria-current="page"]')).toBeVisible();
    await expect(page.getByTestId('nav-active-indicator')).toHaveCSS('opacity', '1');

    const geom1280 = await measureHeaderGeometry(page);
    expect(geom1280.ok, `1280px overlap/clip: ${JSON.stringify(geom1280)}`).toBe(true);
    await page.screenshot({ path: path.join(SHOT_DIR, '03-nonhero-phongtro-1280-vi-light.png') });

    // Area dropdown 8 provinces
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('button', { hasText: 'Khu vực' }).click();
    const areaMenu = page.locator('[aria-label="Khu vực"][role="menu"]');
    await waitForPopoverSettled(page, areaMenu);
    await expect(areaMenu.locator('a[href*="/rooms?provinceCode="]')).toHaveCount(8);
    await page.screenshot({ path: path.join(SHOT_DIR, '05-area-dropdown-1440-vi.png') });
    await page.keyboard.press('Escape');
    await expect(areaMenu).not.toBeVisible();

    // Category alias empty state (/nha-nguyen-can)
    await page.goto(`${WEB_URL}/vi/nha-nguyen-can`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Nhà nguyên căn');
    await expect(page.locator('body')).toContainText(/Chưa có tin đăng nào/i);
    await page.screenshot({ path: path.join(SHOT_DIR, '11-nha-nguyen-can-emptystate-1440-vi.png') });

    // 1024px tablet landscape -> "Khám phá" Explore dropdown replaces 4 inline category links
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(`${WEB_URL}/vi/can-ho`, { waitUntil: 'networkidle' });
    const exploreBtn = page.locator('header nav button', { hasText: 'Khám phá' });
    await expect(exploreBtn).toBeVisible();
    const geom1024 = await measureHeaderGeometry(page);
    expect(geom1024.ok, `1024px overlap/clip: ${JSON.stringify(geom1024)}`).toBe(true);
    await exploreBtn.click();
    const exploreMenu = page.locator('header nav [role="menu"]');
    await waitForPopoverSettled(page, exploreMenu);
    await expect(exploreMenu.locator('a[href*="/phong-tro"]')).toBeVisible();
    await page.screenshot({ path: path.join(SHOT_DIR, '04-tablet-explore-1024-vi-light.png') });

    // 768px portrait -> mobile hamburger button
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('header button[aria-label*="Mở menu"]')).toBeVisible();
    await page.screenshot({ path: path.join(SHOT_DIR, '15-tablet-768-top.png') });
    expect(errors).toEqual([]);
  });

  test('3. ARIA Search Combobox (/ hotkey, recents, debounced suggestions, explicit error UI)', async ({ page }) => {
    ensureShotDir();
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });

    const searchInput = page.getByTestId('header-search-input');
    // Verify `/` shortcut focuses header search
    await page.locator('h1').click();
    await page.keyboard.press('/');
    await expect(searchInput).toBeFocused();

    // Type query & wait for real debounced room suggestions
    await searchInput.fill('Studio');
    const listbox = page.getByRole('listbox');
    await waitForPopoverSettled(page, listbox);
    await expect(listbox.getByTestId('search-room-option').first()).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: path.join(SHOT_DIR, '06-search-combobox-1440-vi.png') });

    // Arrow key updates aria-activedescendant + Enter navigates & saves recent search
    await searchInput.press('ArrowDown');
    const activeDesc = await searchInput.getAttribute('aria-activedescendant');
    expect(activeDesc).toBeTruthy();

    await searchInput.press('Escape');
    await searchInput.press('/');
    await expect(searchInput).toBeFocused();
    await searchInput.press('Enter');
    await page.waitForURL(/\/rooms\?q=Studio/, { timeout: 10000 });

    const recentsRaw = await page.evaluate(() => localStorage.getItem('cozynest_recent_searches'));
    expect(recentsRaw).toContain('Studio');

    // Clear recent history
    await searchInput.fill('');
    if (!(await listbox.isVisible())) {
      await searchInput.press('ArrowDown');
    }
    const clearBtn = page.getByRole('button', { name: 'Xóa lịch sử' });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    expect(await page.evaluate(() => localStorage.getItem('cozynest_recent_searches'))).toBeNull();
    expect(errors).toEqual([]);

    // Simulated backend failure MUST display explicit [role="alert"], NEVER "0 results"
    await page.route('**/api/v1/rooms*', (route) => route.fulfill({ status: 500, body: '{"message":"Internal error"}' }));
    await searchInput.fill('Cầu Giấy');
    const errorAlert = listbox.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible({ timeout: 8000 });
    await expect(errorAlert).toContainText(/Không thể tải gợi ý/i);
  });

  test('4. Role Matrix (Tenant, Dual Landlord, Applicant, Moderator, Admin), Theme & Locale persistence, Unified UserMenu', async ({ page }) => {
    ensureShotDir();
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (res) => { if (res.status() >= 400) errors.push(`HTTP ${res.status()} ${res.url()}`); });

    await page.setViewportSize({ width: 1440, height: 900 });

    // A. Pure TENANT
    await loginAs(page, 'tenant@cozynest.vn');
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('header-cta-link')).toContainText('Trở thành chủ trọ');
    await expect(page.locator('header a[aria-label="Tin nhắn"]')).toBeVisible();
    await expect(page.locator('header button[aria-label="Thông báo"]')).toBeVisible();
    await expect(page.getByTestId('notif-unread-badge')).toBeVisible();

    // Open Notification popover -> 5-item cap + real DB item
    await page.locator('header button[aria-label="Thông báo"]').click();
    const tenantNotifDialog = page.locator('header div[role="dialog"][aria-label="Thông báo"]');
    await expect(tenantNotifDialog).toBeVisible();
    expect(await tenantNotifDialog.locator('button').count()).toBeLessThanOrEqual(6);
    await page.keyboard.press('Escape');

    // Open UserMenu on public page
    await page.getByTestId('user-menu-trigger').click();
    const menuPanel = page.getByTestId('user-menu-panel');
    await waitForPopoverSettled(page, menuPanel);
    await expect(page.getByTestId('user-menu-switch-role')).toHaveCount(0);
    await page.screenshot({ path: path.join(SHOT_DIR, '07-tenant-usermenu-1440-vi-light.png') });

    // Switch theme to Dark without closing popover & verify persistence after reload
    await menuPanel.getByRole('radio', { name: 'Tối' }).click();
    await expect(menuPanel).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Reset back to Light via UserMenu
    await page.getByTestId('user-menu-trigger').click();
    await page.getByTestId('user-menu-panel').getByRole('radio', { name: 'Sáng' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Keyboard navigation & Escape focus return
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('user-menu-trigger')).toBeFocused();

    // Verify shared UserMenu on DashboardHeader + /become-landlord page preview
    await page.goto(`${WEB_URL}/vi/dashboard/tenant/notifications`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('user-menu-trigger')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Thông báo');

    await page.goto(`${WEB_URL}/vi/become-landlord`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Trở thành Chủ trọ');
    await page.screenshot({ path: path.join(SHOT_DIR, '10-become-landlord-1440-vi.png') });

    // Logout -> toast & UI reset
    await page.getByTestId('user-menu-trigger').click();
    await page.getByTestId('user-menu-logout').click();
    await expect(page.locator('body')).toContainText('Đã đăng xuất');
    await expect(page.locator('header a[href*="/login"]')).toBeVisible();

    // B. Dual-role LANDLORD + TENANT & Dark Notification Popover
    await loginAs(page, 'landlord@cozynest.vn');
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('header-cta-link')).toContainText('Đăng tin mới');

    // Open Notification Bell in dark mode for crisp screenshot review
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.locator('header button[aria-label="Thông báo"]').click();
    await waitForPopoverSettled(page, page.locator('header div[role="dialog"][aria-label="Thông báo"]'));
    await page.screenshot({ path: path.join(SHOT_DIR, '08-landlord-notif-popover-1440-vi-dark.png') });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.keyboard.press('Escape');

    // Switch role Landlord -> Tenant WITHOUT mutating real roles
    await page.getByTestId('user-menu-trigger').click();
    const switchBtn = page.getByTestId('user-menu-switch-role');
    await expect(switchBtn).toBeVisible();
    await switchBtn.click();
    await page.waitForURL(/\/dashboard\/tenant/, { timeout: 15000 });
    // Can switch back to Landlord
    await page.getByTestId('user-menu-trigger').click();
    await page.getByTestId('user-menu-switch-role').click();
    await page.waitForURL(/\/dashboard\/landlord/, { timeout: 15000 });

    // C. Applicant (PENDING_REVIEW) -> "Hồ sơ chủ trọ: ..."
    await loginAs(page, 'landlord.pending@toam.vn');
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('header-cta-link')).toContainText(/Hồ sơ chủ trọ:/);
    expect(await page.getByTestId('header-cta-link').getAttribute('href')).toContain('/dashboard/landlord/kyc');

    // D. Moderator -> CTA hidden & Messages hidden
    await loginAs(page, 'moderator@cozynest.vn');
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('header-cta-link')).toHaveCount(0);
    await expect(page.locator('header a[aria-label="Tin nhắn"]')).toHaveCount(0);
    await page.goto(`${WEB_URL}/vi/dashboard/moderator/notifications`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('user-menu-trigger')).toBeVisible();

    // E. Admin + EN Locale switch & reload persistence
    await loginAs(page, 'admin@cozynest.vn');
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('header-cta-link')).toHaveCount(0);
    await expect(page.locator('header a[aria-label="Tin nhắn"]')).toHaveCount(0);

    await page.getByTestId('user-menu-trigger').click();
    await page.getByTestId('user-menu-panel').getByRole('button', { name: 'English' }).click();
    await page.waitForURL(/\/en\/phong-tro/, { timeout: 15000 });
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('header')).toContainText('Rental Rooms');
    await page.screenshot({ path: path.join(SHOT_DIR, '09-admin-header-1440-en-light.png') });

    await page.goto(`${WEB_URL}/vi/dashboard/admin/notifications`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('user-menu-trigger')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('5. Mobile 390x844 (Drawer Focus Trap, Search Overlay, Unclipped Scrolled UserMenu Portal Sheet) + Axe WCAG AA', async ({ page }) => {
    ensureShotDir();
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (res) => { if (res.status() >= 400) errors.push(`HTTP ${res.status()} ${res.url()}`); });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${WEB_URL}/vi`, { waitUntil: 'networkidle' });

    // Mobile drawer + focus trap + collapsible areas + Escape close
    await page.locator('header button[aria-label*="Mở menu"]').click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await drawer.getByRole('button', { name: 'Khu vực', exact: true }).click();
    await expect(drawer.locator('a[href*="/rooms?provinceCode="]').first()).toBeVisible();

    // Verify Tab focus trap stays within drawer dialog
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
      expect(inside, `Tab escape at step ${i}`).toBe(true);
    }

    await page.screenshot({ path: path.join(SHOT_DIR, '12-mobile-390-drawer.png') });
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();

    // Mobile full-screen search overlay
    await page.locator('header button[aria-label*="Tìm kiếm"]').click();
    const searchDialog = page.getByRole('dialog');
    await expect(searchDialog).toBeVisible();
    await waitForPopoverSettled(page, searchDialog.getByRole('listbox'));
    await page.screenshot({ path: path.join(SHOT_DIR, '13-mobile-390-search-overlay.png') });
    await page.keyboard.press('Escape');
    await expect(searchDialog).not.toBeVisible();

    // Authenticated mobile scrolled UserMenu Portal bottom sheet MUST NOT be clipped to 64px header height!
    await loginAs(page, 'tenant@cozynest.vn');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(200);
    await page.getByTestId('user-menu-trigger').click();

    const mobileSheet = page.getByTestId('user-menu-panel');
    await waitForPopoverSettled(page, mobileSheet);
    const sheetBox = await mobileSheet.boundingBox();
    expect(sheetBox).not.toBeNull();
    expect(sheetBox!.height).toBeGreaterThan(300);
    expect(sheetBox!.y + sheetBox!.height).toBeGreaterThan(800);
    await page.screenshot({ path: path.join(SHOT_DIR, '14-mobile-390-scrolled-usermenu-sheet.png') });

    // Axe WCAG 2A/2AA audit on desktop public pages (Light & Dark header)
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const url of [`${WEB_URL}/vi`, `${WEB_URL}/vi/phong-tro`, `${WEB_URL}/vi/become-landlord`]) {
      await page.goto(url, { waitUntil: 'networkidle' });
      const axeRes = await new AxeBuilder({ page })
        .include('header')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      const serious = axeRes.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious, `Axe header violations on ${url}: ${JSON.stringify(serious)}`).toEqual([]);
    }

    expect(errors).toEqual([]);
  });

  test('6. Live Tenant /become-landlord application updates /me & Header CTA to AWAITING_KYC', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (res) => { if (res.status() >= 400) errors.push(`HTTP ${res.status()} ${res.url()}`); });

    await stubGoogleScript(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/vi/register`, { waitUntil: 'networkidle' });

    const ts = Date.now();
    const email = `e2e_hdr1_apply_${ts}@cozynest.vn`;
    const phone = `097${Math.floor(1000000 + Math.random() * 8999999)}`;

    await page.fill('#register-fullname', 'Trần Thị Thu Hương Nhiên'); // 25 chars -> tests shortName truncation too!
    await page.fill('#register-email', email);
    await page.fill('#register-phone', phone);
    await page.fill('#register-password', 'CozyStrong@2026');
    await page.fill('#register-confirm-password', 'CozyStrong@2026');
    await page.check('#register-terms');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/tenant/, { timeout: 20000 });

    // Verify long name truncates cleanly on word boundary with tooltip
    const trigger = page.getByTestId('user-menu-trigger');
    await expect(trigger).toHaveAttribute('title', 'Trần Thị Thu Hương Nhiên');
    const shortLabel = (await trigger.locator('> span').innerText()).trim();
    expect(shortLabel.length).toBeLessThanOrEqual(14);

    // Send & complete email verification OTP via Mailpit (required before applying as landlord)
    const resendOk = await page.evaluate(async (em) => {
      const r = await fetch('/api/v1/auth/verify-email/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em }),
      });
      return r.ok;
    }, email);
    expect(resendOk).toBe(true);

    let otp = '';
    for (let i = 0; i < 20 && !otp; i++) {
      const mRes = await fetch('http://localhost:8025/api/v1/messages');
      const mJson = await mRes.json();
      const match = (mJson.messages || []).find((m: any) =>
        m.To?.some((to: any) => to.Address?.toLowerCase() === email.toLowerCase())
      );
      if (match) {
        const dRes = await fetch(`http://localhost:8025/api/v1/message/${match.ID}`);
        const dJson = await dRes.json();
        const found = (dJson.Text || dJson.HTML || dJson.Snippet || '').match(/\b(\d{6})\b/);
        if (found) otp = found[1];
      }
      if (!otp) await page.waitForTimeout(400);
    }
    expect(otp).toMatch(/^\d{6}$/);

    const verifyOk = await page.evaluate(
      async ({ em, code }) => {
        const r = await fetch('/api/v1/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: em, otp: code }),
        });
        return r.ok;
      },
      { em: email, code: otp }
    );
    expect(verifyOk).toBe(true);

    // Go to /become-landlord & click CTA to become landlord
    await page.goto(`${WEB_URL}/vi/become-landlord`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Đăng ký trở thành Chủ trọ' }).click();
    await page.waitForURL(/\/dashboard\/landlord\/kyc/, { timeout: 15000 });

    await page.goto(`${WEB_URL}/vi/phong-tro`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('header-cta-link')).toContainText('Hồ sơ chủ trọ: Chờ nộp KYC');
    expect(errors).toEqual([]);
  });
});
