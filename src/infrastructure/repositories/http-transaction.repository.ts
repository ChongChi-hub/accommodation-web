import { Transaction } from '@/domain/entities/Transaction';
import { TransactionRepository } from '@/domain/repositories/TransactionRepository';
import { ApiClient } from '../http/api-client';
import { Invoice } from '@/domain/entities/Billing';

export class HttpTransactionRepository implements TransactionRepository {
  async getTransactions(filters?: { userId?: string; type?: string; status?: string }): Promise<Transaction[]> {
    const invoices = await ApiClient.get<Invoice[]>('/billing/invoices/tenant').catch(() => []);
    const mapped: Transaction[] = (Array.isArray(invoices) ? invoices : []).map((inv) => ({
      id: inv.id,
      type: 'RENT_PAYMENT',
      amount: inv.paidAmount || inv.totalAmount,
      status: inv.status === 'PAID' ? 'SUCCESS' : inv.status === 'CANCELLED' ? 'FAILED' : 'PENDING',
      paymentMethod: 'VIETQR',
      description: `${inv.invoiceCode} - ${inv.periodMonth}`,
      referenceCode: inv.invoiceCode,
      userId: inv.tenantId,
      userName: inv.tenantId,
      contractId: inv.contractId,
      createdAt: inv.createdAt,
    }));
    return mapped.filter((t) => {
      if (filters?.status && t.status !== filters.status) return false;
      if (filters?.type && t.type !== filters.type) return false;
      if (filters?.userId && t.userId !== filters.userId) return false;
      return true;
    });
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const inv = await ApiClient.get<Invoice>(`/billing/invoices/${encodeURIComponent(id)}`);
      return {
        id: inv.id,
        type: 'RENT_PAYMENT',
        amount: inv.paidAmount || inv.totalAmount,
        status: inv.status === 'PAID' ? 'SUCCESS' : inv.status === 'CANCELLED' ? 'FAILED' : 'PENDING',
        paymentMethod: 'VIETQR',
        description: `${inv.invoiceCode} - ${inv.periodMonth}`,
        referenceCode: inv.invoiceCode,
        userId: inv.tenantId,
        userName: inv.tenantId,
        contractId: inv.contractId,
        createdAt: inv.createdAt,
      };
    } catch {
      return null;
    }
  }

  async createTransaction(): Promise<Transaction> {
    throw new Error('Su dung /billing/payments/intent de tao giao dich thanh toan');
  }

  async refundTransaction(): Promise<void> {
    throw new Error('Su dung /billing/refunds de tao yeu cau hoan tien co xac thuc OTP');
  }
}
