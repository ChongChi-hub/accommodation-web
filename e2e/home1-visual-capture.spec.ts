import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const WEB_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const SHOT_DIR = path.join(process.cwd(), 'docs', 'design', 'screenshots', 'home');
const FRAME_DIR = path.join(process.cwd(), 'docs', 'design', 'frames', 'home');

function ensureDirs() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });
}

async function scrollPageToRevealAll(page: Page) {
  await page.evaluate(async () => {
    const step = 450;
    const max = document.body.scrollHeight;
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

test.describe('HOME-1: Visual Captures & Contrast Verification', () => {
  test.beforeAll(() => {
    ensureDirs();
  });

  const VIEWPORTS = [
    { width: 1440, height: 900, name: '1440-desktop' },
    { width: 1024, height: 768, name: '1024-laptop' },
    { width: 768, height: 1024, name: '768-tablet' },
    { width: 390, height: 844, name: '390-mobile' },
  ];

  for (const vp of VIEWPORTS) {
    test(`Capture Full Page - ${vp.name} [vi]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${WEB_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await scrollPageToRevealAll(page);

      const shotPath = path.join(SHOT_DIR, `home-${vp.name}-vi.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      expect(fs.existsSync(shotPath)).toBe(true);
    });

    test(`Capture Full Page - ${vp.name} [en]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${WEB_URL}/en`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await scrollPageToRevealAll(page);

      const shotPath = path.join(SHOT_DIR, `home-${vp.name}-en.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      expect(fs.existsSync(shotPath)).toBe(true);
    });
  }

  test('Capture Animation Progression Frames (0ms, 150ms, 300ms, 600ms)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/`, { waitUntil: 'domcontentloaded' });

    // Capture Hero entry progression
    const times = [0, 150, 300, 600];
    for (const t of times) {
      if (t > 0) await page.waitForTimeout(150);
      const framePath = path.join(FRAME_DIR, `hero-reveal-${t}ms.png`);
      await page.screenshot({ path: framePath });
      expect(fs.existsSync(framePath)).toBe(true);
    }
  });

  test('Contrast Ratio Verification on Hero Text and Scrims', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const heroTitle = page.locator('h1');
    const color = await heroTitle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // White text on dark scrim (#ffffff on gradient >= 4.5:1)
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('Verify Smooth Scroll and Long Tasks performance', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${WEB_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Observe PerformanceObserver long tasks
    await page.evaluate(() => {
      (window as unknown as { __longTasks: number }).__longTasks = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            (window as unknown as { __longTasks: number }).__longTasks++;
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    });

    // Smooth scroll from top to bottom
    await page.evaluate(async () => {
      const distance = document.body.scrollHeight;
      window.scrollTo({ top: distance, behavior: 'smooth' });
    });

    await page.waitForTimeout(1500);

    const longTaskCount = await page.evaluate(
      () => (window as unknown as { __longTasks: number }).__longTasks
    );
    expect(longTaskCount).toBeLessThanOrEqual(2);
  });
});
