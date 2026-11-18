import {
  AdminRepository,
  AdminStats,
  AdminReviewItem,
  PendingRoomItem,
  KycReviewItem,
  UserItem,
  ReportItem,
  AuditLogItem,
  AdminAnalyticsData,
  AdminPlatformStatsOverview,
  AdminPlatformStatsTimeseries,
  AdminSupportTicketItem,
  AdminSupportTicketReply,
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

  async resolveReport(_id: string | number): Promise<void> {}
  async dismissReport(_id: string | number): Promise<void> {}

  async getReviews(): Promise<AdminReviewItem[]> {
    return [];
  }

  async toggleReviewVisibility(_id: number): Promise<void> {}

  async getAuditLogs(): Promise<AuditLogItem[]> {
    return [];
  }

  async getAnalytics(): Promise<AdminAnalyticsData> {
    return {
      successRate: 0,
      avgTimeToFillDays: 0,
      totalSearches: 0,
      topAreas: [],
    };
  }

  async getSupportTickets(): Promise<AdminSupportTicketItem[]> {
    return [];
  }

  async getSupportTicketDetail(id: string): Promise<AdminSupportTicketItem> {
    return {
      id,
      ticketCode: id,
      userId: '',
      userName: '',
      userEmail: '',
      subject: '',
      category: '',
      priority: 'MEDIUM',
      status: 'OPEN',
      description: '',
      createdAt: '',
      updatedAt: '',
    };
  }

  async replySupportTicket(id: string, message: string): Promise<AdminSupportTicketReply> {
    return {
      id: 'mock',
      ticketId: id,
      senderId: 'admin',
      senderName: 'Admin',
      senderRole: 'ADMIN',
      message,
      createdAt: new Date().toISOString(),
    };
  }

  async updateSupportTicketStatus(_id: string, _status: string): Promise<void> {}

  async getPlatformStatsOverview(from?: string, to?: string): Promise<AdminPlatformStatsOverview> {
    const today = new Date().toISOString().slice(0, 10);
    return {
      from: from || today,
      to: to || today,
      generatedAt: new Date().toISOString(),
      degraded: false,
      failedSources: [],
      sourceStatus: { identity: 'OK', listing: 'OK', booking: 'OK', billing: 'OK' },
      identity: null,
      listing: { topAreas: [] },
      booking: null,
      billing: null,
      kpis: {
        totalUsers: 0, newUsersInRange: 0, pendingKyc: 0, totalRooms: 0, activeRooms: 0,
        pendingRooms: 0, rejectedRooms: 0, totalViews: 0, totalAppointments: 0,
        completedAppointments: 0, totalRentalRequests: 0, totalContracts: 0, activeContracts: 0,
        totalInvoices: 0, paidInvoices: 0, paidRevenue: 0, fintechMode: 'SANDBOX_ONLY',
        successRate: 0, avgTimeToFillDays: 0,
      },
    };
  }

  async getPlatformStatsTimeseries(params: {
    metric: 'users' | 'rooms' | 'appointments' | 'contracts' | 'revenue';
    from?: string;
    to?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<AdminPlatformStatsTimeseries> {
    const today = new Date().toISOString().slice(0, 10);
    return {
      metric: params.metric,
      granularity: params.granularity || 'day',
      from: params.from || today,
      to: params.to || today,
      degraded: false,
      source: 'booking',
      points: [],
    };
  }
}
