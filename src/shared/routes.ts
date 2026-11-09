export const HEADER_SEARCH_ON_HOME_TOP = false;

export const APP_ROUTES = {
  home: '/',
  rooms: '/rooms',
  phongTro: '/phong-tro',
  nhaNguyenCan: '/nha-nguyen-can',
  canHo: '/can-ho',
  oGhep: '/o-ghep',
  blog: '/safety-guide',
  support: '/support',
  becomeLandlord: '/become-landlord',
  login: '/login',
  register: '/register',
  registerLandlord: '/register?role=landlord',

  tenantHome: '/dashboard/tenant',
  tenantMyRoom: '/dashboard/tenant/my-room',
  tenantSavedRooms: '/dashboard/tenant/saved-rooms',
  tenantAppointments: '/dashboard/tenant/appointments',
  tenantContracts: '/dashboard/tenant/contracts',
  tenantInvoices: '/dashboard/tenant/invoices',
  tenantMessages: '/dashboard/tenant/messages',
  tenantNotifications: '/dashboard/tenant/notifications',
  tenantProfile: '/dashboard/tenant/profile',
  tenantSecurity: '/dashboard/tenant/settings',

  landlordHome: '/dashboard/landlord',
  landlordRooms: '/dashboard/landlord/rooms',
  landlordNewRoom: '/dashboard/landlord/rooms/new',
  landlordAppointments: '/dashboard/landlord/appointments',
  landlordContracts: '/dashboard/landlord/contracts',
  landlordInvoices: '/dashboard/landlord/invoices',
  landlordKyc: '/dashboard/landlord/kyc',
  landlordMessages: '/dashboard/landlord/messages',
  landlordNotifications: '/dashboard/landlord/notifications',
  landlordProfile: '/dashboard/landlord/profile',
  landlordSecurity: '/dashboard/landlord/settings',

  moderatorHome: '/dashboard/moderator',
  moderatorRooms: '/dashboard/admin/rooms',
  moderatorKyc: '/dashboard/admin/kyc',
  moderatorReports: '/dashboard/admin/reports',
  moderatorReviews: '/dashboard/admin/reviews',
  moderatorNotifications: '/dashboard/moderator/notifications',
  moderatorProfile: '/dashboard/moderator/profile',
  moderatorSecurity: '/dashboard/moderator/security',

  adminHome: '/dashboard/admin',
  adminUsers: '/dashboard/admin/users',
  adminRooms: '/dashboard/admin/rooms',
  adminKyc: '/dashboard/admin/kyc',
  adminReports: '/dashboard/admin/reports',
  adminSettings: '/dashboard/admin/settings',
  adminNotifications: '/dashboard/admin/notifications',
  adminProfile: '/dashboard/admin/profile',
  adminSecurity: '/dashboard/admin/security',
} as const;

export type RouteKey = keyof typeof APP_ROUTES;

export interface RoomCategoryMeta {
  routeKey: Extract<RouteKey, 'phongTro' | 'nhaNguyenCan' | 'canHo' | 'oGhep'>;
  path: string;
  aliasSlug: string;
  roomTypeCodes: string[];
  labelKey: string;
  titleKey: string;
  descriptionKey: string;
}

export const ROOM_CATEGORY_ALIAS_MAP: Record<string, RoomCategoryMeta> = {
  phongTro: {
    routeKey: 'phongTro',
    path: APP_ROUTES.phongTro,
    aliasSlug: 'phong-tro',
    roomTypeCodes: ['SINGLE', 'HOMESTAY'],
    labelKey: 'header.nav.phongTro',
    titleKey: 'categoryPages.phongTro.title',
    descriptionKey: 'categoryPages.phongTro.description',
  },
  nhaNguyenCan: {
    routeKey: 'nhaNguyenCan',
    path: APP_ROUTES.nhaNguyenCan,
    aliasSlug: 'nha-nguyen-can',
    roomTypeCodes: ['FULL_HOUSE'],
    labelKey: 'header.nav.nhaNguyenCan',
    titleKey: 'categoryPages.nhaNguyenCan.title',
    descriptionKey: 'categoryPages.nhaNguyenCan.description',
  },
  canHo: {
    routeKey: 'canHo',
    path: APP_ROUTES.canHo,
    aliasSlug: 'can-ho',
    roomTypeCodes: ['MINI_APARTMENT', 'STUDIO', 'APARTMENT'],
    labelKey: 'header.nav.canHo',
    titleKey: 'categoryPages.canHo.title',
    descriptionKey: 'categoryPages.canHo.description',
  },
  oGhep: {
    routeKey: 'oGhep',
    path: APP_ROUTES.oGhep,
    aliasSlug: 'o-ghep',
    roomTypeCodes: ['SHARED'],
    labelKey: 'header.nav.oGhep',
    titleKey: 'categoryPages.oGhep.title',
    descriptionKey: 'categoryPages.oGhep.description',
  },
};

export function resolveRoomTypeRedirectPath(rawType: string | null | undefined): string | null {
  if (!rawType) return null;
  const normalized = rawType.trim().toLowerCase();
  if (normalized === 'phong-tro' || normalized === 'single' || normalized === 'homestay' || normalized === 'room') {
    return APP_ROUTES.phongTro;
  }
  if (normalized === 'nha-nguyen-can' || normalized === 'full_house' || normalized === 'full-house') {
    return APP_ROUTES.nhaNguyenCan;
  }
  if (
    normalized === 'can-ho' ||
    normalized === 'mini_apartment' ||
    normalized === 'studio' ||
    normalized === 'apartment'
  ) {
    return APP_ROUTES.canHo;
  }
  if (normalized === 'o-ghep' || normalized === 'shared' || normalized === 'dormitory') {
    return APP_ROUTES.oGhep;
  }
  return null;
}

export function getRoutePath(routeKey: RouteKey): string {
  return APP_ROUTES[routeKey];
}

