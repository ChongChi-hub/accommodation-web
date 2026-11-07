export interface UserProfile {
  userId: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  addressProvinceCode: string | null;
  addressWardCode: string | null;
  addressDetail: string | null;
  roles: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  fullName: string;
  phone: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  addressProvinceCode?: string | null;
  addressWardCode?: string | null;
  addressDetail?: string | null;
  version: number;
}

