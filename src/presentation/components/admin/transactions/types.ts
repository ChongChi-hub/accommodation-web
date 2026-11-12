export interface DailyBreakdown {
  date: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  difference: number;
  entryCount: number;
}

export interface WalletBreakdown {
  accountNumber: string;
  accountName: string;
  accountType: string;
  ownerId: string;
  storedBalance: number;
  calculatedBalance: number;
  isMatched: boolean;
  difference: number;
}

export interface ReconciliationSummary {
  isSystemBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  systemDifference: number;
  totalAccounts: number;
  totalMismatchedAccounts: number;
  dailyBreakdowns: DailyBreakdown[];
  walletBreakdowns: WalletBreakdown[];
  alertSent: boolean;
  message: string;
}

export interface AdjustmentRequest {
  id: string;
  makerId: string;
  checkerId: string | null;
  actionType: string;
  accountNumber: string;
  contraAccountNumber: string;
  direction: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  decidedAt: string | null;
  createdAt: string;
}

export interface AccountItem {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  balance: number;
}

