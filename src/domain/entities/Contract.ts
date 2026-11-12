export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURES'
  | 'PENDING_TENANT'
  | 'PENDING_LANDLORD'
  | 'ACTIVE'
  | 'TERMINATED'
  | 'EXPIRED'
  | 'CANCELLED'
  | string;

export interface Contract {
  id: string;
  contractCode: string;
  roomId: string;
  tenantId: string;
  landlordId: string;
  requestId?: string | null;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  paymentCycleMonths: number;
  paymentDueDay: number;
  terms?: string | null;
  documentHash?: string | null;
  pdfUrl?: string | null;
  status: ContractStatus;
  holdingExpiresAt?: string | null;
  tenantSignedAt?: string | null;
  landlordSignedAt?: string | null;
  createdAt: string;
}

export interface CreateContractPayload {
  roomId: string;
  tenantId: string;
  landlordId: string;
  requestId?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  terms?: string;
}

export interface ContractOccupant {
  id: string;
  contractId: string;
  fullName: string;
  phoneNumber: string;
  idCardNumber: string;
  relationship?: string | null;
  primaryTenant: boolean;
  createdAt: string;
}

export interface AddOccupantPayload {
  fullName: string;
  phoneNumber: string;
  idCardNumber: string;
  relationship?: string;
  primaryTenant: boolean;
}

export interface ContractAmendment {
  id: string;
  contractId: string;
  amendmentCode: string;
  amendmentType: string;
  newRent?: number | null;
  newEndDate?: string | null;
  effectiveDate: string;
  reason: string;
  status: string;
  tenantSignedAt?: string | null;
  landlordSignedAt?: string | null;
  createdAt: string;
}

export interface CreateAmendmentPayload {
  amendmentType: string;
  newRent?: number | null;
  newEndDate?: string | null;
  effectiveDate: string;
  reason: string;
}

