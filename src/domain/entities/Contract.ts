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
  initialElectricityReading?: number;
  initialWaterReading?: number;
  electricityRate?: number;
  waterRate?: number;
  physicalContractStatus?:
    | 'PENDING_PHYSICAL_SIGN'
    | 'WAITING_TENANT_CONFIRMATION'
    | 'PHYSICAL_SIGNED'
    | 'REJECTED_BY_TENANT'
    | string;
  physicalContractScanUrl?: string | null;
  physicalSignedAt?: string | null;
  tenantConfirmedAt?: string | null;
  tenantRejectReason?: string | null;
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
  initialElectricityReading?: number;
  initialWaterReading?: number;
  electricityRate?: number;
  waterRate?: number;
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

