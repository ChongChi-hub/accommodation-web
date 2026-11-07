export type UserRole = 'TENANT' | 'LANDLORD' | 'MODERATOR' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING';

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
  createdAt: string;
}

