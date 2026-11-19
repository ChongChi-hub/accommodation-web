import { ApiClient } from '@/infrastructure/http/api-client';
import { PaymentIntent, PayoutItem } from '@/domain/entities/Billing';
import {
  AdminPendingApprovalItem,
  ConfirmPayoutPaidPayload,
  LandlordWalletSummary,
  ManualConfirmPaymentPayload,
  UnmatchedBankInflowItem,
  WalletLedgerEntry,
} from '@/domain/entities/WalletVerification';

export class HttpWalletVerificationRepository {
  async getLandlordWalletSummary(): Promise<LandlordWalletSummary> {
    return ApiClient.get<LandlordWalletSummary>('/billing/wallet/summary');
  }

  async getLandlordWalletLedger(limit = 100): Promise<WalletLedgerEntry[]> {
    const res = await ApiClient.get<WalletLedgerEntry[]>(`/billing/wallet/ledger?limit=${limit}`);
    return Array.isArray(res) ? res : [];
  }

  async requestPayoutIdempotent(
    payload: {
      amount: number;
      bankCode: string;
      accountNumber: string;
      accountHolder: string;
      otp: string;
    },
    idempotencyKey: string
  ): Promise<PayoutItem> {
    return ApiClient.request<PayoutItem>('/billing/payouts', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload),
    });
  }

  async cancelPayout(id: string): Promise<PayoutItem> {
    return ApiClient.post<PayoutItem>(`/billing/payouts/${encodeURIComponent(id)}/cancel`);
  }

  async confirmPayoutPaid(id: string, payload: ConfirmPayoutPaidPayload): Promise<PayoutItem> {
    return ApiClient.post<PayoutItem>(`/billing/payouts/${encodeURIComponent(id)}/confirm-paid`, payload);
  }

  async getUnmatchedInflows(status?: string): Promise<UnmatchedBankInflowItem[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await ApiClient.get<UnmatchedBankInflowItem[]>(`/billing/payments/unmatched${query}`);
    return Array.isArray(res) ? res : [];
  }

  async getAdminPendingApprovals(): Promise<AdminPendingApprovalItem[]> {
    const res = await ApiClient.get<AdminPendingApprovalItem[]>('/billing/payments/admin/pending-approvals');
    return Array.isArray(res) ? res : [];
  }

  async getManualPaymentQueue(): Promise<PaymentIntent[]> {
    const res = await ApiClient.get<PaymentIntent[]>('/billing/payments/manual-queue');
    return Array.isArray(res) ? res : [];
  }

  async manualConfirmPayment(payload: ManualConfirmPaymentPayload): Promise<{
    paymentCode: string;
    status: string;
    paidAmount: number;
  }> {
    return ApiClient.post('/billing/payments/manual-confirm', payload);
  }

  async manualRejectPayment(payload: { paymentCode: string; reason: string }): Promise<{
    paymentCode: string;
    status: string;
  }> {
    return ApiClient.post('/billing/payments/manual-reject', payload);
  }

  async getProofImageBlob(paymentCode: string): Promise<Blob> {
    return ApiClient.getBlob(`/billing/payments/proofs/${encodeURIComponent(paymentCode)}/image`);
  }
}

export const walletVerificationRepository = new HttpWalletVerificationRepository();

