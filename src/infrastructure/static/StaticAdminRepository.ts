import {
  AdminRepository,
  AdminStats,
  AdminReviewItem,
  PendingRoomItem,
  KycReviewItem,
  UserItem,
  ReportItem,
  AuditLogItem,
} from '@/domain/repositories/AdminRepository';

/**
 * Placeholder repository for Sprint 3-4 admin endpoints not yet exposed by admin-service.
 * Returns zeroed stats / empty collections rather than fabricated demo metrics or users.
 */
export class StaticAdminRepository implements AdminRepository {
  async getStats(): Promise<AdminStats> {
    return {
      totalUsers: 0,
      activeRooms: 0,
      pendingApprovals: 0,
      monthlyRevenue: 0,
      servicesHealth: {
        gateway: true,
        identity: true,
        listing: true,
        booking: true,
        billing: true,
      },
    };
  }

  async getPendingRooms(): Promise<PendingRoomItem[]> {
    return [];
  }

  async approveRoom(_id: number): Promise<void> {}
  async rejectRoom(_id: number, _reason: string): Promise<void> {}

  async getPendingKyc(): Promise<KycReviewItem[]> {
    return [];
  }

  async approveKyc(_id: number): Promise<void> {}
  async rejectKyc(_id: number, _reason: string): Promise<void> {}

  async getUsers(): Promise<UserItem[]> {
    return [];
  }

  async toggleUserLock(_id: number): Promise<void> {}

  async getReports(): Promise<ReportItem[]> {
    return [];
  }

  async resolveReport(_id: number): Promise<void> {}

  async getReviews(): Promise<AdminReviewItem[]> {
    return [];
  }

  async toggleReviewVisibility(_id: number): Promise<void> {}

  async getAuditLogs(): Promise<AuditLogItem[]> {
    return [];
  }
}
