export type KycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type KycRejectReasonCode =
  | 'BLURRY_IMAGE'
  | 'ID_NUMBER_MISMATCH'
  | 'EXPIRED_DOCUMENT'
  | 'SUSPECTED_FRAUD'
  | 'UNDERAGE'
  | 'OTHER';

export interface LandlordKycStatus {
  id?: string;
  status: KycStatus;
  fullNameOnId?: string;
  dateOfBirth?: string;
  idNumberMasked?: string;
  issueDate?: string;
  issuePlace?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectReasonCode?: KycRejectReasonCode | string;
  rejectReasonNote?: string;
  attemptCount: number;
  remainingAttempts: number;
  hasFrontImage: boolean;
  hasBackImage: boolean;
  frontImageUrl?: string;
  backImageUrl?: string;
  canResubmit: boolean;
}

export interface KycModerationListItem {
  id: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  fullNameOnId: string;
  idNumberMasked: string;
  status: KycStatus;
  faceStatus?: string;
  attemptCount: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface KycModerationDetail {
  id: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  userFullName?: string;
  userRegisteredAt?: string;
  fullNameOnId: string;
  idNumberMasked: string;
  idNumberPlain?: string;
  dateOfBirth: string;
  issueDate: string;
  issuePlace: string;
  status: KycStatus;
  attemptCount: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectReasonCode?: string;
  rejectReasonNote?: string;
  version: number;
  hasFrontImage: boolean;
  hasBackImage: boolean;
  frontImageUrl?: string;
  backImageUrl?: string;
}

