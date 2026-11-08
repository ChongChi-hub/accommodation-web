import { User } from '../entities/User';
import { UserProfile, UpdateUserProfileDto } from '../entities/UserProfile';

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface AuthSession {
  tokens: AuthTokens;
  user: User;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthSession>;
  register(data: { email: string; phone: string; password: string; fullName: string; role: string }): Promise<AuthSession>;
  refreshToken(refreshToken: string): Promise<AuthSession>;
  getProfile(): Promise<User>;
  updateProfile(data: { fullName: string; phone: string }): Promise<User>;
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(data: UpdateUserProfileDto): Promise<UserProfile>;
  uploadAvatar(file: File): Promise<{ avatarUrl: string }>;
  deleteAvatar(): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
  getGoogleStatus(): Promise<{ enabled: boolean; clientIdFingerprint: string }>;
  getGoogleNonce(): Promise<{ nonce: string }>;
  loginWithGoogle(data: { credential: string; nonce: string; intendedRole?: string }): Promise<AuthSession>;
  logout(): Promise<void>;
}
