export interface DashboardBadges {
  adminPendingRooms: number;
  adminPendingKyc: number;
  adminPendingReports: number;
  adminPendingDisputes: number;
  adminPendingSupport: number;
  landlordRentalRequests: number;
  landlordUnpaidInvoices: number;
  landlordMaintenanceRequests: number;
  landlordUnreadMessages: number;
  tenantUnpaidInvoices: number;
  tenantUnreadMessages: number;
}

export interface BadgeRepository {
  getBadges(role?: string, userId?: string): Promise<DashboardBadges>;
}

