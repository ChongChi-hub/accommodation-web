export interface PaymentIntent {
  id: string;
  paymentCode: string;
  orderType: string;
  orderId: string;
  amount: number;
  paidAmount: number;
  qrUrl: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | string;
  expiresAt: string;
}

export interface CreatePaymentIntentPayload {
  orderType: 'DEPOSIT' | 'INVOICE' | string;
  orderId: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  contractId: string;
  utilityReadingId?: string | null;
  tenantId: string;
  landlordId: string;
  periodMonth: string;
  baseRent: number;
  electricityAmount: number;
  waterAmount: number;
  serviceAmount: number;
  otherAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED' | string;
  invoiceType?: string;
  referenceInvoiceId?: string | null;
  creditNoteReason?: string | null;
  createdAt: string;
}

export interface GenerateInvoicePayload {
  contractId: string;
  utilityReadingId?: string;
  tenantId: string;
  landlordId: string;
  periodMonth: string;
  baseRent: number;
  electricityAmount: number;
  waterAmount: number;
  serviceAmount: number;
  otherAmount: number;
  dueDate: string;
}

export type PricingModel = 'EVN_TIERED' | 'FIXED' | 'PER_PERSON';

export interface UtilityReading {
  id: string;
  contractId: string;
  roomId: string;
  periodMonth: string;
  electricPrev: number;
  electricCurr: number;
  electricConsumption: number;
  waterPrev: number;
  waterCurr: number;
  waterConsumption: number;
  hasSurgeAnomaly: boolean;
  recordedAt: string;
  status: 'ACTIVE' | 'CANCELLED' | string;
  pricingModel: PricingModel | string;
  electricityCost: number;
  waterCost: number;
  revision: number;
}

export interface RecordUtilityReadingPayload {
  contractId: string;
  roomId: string;
  periodMonth: string;
  electricPrev: number;
  electricCurr: number;
  waterPrev: number;
  waterCurr: number;
  imageUrls?: string[];
  pricingModel?: PricingModel;
  fixedElectricUnitPrice?: number;
  fixedWaterUnitPrice?: number;
  perPersonElectricRate?: number;
  perPersonWaterRate?: number;
  occupantCount?: number;
}

export interface UtilityReadingAudit {
  id: string;
  readingId: string;
  revision: number;
  action: string;
  reason: string;
  actorId: string;
  createdAt: string;
}

export interface PayoutItem {
  id: string;
  payoutCode: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  status: string;
  createdAt: string;
}

export interface RefundItem {
  id: string;
  refundCode: string;
  contractId: string;
  tenantId: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  otpVerified: boolean;
  kycNameMatched: boolean;
  requiresMakerChecker: boolean;
  makerCheckerRequestId?: string | null;
  status: string;
  reason: string;
  createdAt: string;
}

export interface LandlordFinancialStats {
  totalRevenue: number;
  availableBalance: number;
  pendingEscrowBalance: number;
  unpaidInvoicesTotal: number;
  totalInvoicesCount: number;
  paidInvoicesCount: number;
  overdueInvoicesCount: number;
}

export interface TenantFinancialStats {
  totalPaidAmount: number;
  unpaidInvoicesTotal: number;
  activeEscrowBalance: number;
  overdueInvoicesCount: number;
  totalInvoicesCount: number;
}

export interface AdminFinancialStats {
  totalGmv: number;
  platformFeeRevenue: number;
  totalEscrowBalance: number;
  totalGatewayCash: number;
  totalTransactionsCount: number;
}

export interface PropertyOwnershipDoc {
  id: string;
  roomId: number;
  landlordId: number;
  docType: string;
  fileUrl: string;
  maskedNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  rejectReason?: string | null;
  reviewerId?: string | null;
  reviewedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

