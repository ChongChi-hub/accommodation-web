import { APP_ROUTES, RouteKey } from './routes';

export type NavVisibilityRole = 'GUEST' | 'TENANT' | 'LANDLORD' | 'MODERATOR' | 'ADMIN';

export type NavGroup =
  | 'topPrimary'
  | 'topCategories'
  | 'userRoleActions'
  | 'userAccountActions'
  | 'userFooter';

export interface NavItemConfig {
  id: string;
  routeKey: RouteKey;
  labelKey: string;
  roles: NavVisibilityRole[];
  enabled: boolean;
  group: NavGroup;
  badgeType?: 'messages' | 'notifications' | 'modQueue';
}

const ALL_ROLES: NavVisibilityRole[] = ['GUEST', 'TENANT', 'LANDLORD', 'MODERATOR', 'ADMIN'];

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // Top Desktop Room Categories (collapsed into "Khám phá" at 1024-1279)
  { id: 'cat-phong-tro', routeKey: 'phongTro', labelKey: 'header.nav.phongTro', roles: ALL_ROLES, enabled: true, group: 'topCategories' },
  { id: 'cat-nha-nguyen-can', routeKey: 'nhaNguyenCan', labelKey: 'header.nav.nhaNguyenCan', roles: ALL_ROLES, enabled: true, group: 'topCategories' },
  { id: 'cat-can-ho', routeKey: 'canHo', labelKey: 'header.nav.canHo', roles: ALL_ROLES, enabled: true, group: 'topCategories' },
  { id: 'cat-o-ghep', routeKey: 'oGhep', labelKey: 'header.nav.oGhep', roles: ALL_ROLES, enabled: true, group: 'topCategories' },
  { id: 'top-blog', routeKey: 'blog', labelKey: 'header.nav.blog', roles: ALL_ROLES, enabled: true, group: 'topPrimary' },

  // UserMenu Group 2: Tenant Role Items (<= 5)
  { id: 't-my-room', routeKey: 'tenantMyRoom', labelKey: 'userMenu.items.myRoom', roles: ['TENANT'], enabled: true, group: 'userRoleActions' },
  { id: 't-saved-rooms', routeKey: 'tenantSavedRooms', labelKey: 'userMenu.items.savedRooms', roles: ['TENANT'], enabled: true, group: 'userRoleActions' },
  { id: 't-appointments', routeKey: 'tenantAppointments', labelKey: 'userMenu.items.appointments', roles: ['TENANT'], enabled: true, group: 'userRoleActions' },
  { id: 't-contracts', routeKey: 'tenantContracts', labelKey: 'userMenu.items.contracts', roles: ['TENANT'], enabled: true, group: 'userRoleActions' },
  { id: 't-invoices', routeKey: 'tenantInvoices', labelKey: 'userMenu.items.invoices', roles: ['TENANT'], enabled: true, group: 'userRoleActions' },

  // UserMenu Group 2: Landlord Role Items (<= 5)
  { id: 'l-rooms', routeKey: 'landlordRooms', labelKey: 'userMenu.items.myListings', roles: ['LANDLORD'], enabled: true, group: 'userRoleActions' },
  { id: 'l-new-room', routeKey: 'landlordNewRoom', labelKey: 'userMenu.items.postRoom', roles: ['LANDLORD'], enabled: true, group: 'userRoleActions' },
  { id: 'l-appointments', routeKey: 'landlordAppointments', labelKey: 'userMenu.items.appointments', roles: ['LANDLORD'], enabled: true, group: 'userRoleActions' },
  { id: 'l-contracts', routeKey: 'landlordContracts', labelKey: 'userMenu.items.contracts', roles: ['LANDLORD'], enabled: true, group: 'userRoleActions' },
  { id: 'l-invoices', routeKey: 'landlordInvoices', labelKey: 'userMenu.items.invoices', roles: ['LANDLORD'], enabled: true, group: 'userRoleActions' },

  // UserMenu Group 2: Moderator Role Items (<= 5)
  { id: 'm-home', routeKey: 'moderatorHome', labelKey: 'userMenu.items.modQueue', roles: ['MODERATOR'], enabled: true, group: 'userRoleActions', badgeType: 'modQueue' },
  { id: 'm-rooms', routeKey: 'moderatorRooms', labelKey: 'userMenu.items.reviewRooms', roles: ['MODERATOR'], enabled: true, group: 'userRoleActions' },
  { id: 'm-kyc', routeKey: 'moderatorKyc', labelKey: 'userMenu.items.reviewKyc', roles: ['MODERATOR'], enabled: true, group: 'userRoleActions' },
  { id: 'm-reports', routeKey: 'moderatorReports', labelKey: 'userMenu.items.violationReports', roles: ['MODERATOR'], enabled: true, group: 'userRoleActions' },
  { id: 'm-reviews', routeKey: 'moderatorReviews', labelKey: 'userMenu.items.reviewComments', roles: ['MODERATOR'], enabled: true, group: 'userRoleActions' },

  // UserMenu Group 2: Admin Role Items (<= 5)
  { id: 'a-users', routeKey: 'adminUsers', labelKey: 'userMenu.items.manageUsers', roles: ['ADMIN'], enabled: true, group: 'userRoleActions' },
  { id: 'a-rooms', routeKey: 'adminRooms', labelKey: 'userMenu.items.reviewRooms', roles: ['ADMIN'], enabled: true, group: 'userRoleActions', badgeType: 'modQueue' },
  { id: 'a-kyc', routeKey: 'adminKyc', labelKey: 'userMenu.items.reviewKyc', roles: ['ADMIN'], enabled: true, group: 'userRoleActions' },
  { id: 'a-reports', routeKey: 'adminReports', labelKey: 'userMenu.items.violationReports', roles: ['ADMIN'], enabled: true, group: 'userRoleActions' },
  { id: 'a-settings', routeKey: 'adminSettings', labelKey: 'userMenu.items.systemSettings', roles: ['ADMIN'], enabled: true, group: 'userRoleActions' },

  // UserMenu Group 3: Common account items per active workspace role
  { id: 't-messages', routeKey: 'tenantMessages', labelKey: 'userMenu.items.messages', roles: ['TENANT'], enabled: true, group: 'userAccountActions', badgeType: 'messages' },
  { id: 'l-messages', routeKey: 'landlordMessages', labelKey: 'userMenu.items.messages', roles: ['LANDLORD'], enabled: true, group: 'userAccountActions', badgeType: 'messages' },
  { id: 't-notif', routeKey: 'tenantNotifications', labelKey: 'userMenu.items.notifications', roles: ['TENANT'], enabled: true, group: 'userAccountActions', badgeType: 'notifications' },
  { id: 'l-notif', routeKey: 'landlordNotifications', labelKey: 'userMenu.items.notifications', roles: ['LANDLORD'], enabled: true, group: 'userAccountActions', badgeType: 'notifications' },
  { id: 'm-notif', routeKey: 'moderatorNotifications', labelKey: 'userMenu.items.notifications', roles: ['MODERATOR'], enabled: true, group: 'userAccountActions', badgeType: 'notifications' },
  { id: 'a-notif', routeKey: 'adminNotifications', labelKey: 'userMenu.items.notifications', roles: ['ADMIN'], enabled: true, group: 'userAccountActions', badgeType: 'notifications' },
  { id: 't-security', routeKey: 'tenantSecurity', labelKey: 'userMenu.items.security', roles: ['TENANT'], enabled: true, group: 'userAccountActions' },
  { id: 'l-security', routeKey: 'landlordSecurity', labelKey: 'userMenu.items.security', roles: ['LANDLORD'], enabled: true, group: 'userAccountActions' },
  { id: 'm-security', routeKey: 'moderatorSecurity', labelKey: 'userMenu.items.security', roles: ['MODERATOR'], enabled: true, group: 'userAccountActions' },
  { id: 'a-security', routeKey: 'adminSecurity', labelKey: 'userMenu.items.security', roles: ['ADMIN'], enabled: true, group: 'userAccountActions' },

  // Footer
  { id: 'footer-support', routeKey: 'support', labelKey: 'userMenu.items.help', roles: ALL_ROLES, enabled: true, group: 'userFooter' },
];

export function isNavItemVisible(item: NavItemConfig, role: NavVisibilityRole): boolean {
  if (!item.enabled) return false;
  if (!(item.routeKey in APP_ROUTES)) return false;
  return item.roles.includes(role);
}

export function getNavItemsByGroup(
  group: NavGroup,
  role: NavVisibilityRole,
  items: NavItemConfig[] = NAVIGATION_ITEMS
): Array<NavItemConfig & { href: string }> {
  return items
    .filter((item) => item.group === group && isNavItemVisible(item, role))
    .map((item) => ({ ...item, href: APP_ROUTES[item.routeKey] }));
}
