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
    const data = await ApiClient.get<ReportItem[]>('/admin/reports');
    return data || [];
  }

  async resolveReport(id: number): Promise<void> {
    await ApiClient.post<void>(`/admin/reports/${id}/resolve`);
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
}

