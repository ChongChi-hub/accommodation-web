import { test, expect } from '@playwright/test';
import { checkA11y } from './helpers/axe-helper';

const PUBLIC_ROUTES = [
  '/vi',
  '/vi/rooms',
  '/vi/about',
  '/vi/safety-guide',
  '/vi/pricing',
  '/vi/faq',
  '/vi/contact',
  '/vi/terms',
  '/vi/privacy',
];

const AUTH_ROUTES = [
  '/vi/login',
  '/vi/register',
  '/vi/forgot-password',
  '/vi/reset-password?token=demo-token',
  '/vi/verify-email?token=demo-token',
];

const ADMIN_ROUTES = [
  '/vi/dashboard/admin',
  '/vi/dashboard/admin/rooms',
  '/vi/dashboard/admin/kyc',
  '/vi/dashboard/admin/users',
  '/vi/dashboard/admin/reports',
  '/vi/dashboard/admin/reviews',
  '/vi/dashboard/admin/dictionaries',
  '/vi/dashboard/admin/analytics',
  '/vi/dashboard/admin/audit-logs',
  '/vi/dashboard/admin/settings',
];

const LANDLORD_ROUTES = [
  '/vi/dashboard/landlord',
  '/vi/dashboard/landlord/rooms',
  '/vi/dashboard/landlord/rooms/new',
  '/vi/dashboard/landlord/appointments',
  '/vi/dashboard/landlord/rental-requests',
  '/vi/dashboard/landlord/contracts',
  '/vi/dashboard/landlord/tenants',
  '/vi/dashboard/landlord/utilities',
  '/vi/dashboard/landlord/invoices',
  '/vi/dashboard/landlord/analytics',
  '/vi/dashboard/landlord/reviews',
  '/vi/dashboard/landlord/messages',
  '/vi/dashboard/landlord/notifications',
  '/vi/dashboard/landlord/kyc',
  '/vi/dashboard/landlord/settings',
];

const TENANT_ROUTES = [
  '/vi/dashboard/tenant',
  '/vi/dashboard/tenant/profile',
  '/vi/dashboard/tenant/kyc',
  '/vi/dashboard/tenant/saved-rooms',
  '/vi/dashboard/tenant/saved-searches',
  '/vi/dashboard/tenant/appointments',
  '/vi/dashboard/tenant/rental-requests',
  '/vi/dashboard/tenant/contracts',
  '/vi/dashboard/tenant/invoices',
  '/vi/dashboard/tenant/payments',
  '/vi/dashboard/tenant/messages',
  '/vi/dashboard/tenant/notifications',
  '/vi/dashboard/tenant/reviews',
  '/vi/dashboard/tenant/settings',
];

test.describe('Public & Auth Routes Smoke Tests', () => {
  for (const route of [...PUBLIC_ROUTES, ...AUTH_ROUTES]) {
    test(`Loads ${route} cleanly without errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);

      // Verify no critical console errors
      expect(consoleErrors).toEqual([]);

      // Accessibility scan
      await checkA11y(page, route);
    });
  }
});

test.describe('Admin Routes Smoke Tests', () => {
  for (const route of ADMIN_ROUTES) {
    test(`Loads admin route ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      await checkA11y(page, route);
    });
  }
});

test.describe('Landlord Routes Smoke Tests', () => {
  for (const route of LANDLORD_ROUTES) {
    test(`Loads landlord route ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      await checkA11y(page, route);
    });
  }
});

test.describe('Tenant Routes Smoke Tests', () => {
  for (const route of TENANT_ROUTES) {
    test(`Loads tenant route ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      await checkA11y(page, route);
    });
  }
});

