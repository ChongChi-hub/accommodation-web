import { TransactionRepository } from '@/domain/repositories/TransactionRepository';
import { Transaction } from '@/domain/entities/Transaction';

/**
 * Empty placeholder repository until Sprint 3 billing transaction endpoints are wired.
 */
export class StaticTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = [];

  async getTransactions(filters?: { userId?: string; type?: string; status?: string }): Promise<Transaction[]> {
    let result = [...this.transactions];
    if (filters?.userId) result = result.filter((t) => t.userId === filters.userId);
    if (filters?.type) result = result.filter((t) => t.type === filters.type);
    if (filters?.status) result = result.filter((t) => t.status === filters.status);
    return result;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    return this.transactions.find((t) => t.id === id) || null;
  }

  async createTransaction(_data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    throw new Error('Tính năng giao dịch sẽ kết nối billing-service ở Sprint 3');
  }

  async refundTransaction(_id: string, _reason: string): Promise<void> {
    throw new Error('Tính năng hoàn tiền sẽ kết nối billing-service ở Sprint 3');
  }
}
