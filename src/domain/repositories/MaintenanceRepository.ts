import { MaintenanceRequest } from '../entities/MaintenanceRequest';

export interface MaintenanceRepository {
  getRequests(filters?: { tenantId?: string; landlordId?: string; roomId?: string; status?: string }): Promise<MaintenanceRequest[]>;
  getRequestById(id: string): Promise<MaintenanceRequest | null>;
  createRequest(data: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status'>): Promise<MaintenanceRequest>;
  updateStatus(id: string, status: MaintenanceRequest['status'], notes?: string): Promise<void>;
}

