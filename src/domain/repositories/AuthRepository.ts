import { User } from '../entities/User';

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
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
  logout(): Promise<void>;
}

