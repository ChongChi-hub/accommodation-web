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
import { ApiClient } from '../http/api-client';

export class HttpAdminRepository implements AdminRepository {
  async getStats(): Promise<AdminStats> {
    const data = await ApiClient.get<AdminStats>('/admin/stats');
    return (
      data || {
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
      }
    );
  }

  async getPendingRooms(): Promise<PendingRoomItem[]> {
    const data = await ApiClient.get<PendingRoomItem[]>('/admin/rooms');
    return data || [];
  }

  async approveRoom(id: number): Promise<void> {
    await ApiClient.post<void>(`/admin/rooms/${id}/approve`);
  }

  async rejectRoom(id: number, reason: string): Promise<void> {
    await ApiClient.post<void>(`/admin/rooms/${id}/reject`, { reason });
  }

  async getPendingKyc(): Promise<KycReviewItem[]> {
    try {
      const data = await ApiClient.get<KycReviewItem[]>('/admin/kyc');
      return data || [];
    } catch {
      return [];
    }
  }

  async approveKyc(id: number): Promise<void> {
    await ApiClient.post<void>(`/admin/kyc/${id}/approve`);
  }

  async rejectKyc(id: number, reason: string): Promise<void> {
    await ApiClient.post<void>(`/admin/kyc/${id}/reject`, { reason });
  }

  async getUsers(): Promise<UserItem[]> {
    const data = await ApiClient.get<UserItem[]>('/admin/users');
    return data || [];
  }

  async toggleUserLock(id: number | string): Promise<void> {
    await ApiClient.post<void>(`/admin/users/${id}/toggle-lock`);
  }

  async getReports(): Promise<ReportItem[]> {
    const data = await ApiClient.get<any[]>('/admin/reports');
    return (data || []).map((r) => {
      let evidenceUrls: string[] = [];
      if (Array.isArray(r.evidenceUrls)) {
        evidenceUrls = r.evidenceUrls;
      } else if (typeof r.evidenceUrls === 'string' && r.evidenceUrls.trim().length > 0) {
        try {
          const parsed = JSON.parse(r.evidenceUrls);
          if (Array.isArray(parsed)) evidenceUrls = parsed;
          else evidenceUrls = [r.evidenceUrls];
        } catch {
          evidenceUrls = [r.evidenceUrls];
        }
      }
      return {
        ...r,
        evidenceUrls,
      };
    });
  }

  async resolveReport(id: string | number): Promise<void> {
    await ApiClient.post<void>(`/admin/reports/${id}/resolve`, {});
  }

  async dismissReport(id: string | number): Promise<void> {
    await ApiClient.post<void>(`/admin/reports/${id}/dismiss`, {});
  }

  async getReviews(): Promise<AdminReviewItem[]> {
    const data = await ApiClient.get<AdminReviewItem[]>('/admin/reviews');
    return data || [];
  }

  async toggleReviewVisibility(id: number): Promise<void> {
    await ApiClient.post<void>(`/admin/reviews/${id}/toggle`, {});
  }

  async getAuditLogs(filters?: {
    search?: string;
    source?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLogItem[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.source && filters.source !== 'ALL') params.append('source', filters.source);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.limit) params.append('limit', String(filters.limit));
    const qs = params.toString();
    const data = await ApiClient.get<AuditLogItem[]>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
    return data || [];
  }

  async getAnalytics(): Promise<AdminAnalyticsData> {
    const data = await ApiClient.get<AdminAnalyticsData>('/admin/analytics');
    return (
      data || {
        successRate: null,
        avgTimeToFillDays: null,
        totalSearches: null,
        topAreas: [],
        degraded: true,
      }
    );
  }

  async getPlatformStatsOverview(from?: string, to?: string): Promise<AdminPlatformStatsOverview> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const qs = params.toString();
    return ApiClient.get<AdminPlatformStatsOverview>(`/admin/stats/overview${qs ? `?${qs}` : ''}`);
  }

  async getPlatformStatsTimeseries(args: {
    metric: 'users' | 'rooms' | 'appointments' | 'contracts' | 'revenue';
    from?: string;
    to?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<AdminPlatformStatsTimeseries> {
    const params = new URLSearchParams();
    params.append('metric', args.metric);
    if (args.from) params.append('from', args.from);
    if (args.to) params.append('to', args.to);
    if (args.granularity) params.append('granularity', args.granularity);
    return ApiClient.get<AdminPlatformStatsTimeseries>(`/admin/stats/timeseries?${params.toString()}`);
  }

  async getSupportTickets(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<AdminSupportTicketItem[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    const qs = params.toString();
    const data = await ApiClient.get<AdminSupportTicketItem[]>(`/admin/support/tickets${qs ? `?${qs}` : ''}`);
    return data || [];
  }

  async getSupportTicketDetail(id: string): Promise<AdminSupportTicketItem> {
    const data = await ApiClient.get<AdminSupportTicketItem>(`/admin/support/tickets/${id}`);
    return data;
  }

  async replySupportTicket(id: string, message: string): Promise<AdminSupportTicketReply> {
    const data = await ApiClient.post<AdminSupportTicketReply>(`/admin/support/tickets/${id}/reply`, {
      message,
    });
    return data;
  }

  async updateSupportTicketStatus(id: string, status: string): Promise<void> {
    await ApiClient.patch<void>(`/admin/support/tickets/${id}/status`, {
      status,
    });
  }
}

