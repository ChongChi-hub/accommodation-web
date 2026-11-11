import { CreateRentalRequestPayload, RentalRequest } from '@/domain/entities/RentalRequest';
import { ApiClient } from '../http/api-client';

export class HttpRentalRequestRepository {
  async createRequest(payload: CreateRentalRequestPayload): Promise<RentalRequest> {
    return ApiClient.post<RentalRequest>('/booking/rental-requests', payload);
  }

  async approveRequest(id: string, contractId?: string): Promise<RentalRequest> {
    const qs = contractId ? `?contractId=${encodeURIComponent(contractId)}` : '';
    return ApiClient.post<RentalRequest>(`/booking/rental-requests/${encodeURIComponent(id)}/approve${qs}`);
  }

  async rejectRequest(id: string): Promise<RentalRequest> {
    return ApiClient.post<RentalRequest>(`/booking/rental-requests/${encodeURIComponent(id)}/reject`);
  }

  async cancelRequest(id: string): Promise<RentalRequest> {
    return ApiClient.post<RentalRequest>(`/booking/rental-requests/${encodeURIComponent(id)}/cancel`);
  }

  async getById(id: string): Promise<RentalRequest> {
    return ApiClient.get<RentalRequest>(`/booking/rental-requests/${encodeURIComponent(id)}`);
  }

  async getTenantRequests(): Promise<RentalRequest[]> {
    const res = await ApiClient.get<RentalRequest[]>('/booking/rental-requests/tenant');
    return Array.isArray(res) ? res : [];
  }

  async getLandlordRequests(): Promise<RentalRequest[]> {
    const res = await ApiClient.get<RentalRequest[]>('/booking/rental-requests/landlord');
    return Array.isArray(res) ? res : [];
  }
}

