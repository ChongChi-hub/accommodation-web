import { MaintenanceRepository } from '@/domain/repositories/MaintenanceRepository';
import { MaintenanceRequest } from '@/domain/entities/MaintenanceRequest';

/**
 * Empty placeholder repository until Sprint 4 maintenance endpoints are implemented.
 */
export class StaticMaintenanceRepository implements MaintenanceRepository {
  private requests: MaintenanceRequest[] = [];

  async getRequests(filters?: { tenantId?: string; landlordId?: string; roomId?: string; status?: string }): Promise<MaintenanceRequest[]> {
    let result = [...this.requests];
    if (filters?.tenantId) result = result.filter((r) => r.tenantId === filters.tenantId);
    if (filters?.landlordId) result = result.filter((r) => r.landlordId === filters.landlordId);
    if (filters?.roomId) result = result.filter((r) => r.roomId === filters.roomId);
    if (filters?.status) result = result.filter((r) => r.status === filters.status);
    return result;
  }

  async getRequestById(id: string): Promise<MaintenanceRequest | null> {
    return this.requests.find((r) => r.id === id) || null;
  }

  async createRequest(_data: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status'>): Promise<MaintenanceRequest> {
    throw new Error('Tính năng yêu cầu bảo trì sẽ kết nối backend ở Sprint 4');
  }

  async updateStatus(_id: string, _status: MaintenanceRequest['status'], _notes?: string): Promise<void> {
    throw new Error('Tính năng cập nhật bảo trì sẽ kết nối backend ở Sprint 4');
  }
}
