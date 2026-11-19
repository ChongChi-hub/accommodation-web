import {
  PayoutItem,
  RecordUtilityReadingPayload,
  UtilityReading,
  UtilityReadingAudit,
} from '@/domain/entities/Billing';
import { ApiClient } from '../http/api-client';

export class HttpUtilityRepository {
  async recordUtilityReading(payload: RecordUtilityReadingPayload): Promise<UtilityReading> {
    return ApiClient.post<UtilityReading>('/billing/utility-readings', payload);
  }

  async editUtilityReading(
    id: string,
    payload: Omit<RecordUtilityReadingPayload, 'contractId' | 'roomId' | 'periodMonth' | 'imageUrls'> & {
      reason: string;
    }
  ): Promise<UtilityReading> {
    return ApiClient.put<UtilityReading>(`/billing/utility-readings/${encodeURIComponent(id)}`, payload);
  }

  async cancelUtilityReading(id: string, reason: string): Promise<UtilityReading> {
    return ApiClient.post<UtilityReading>(
      `/billing/utility-readings/${encodeURIComponent(id)}/cancel`,
      { reason }
    );
  }

  async disputeUtilityReading(id: string, reason: string): Promise<UtilityReading> {
    return ApiClient.post<UtilityReading>(
      `/billing/utility-readings/${encodeURIComponent(id)}/dispute`,
      { reason }
    );
  }

  async getContractReadings(contractId: string): Promise<UtilityReading[]> {
    const res = await ApiClient.get<UtilityReading[]>(
      `/billing/utility-readings/contract/${encodeURIComponent(contractId)}`
    );
    return Array.isArray(res) ? res : [];
  }

  async getReadingAudits(readingId: string): Promise<UtilityReadingAudit[]> {
    const res = await ApiClient.get<UtilityReadingAudit[]>(
      `/billing/utility-readings/${encodeURIComponent(readingId)}/audits`
    );
    return Array.isArray(res) ? res : [];
  }

  async getPayouts(): Promise<PayoutItem[]> {
    const res = await ApiClient.get<PayoutItem[]>('/billing/payouts');
    return Array.isArray(res) ? res : [];
  }

  async getAdminPayouts(): Promise<PayoutItem[]> {
    const res = await ApiClient.get<PayoutItem[]>('/billing/payouts/admin').catch(() => []);
    return Array.isArray(res) ? res : [];
  }

  async approvePayout(id: string): Promise<PayoutItem> {
    return ApiClient.post<PayoutItem>(`/billing/payouts/${encodeURIComponent(id)}/approve`);
  }

  async rejectPayout(id: string, reason?: string): Promise<PayoutItem> {
    return ApiClient.post<PayoutItem>(`/billing/payouts/${encodeURIComponent(id)}/reject`, { reason });
  }

  async requestPayout(payload: {
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
    otp: string;
  }): Promise<PayoutItem> {
    return ApiClient.post<PayoutItem>('/billing/payouts', payload);
  }
}

