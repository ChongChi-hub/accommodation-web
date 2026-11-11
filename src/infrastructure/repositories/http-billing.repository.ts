import {
  AdminFinancialStats,
  CreatePaymentIntentPayload,
  GenerateInvoicePayload,
  Invoice,
  LandlordFinancialStats,
  PaymentIntent,
  PayoutItem,
  RecordUtilityReadingPayload,
  RefundItem,
  TenantFinancialStats,
  UtilityReading,
  UtilityReadingAudit,
} from '@/domain/entities/Billing';
import { ApiClient } from '../http/api-client';

export class HttpBillingRepository {
  async createPaymentIntent(payload: CreatePaymentIntentPayload): Promise<PaymentIntent> {
    return ApiClient.post<PaymentIntent>('/billing/payments/intent', payload);
  }

  async cancelPaymentIntent(paymentCode: string): Promise<PaymentIntent> {
    return ApiClient.post<PaymentIntent>(
      `/billing/payments/intent/${encodeURIComponent(paymentCode)}/cancel`
    );
  }

  async simulateSandboxWebhook(payload: {
    paymentCode: string;
    amount: number;
    status: 'PAID' | 'FAILED';
    timestamp?: number;
  }): Promise<Record<string, unknown>> {
    return ApiClient.post<Record<string, unknown>>('/billing/payments/webhook', {
      ...payload,
      timestamp: payload.timestamp ?? Date.now(),
    });
  }

  async getTenantInvoices(): Promise<Invoice[]> {
    const res = await ApiClient.get<Invoice[]>('/billing/invoices/tenant');
    return Array.isArray(res) ? res : [];
  }

  async getLandlordInvoices(): Promise<Invoice[]> {
    const res = await ApiClient.get<Invoice[]>('/billing/invoices/landlord');
    return Array.isArray(res) ? res : [];
  }

  async getInvoice(id: string): Promise<Invoice> {
    return ApiClient.get<Invoice>(`/billing/invoices/${encodeURIComponent(id)}`);
  }

  async generateInvoice(payload: GenerateInvoicePayload): Promise<Invoice> {
    return ApiClient.post<Invoice>('/billing/invoices', payload);
  }

  async issueCreditNote(id: string, amount: number, reason: string): Promise<Invoice> {
    return ApiClient.post<Invoice>(`/billing/invoices/${encodeURIComponent(id)}/credit-notes`, {
      amount,
      reason,
    });
  }

  async cancelInvoice(id: string): Promise<void> {
    await ApiClient.post(`/billing/invoices/${encodeURIComponent(id)}/cancel`);
  }

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

  async requestPayout(payload: {
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
    otp: string;
  }): Promise<PayoutItem> {
    return ApiClient.post<PayoutItem>('/billing/payouts', payload);
  }

  async getTenantRefunds(): Promise<RefundItem[]> {
    const res = await ApiClient.get<RefundItem[]>('/billing/refunds/tenant');
    return Array.isArray(res) ? res : [];
  }

  async getAdminRefunds(): Promise<RefundItem[]> {
    const res = await ApiClient.get<RefundItem[]>('/billing/refunds/admin');
    return Array.isArray(res) ? res : [];
  }

  async requestRefund(payload: {
    paymentIntentId?: string;
    contractId: string;
    landlordId: string;
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
    otpCode: string;
    reason: string;
  }): Promise<RefundItem> {
    return ApiClient.post<RefundItem>('/billing/refunds', payload);
  }

  async approveRefund(id: string): Promise<RefundItem> {
    return ApiClient.post<RefundItem>(`/billing/refunds/${encodeURIComponent(id)}/approve`);
  }

  async getLandlordDashboardStats(): Promise<LandlordFinancialStats> {
    return ApiClient.get<LandlordFinancialStats>('/billing/dashboard/landlord');
  }

  async getTenantDashboardStats(): Promise<TenantFinancialStats> {
    return ApiClient.get<TenantFinancialStats>('/billing/dashboard/tenant');
  }

  async getAdminDashboardStats(): Promise<AdminFinancialStats> {
    return ApiClient.get<AdminFinancialStats>('/billing/dashboard/admin');
  }

  async exportDashboardCsvBlob(): Promise<Blob> {
    return ApiClient.getBlob('/billing/dashboard/export');
  }
}

