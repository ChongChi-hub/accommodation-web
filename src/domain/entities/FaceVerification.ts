export type FaceVerificationStatus = 'NONE' | 'PENDING' | 'PASSED' | 'FAILED' | 'EXPIRED';

export type FaceRejectReasonCode =
  | 'KHONG_KHOP_GIAY_TO'
  | 'NGHI_NGO_GIA_MAO'
  | 'ANH_KEM_CHAT_LUONG'
  | 'KHAC';

export interface FaceChallengeAction {
  code: string;
  description: string;
}

export interface FaceChallenge {
  nonce: string;
  expiresAt: string;
  attemptNo: number;
  remainingAttempts: number;
  actions: FaceChallengeAction[];
}

export interface FaceStatus {
  status: FaceVerificationStatus;
  provider: string;
  livenessClientFlag: boolean;
  attemptNo: number;
  remainingAttempts: number;
  canSubmit: boolean;
  consentAt?: string;
  consentVersion?: string;
  rejectReasonCode?: string;
  rejectReasonNote?: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface FaceFrameItem {
  id: string;
  purpose: string;
  size: number;
  checksum: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface FaceAccessLogItem {
  actorId: string;
  actorRole: string;
  purpose: string;
  ipAddress: string;
  createdAt: string;
}

export interface FaceModerationDetail {
  id: string;
  userId: string;
  kycId: string;
  userEmail?: string;
  userFullName?: string;
  fullNameOnId?: string;
  idNumberMasked?: string;
  status: FaceVerificationStatus;
  provider: string;
  livenessClientFlag: boolean;
  challengeActions: string[];
  attemptNo: number;
  consentAt?: string;
  consentVersion?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReasonCode?: string;
  rejectReasonNote?: string;
  version: number;
  frames: FaceFrameItem[];
  accessLogs: FaceAccessLogItem[];
}

