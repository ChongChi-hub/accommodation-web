export type UserRole = 'TENANT' | 'LANDLORD' | 'MODERATOR' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING';

export type LandlordApplicationStatus =
  | 'NOT_APPLIED'
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | string;

export interface LandlordApplicationSummary {
  status: LandlordApplicationStatus;
  rejectReasonCode?: string | null;
  rejectReasonNote?: string | null;
  canResubmit?: boolean;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  status: UserStatus;
  roles: UserRole[];
  permissions?: string[];
  emailVerified?: boolean;
  hasPassword?: boolean;
  phoneMissing?: boolean;
  landlordApplication?: LandlordApplicationSummary | null;
  workspaceHint?: UserRole;
  createdAt: string;
}
