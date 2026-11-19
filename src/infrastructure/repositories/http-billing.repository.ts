import {
  AdminFinancialStats,
  CreatePaymentIntentPayload,
  EscrowHold,
  GenerateInvoicePayload,
  Invoice,
  LandlordFinancialStats,
  PaymentIntent,
  PayoutItem,
  RecordUtilityReadingPayload,
  RefundItem,
  RiskProfile,
  TenantFinancialStats,
  UtilityReading,
  UtilityReadingAudit,
} from '@/domain/entities/Billing';
import { ApiClient } from '../http/api-client';

export class HttpBillingRepository {
  async createPaymentIntent(payload: CreatePaymentIntentPayload): Promise<PaymentIntent> {
    return ApiClient.post<PaymentIntent>('/billing/payments/intent', payload);
  }

  async getPendingPaymentIntent(orderType: string, orderId: string): Promise<PaymentIntent | null> {
    try {
      const res = await ApiClient.get<PaymentIntent | null>(
        `/billing/payments/pending?orderType=${encodeURIComponent(orderType)}&orderId=${encodeURIComponent(orderId)}`
      );
      return res || null;
    } catch {
      return null;
    }
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
    return ApiClient.post<Record<string, unknown>>('/billing/payments/sandbox/simulate-webhook', {
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

  async getRiskProfiles(): Promise<RiskProfile[]> {
    const res = await ApiClient.get<RiskProfile[]>('/billing/risk/profiles').catch(() => []);
    return Array.isArray(res) ? res : [];
  }

  async freezeUser(userId: string, reason?: string): Promise<RiskProfile> {
    return ApiClient.post<RiskProfile>(`/billing/risk/${encodeURIComponent(userId)}/freeze`, { reason });
  }

  async unfreezeUser(userId: string): Promise<RiskProfile> {
    return ApiClient.post<RiskProfile>(`/billing/risk/${encodeURIComponent(userId)}/unfreeze`);
  }

  async blacklistUser(userId: string, reason?: string): Promise<RiskProfile> {
    return ApiClient.post<RiskProfile>(`/billing/risk/${encodeURIComponent(userId)}/blacklist`, { reason });
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

  async rejectRefund(id: string, reason?: string): Promise<RefundItem> {
    return ApiClient.post<RefundItem>(`/billing/refunds/${encodeURIComponent(id)}/reject`, { reason });
  }

  async retryRefund(id: string): Promise<RefundItem> {
    return ApiClient.post<RefundItem>(`/billing/refunds/${encodeURIComponent(id)}/retry`);
  }

  async getLandlordDashboardStats(): Promise<LandlordFinancialStats> {
    return ApiClient.get<LandlordFinancialStats>('/billing/dashboard/landlord');
  }

  async getLandlordAnalytics(): Promise<import('@/domain/entities/Billing').LandlordAnalyticsResponse> {
    return ApiClient.get<import('@/domain/entities/Billing').LandlordAnalyticsResponse>(
      '/billing/dashboard/landlord/analytics'
    );
  }

  async downloadInvoiceReceiptPdfBlob(invoiceId: string): Promise<Blob> {
    return ApiClient.getBlob(`/billing/invoices/${encodeURIComponent(invoiceId)}/receipt/pdf`);
  }

  async getTenantDashboardStats(): Promise<TenantFinancialStats> {
    return ApiClient.get<TenantFinancialStats>('/billing/dashboard/tenant');
  }

  async getAdminDashboardStats(): Promise<AdminFinancialStats> {
    return ApiClient.get<AdminFinancialStats>('/billing/dashboard/admin');
  }

  async getEscrowHold(contractId: string): Promise<EscrowHold | null> {
    try {
      const res = await ApiClient.get<EscrowHold | null>(`/billing/escrow/${encodeURIComponent(contractId)}`);
      return res || null;
    } catch {
      return null;
    }
  }

  async getTenantEscrows(): Promise<EscrowHold[]> {
    const res = await ApiClient.get<EscrowHold[]>('/billing/escrow/tenant').catch(() => []);
    return Array.isArray(res) ? res : [];
  }

  async getLandlordEscrows(): Promise<EscrowHold[]> {
    const res = await ApiClient.get<EscrowHold[]>('/billing/escrow/landlord').catch(() => []);
    return Array.isArray(res) ? res : [];
  }

  async confirmMoveIn(contractId: string): Promise<EscrowHold> {
    return ApiClient.post<EscrowHold>(`/billing/escrow/${encodeURIComponent(contractId)}/confirm-move-in`);
  }

  async freezeEscrow(contractId: string, reason: string): Promise<EscrowHold> {
    return ApiClient.post<EscrowHold>(`/billing/escrow/${encodeURIComponent(contractId)}/freeze`, { reason });
  }

  async getAdminEscrows(): Promise<EscrowHold[]> {
    const res = await ApiClient.get<EscrowHold[]>('/billing/escrow/admin').catch(() => []);
    return Array.isArray(res) ? res : [];
  }

  async unfreezeEscrow(contractId: string): Promise<EscrowHold> {
    return ApiClient.post<EscrowHold>(`/billing/escrow/${encodeURIComponent(contractId)}/unfreeze`);
  }

  async releaseEscrow(contractId: string): Promise<EscrowHold> {
    return ApiClient.post<EscrowHold>(`/billing/escrow/${encodeURIComponent(contractId)}/release`);
  }

  async refundEscrow(contractId: string, reason: string): Promise<EscrowHold> {
    return ApiClient.post<EscrowHold>(`/billing/escrow/${encodeURIComponent(contractId)}/refund`, { reason });
  }

  async exportDashboardCsvBlob(): Promise<Blob> {
    return ApiClient.getBlob('/billing/dashboard/export');
  }
}

