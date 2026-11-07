export type TransactionType = 'DEPOSIT_HOLD' | 'RENT_PAYMENT' | 'UTILITY_PAYMENT' | 'REFUND' | 'COMMISSION_FEE';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'VIETQR' | 'BANK_TRANSFER' | 'MOMO' | 'WALLET';

export interface Transaction {
  id: string;
  referenceCode: string;
  userId: string;
  userName: string;
  contractId?: string;
  roomTitle?: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  completedAt?: string;
}
