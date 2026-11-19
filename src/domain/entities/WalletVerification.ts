export interface LandlordWalletSummary {
  availableBalance: number;
  pendingBalance: number;
  withdrawalHoldBalance: number;
  escrowRetainedBalance: number;
  commissionPercent: number;
  depositReleasePercent: number;
  withdrawalHoldDays: number;
  withdrawalMinAmount: number;
}

export interface WalletLedgerPosting {
  accountNumber: string;
  direction: 'DEBIT' | 'CREDIT' | string;
  amount: number;
}

export interface WalletLedgerEntry {
  id: string;
  entryNumber: string;
  description: string;
  referenceType: string;
  referenceId?: string | null;
  totalAmount: number;
  status: string;
  createdBy: string;
  createdAt: string;
  postings: WalletLedgerPosting[];
}

export interface UnmatchedBankInflowItem {
  id: string;
  provider: string;
  providerTxId: string;
  amount: number;
  rawContent?: string | null;
  extractedReference?: string | null;
  mismatchReason: string;
  matchedPaymentCode?: string | null;
  receiverAccountMasked?: string | null;
  status: string;
  resolvedBy?: string | null;
  resolutionNote?: string | null;
  receivedAt: string;
}

export interface ManualConfirmPaymentPayload {
  paymentCode: string;
  bankTxCode: string;
  actualAmount: number;
  reason: string;
  checkerAdminId?: string;
}

export interface ConfirmPayoutPaidPayload {
  bankTxCode: string;
  proofUrl?: string;
  note?: string;
}

export function formatShortRef(id?: string | null, prefix = 'HD'): string {
  if (!id) return '--';
  const clean = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length <= 10) return clean;
  return `${prefix}-${clean.slice(-8)}`;
}
