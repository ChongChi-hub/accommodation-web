/**
 * @vitest-environment jsdom
 */
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import viMessages from '@/i18n/messages/vi.json';
import enMessages from '@/i18n/messages/en.json';
import {
  APP_ROUTES,
  HEADER_SEARCH_ON_HOME_TOP,
  resolveRoomTypeRedirectPath,
} from '@/shared/routes';
import {
  NAVIGATION_ITEMS,
  NavItemConfig,
  getNavItemsByGroup,
  isNavItemVisible,
} from '@/shared/navigation';
import {
  formatShortName,
  getEffectiveRole,
  getHeaderCtaState,
  resolveHome,
} from '@/presentation/utils/user-display';
import { User } from '@/domain/entities/User';
import { UserMenu } from '@/presentation/components/layout/UserMenu';
import { UserMenuPanel } from '@/presentation/components/layout/UserMenuPanel';
import { useAuthStore } from '@/presentation/stores/auth.store';

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
  useLocale: () => 'vi',
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={typeof href === 'string' ? href : String(href)} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => '/',
}));

function resolveNestedKey(obj: any, dotPath: string): unknown {
  return dotPath.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);
}

function collectDiskPageRoutes(dir: string, baseRoute = ''): Set<string> {
  const routes = new Set<string>();
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name === 'page.tsx') {
      routes.add(baseRoute || '/');
    } else if (entry.isDirectory()) {
      const full = path.join(dir, entry.name);
      if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
        for (const r of collectDiskPageRoutes(full, baseRoute)) routes.add(r);
      } else {
        const nextRoute = `${baseRoute}/${entry.name}`;
        for (const r of collectDiskPageRoutes(full, nextRoute)) routes.add(r);
      }
    }
  }
  return routes;
}

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'u-1',
  email: 'user@cozynest.vn',
  phone: '0912345678',
  fullName: 'Nguyễn Minh An',
  avatarUrl: null,
  gender: null,
  dateOfBirth: null,
  roles: ['TENANT'],
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('[HDR-1] Navigation, Routing, Display & UserMenu Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it.each([
    { input: null, expected: 'Người dùng', truncated: false },
    { input: '   ', expected: 'Người dùng', truncated: false },
    { input: 'An Lê', expected: 'An Lê', truncated: false },
    { input: 'Nguyễn Minh An', expected: 'Nguyễn Minh An', truncated: false }, // exactly 14 chars
    { input: 'Nguyễn Trần Hoàng Bách', expected: 'Nguyễn Trần', truncated: true },
    { input: 'NGUYỄN VĂN HOÀNG ANH', expected: 'NGUYỄN VĂN', truncated: true },
    { input: 'Antidisestablishmentarianism', expected: 'Antidisestabl…', truncated: true },
    { input: '  Lê   Thành   Cường   VIP  ', expected: 'Lê Thành Cường', truncated: true },
  ])('formatShortName($input) -> $expected (max 14 chars)', ({ input, expected, truncated }) => {
    const res = formatShortName(input, 14);
    expect(res.shortName).toBe(expected);
    expect(res.shortName.length).toBeLessThanOrEqual(14);
    expect(res.isTruncated).toBe(truncated);
  });

  it('resolveHome resolves deterministic home paths per effective role', () => {
    expect(resolveHome(null)).toBe('/login');
    expect(resolveHome(makeUser({ roles: ['TENANT'] }))).toBe('/dashboard/tenant');
    expect(resolveHome(makeUser({ roles: ['LANDLORD'] }))).toBe('/dashboard/landlord');
    expect(resolveHome(makeUser({ roles: ['MODERATOR'] }))).toBe('/dashboard/moderator');
    expect(resolveHome(makeUser({ roles: ['ADMIN'] }))).toBe('/dashboard/admin');

    const dualUser = makeUser({ roles: ['TENANT', 'LANDLORD'] });
    expect(resolveHome(dualUser)).toBe('/dashboard/landlord');
    expect(resolveHome(dualUser, 'TENANT')).toBe('/dashboard/tenant');
    expect(resolveHome(dualUser, 'LANDLORD')).toBe('/dashboard/landlord');

    // Pure tenant cannot escalate via preferredRole cookie
    expect(getEffectiveRole(makeUser({ roles: ['TENANT'] }), 'ADMIN')).toBe('TENANT');
    expect(resolveHome(makeUser({ roles: ['TENANT'] }), 'LANDLORD')).toBe('/dashboard/tenant');
  });

  it('resolveRoomTypeRedirectPath maps query room types to canonical friendly aliases', () => {
    expect(HEADER_SEARCH_ON_HOME_TOP).toBe(false);
    expect(resolveRoomTypeRedirectPath('can-ho')).toBe('/can-ho');
    expect(resolveRoomTypeRedirectPath('MINI_APARTMENT')).toBe('/can-ho');
    expect(resolveRoomTypeRedirectPath('STUDIO')).toBe('/can-ho');
    expect(resolveRoomTypeRedirectPath('SINGLE')).toBe('/phong-tro');
    expect(resolveRoomTypeRedirectPath('FULL_HOUSE')).toBe('/nha-nguyen-can');
    expect(resolveRoomTypeRedirectPath('SHARED')).toBe('/o-ghep');
    expect(resolveRoomTypeRedirectPath('unknown')).toBeNull();
  });

  it('getHeaderCtaState obeys AUTH-FLOW-B rules across all roles and KYC statuses', () => {
    expect(getHeaderCtaState(null)).toMatchObject({ visible: true, mode: 'guest', href: '/register?role=landlord' });
    expect(getHeaderCtaState(makeUser({ roles: ['TENANT'], landlordApplication: { status: 'NOT_APPLIED' } }))).toMatchObject({
      visible: true,
      mode: 'tenant',
      href: '/become-landlord',
    });
    expect(getHeaderCtaState(makeUser({ roles: ['TENANT'], landlordApplication: { status: 'PENDING' } }))).toMatchObject({
      visible: true,
      mode: 'applicant',
      href: '/dashboard/landlord/kyc',
      status: 'PENDING',
    });
    expect(getHeaderCtaState(makeUser({ roles: ['LANDLORD'] }))).toMatchObject({
      visible: true,
      mode: 'landlord',
      href: '/dashboard/landlord/rooms/new',
    });
    expect(getHeaderCtaState(makeUser({ roles: ['ADMIN'] }))).toEqual({ visible: false, mode: 'hidden' });
    expect(getHeaderCtaState(makeUser({ roles: ['MODERATOR'] }))).toEqual({ visible: false, mode: 'hidden' });
  });

  it('disk crawler verifies every enabled navigation item and APP_ROUTES entry points to a real page.tsx', () => {
    const appDir = path.resolve(process.cwd(), 'src/app/[locale]');
    const diskRoutes = collectDiskPageRoutes(appDir);

    for (const [key, rawPath] of Object.entries(APP_ROUTES)) {
      const cleanPath = rawPath.split('?')[0];
      expect(diskRoutes.has(cleanPath), `APP_ROUTES.${key} (${cleanPath}) missing page.tsx on disk`).toBe(true);
    }

    for (const item of NAVIGATION_ITEMS) {
      if (item.enabled) {
        const cleanPath = APP_ROUTES[item.routeKey].split('?')[0];
        expect(diskRoutes.has(cleanPath), `NAV item ${item.id} (${cleanPath}) missing page.tsx`).toBe(true);
      }
      expect(resolveNestedKey(viMessages, item.labelKey), `Missing vi key ${item.labelKey}`).toBeTypeOf('string');
      expect(resolveNestedKey(enMessages, item.labelKey), `Missing en key ${item.labelKey}`).toBeTypeOf('string');
    }

    const sampleItems: NavItemConfig[] = [
      ...NAVIGATION_ITEMS,
      { id: 'disabled-future', routeKey: 'home', labelKey: 'header.nav.blog', roles: ['TENANT'], enabled: false, group: 'topPrimary' },
    ];
    expect(isNavItemVisible(sampleItems[sampleItems.length - 1], 'TENANT')).toBe(false);
    expect(getNavItemsByGroup('topPrimary', 'TENANT', sampleItems).some((i) => i.id === 'disabled-future')).toBe(false);
  });

  it('UserMenu hides for GUEST and respects 5-role action matrix + non-mutating dual-role switch', () => {
    useAuthStore.setState({ user: null, activeRole: null, isAuthenticated: false, hasHydrated: true });
    const guestRender = render(<UserMenu />);
    expect(guestRender.container).toBeEmptyDOMElement();
    cleanup();

    // Pure TENANT -> no switch button
    const onSwitch = vi.fn();
    render(
      <UserMenuPanel
        user={makeUser({ roles: ['TENANT'] })}
        effectiveRole="TENANT"
        unreadNotifications={2}
        unreadMessages={1}
        onClose={vi.fn()}
        onSwitchRole={onSwitch}
        onLogout={vi.fn()}
      />
    );
    expect(screen.queryByTestId('user-menu-switch-role')).not.toBeInTheDocument();
    expect(screen.getAllByRole('menuitem').some((el) => el.getAttribute('href') === '/dashboard/tenant/messages')).toBe(true);
    cleanup();

    // Pure LANDLORD -> no switch button
    render(
      <UserMenuPanel
        user={makeUser({ roles: ['LANDLORD'] })}
        effectiveRole="LANDLORD"
        unreadNotifications={0}
        unreadMessages={0}
        onClose={vi.fn()}
        onSwitchRole={onSwitch}
        onLogout={vi.fn()}
      />
    );
    expect(screen.queryByTestId('user-menu-switch-role')).not.toBeInTheDocument();
    cleanup();

    // Dual-role LANDLORD+TENANT -> shows switch button & never mutates user.roles
    const dualUser = makeUser({ roles: ['TENANT', 'LANDLORD'] });
    useAuthStore.setState({ user: dualUser, activeRole: 'LANDLORD', isAuthenticated: true, hasHydrated: true });
    expect(useAuthStore.getState().switchRole('TENANT')).toBe(true);
    expect(useAuthStore.getState().activeRole).toBe('TENANT');
    expect(useAuthStore.getState().user?.roles).toEqual(['TENANT', 'LANDLORD']);

    render(
      <UserMenuPanel
        user={dualUser}
        effectiveRole="LANDLORD"
        unreadNotifications={0}
        unreadMessages={0}
        onClose={vi.fn()}
        onSwitchRole={onSwitch}
        onLogout={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('user-menu-switch-role'));
    expect(onSwitch).toHaveBeenCalledWith('TENANT');
    cleanup();

    // MODERATOR & ADMIN -> <= 5 role actions and NO messages link
    for (const staffRole of ['MODERATOR', 'ADMIN'] as const) {
      render(
        <UserMenuPanel
          user={makeUser({ roles: [staffRole] })}
          effectiveRole={staffRole}
          unreadNotifications={1}
          unreadMessages={0}
          onClose={vi.fn()}
          onSwitchRole={onSwitch}
          onLogout={vi.fn()}
        />
      );
      expect(screen.queryByTestId('user-menu-switch-role')).not.toBeInTheDocument();
      const roleActions = getNavItemsByGroup('userRoleActions', staffRole);
      expect(roleActions.length).toBeLessThanOrEqual(5);
      const hrefs = screen.getAllByRole('menuitem').map((el) => el.getAttribute('href'));
      expect(hrefs.some((h) => h?.includes('/messages'))).toBe(false);
      cleanup();
    }
  });
});
