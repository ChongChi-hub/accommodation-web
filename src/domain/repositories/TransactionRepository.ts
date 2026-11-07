import { Transaction } from '../entities/Transaction';

export interface TransactionRepository {
  getTransactions(filters?: { userId?: string; type?: string; status?: string }): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | null>;
  createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  refundTransaction(id: string, reason: string): Promise<void>;
}
