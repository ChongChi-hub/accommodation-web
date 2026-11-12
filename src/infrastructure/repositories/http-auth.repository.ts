import { AuthRepository, AuthSession } from '@/domain/repositories/AuthRepository';
import { LandlordApplicationSummary, User } from '@/domain/entities/User';
import { UserProfile, UpdateUserProfileDto } from '@/domain/entities/UserProfile';
import { ApiClient, ApiError } from '../http/api-client';

function resolveCookieRole(user: User | undefined | null): string {
  const roles = user?.roles || [];
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('MODERATOR')) return 'MODERATOR';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)cozynest_role=([^;]+)/);
    const preferred = match ? decodeURIComponent(match[1]) : '';
    if (preferred && roles.includes(preferred as any)) {
      return preferred;
    }
  }
  if (roles.includes('LANDLORD')) return 'LANDLORD';
  return roles[0] || 'TENANT';
}

function setUiRoleCookie(role?: string) {
  if (typeof document !== 'undefined') {
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? '; Secure' : '';
    if (role) {
      document.cookie = `cozynest_role=${encodeURIComponent(role)}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
    } else {
      document.cookie = `cozynest_role=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
    }
  }
}

async function postAuthBff<T = any>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  });
  const json = await response.json().catch(() => ({ message: 'Loi phan hoi tu may chu', data: null }));
  if (!response.ok) {
    const retryHeader = response.headers.get('Retry-After');
    const parsedRetry = retryHeader ? parseInt(retryHeader, 10) : NaN;
    throw new ApiError(
      json.message || 'Loi xac thuc',
      json.errorCode || 'ERR_HTTP_' + response.status,
      response.status,
      json.errors,
      Number.isFinite(parsedRetry) && parsedRetry > 0 ? parsedRetry : undefined
    );
  }
  return json.data as T;
}

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<AuthSession> {
    const data = await postAuthBff<any>('/api/auth/login', { email, password });
    ApiClient.setToken(null);
    const primaryRole = resolveCookieRole(data.user);
    setUiRoleCookie(primaryRole);

    if (typeof window !== 'undefined' && data.user) {
      localStorage.setItem('cozynest_user', JSON.stringify(data.user));
    }
    return {
      tokens: { token: '', refreshToken: '' },
      user: data.user,
    };
  }

  async register(data: { email: string; phone: string; password: string; fullName: string; role: string }): Promise<AuthSession> {
    const res = await postAuthBff<any>('/api/auth/register', data);
    ApiClient.setToken(null);
    const primaryRole = resolveCookieRole(res.user);
    setUiRoleCookie(primaryRole);

    if (typeof window !== 'undefined' && res.user) {
      localStorage.setItem('cozynest_user', JSON.stringify(res.user));
    }
    return {
      tokens: { token: '', refreshToken: '' },
      user: res.user,
    };
  }

  async getGoogleStatus(): Promise<{ enabled: boolean; clientIdFingerprint: string }> {
    return ApiClient.get<{ enabled: boolean; clientIdFingerprint: string }>('/auth/google/status');
  }

  async getGoogleNonce(): Promise<{ nonce: string }> {
    return ApiClient.get<{ nonce: string }>('/auth/google/nonce');
  }

  async loginWithGoogle(data: { credential: string; nonce: string; intendedRole?: string }): Promise<AuthSession> {
    const res = await postAuthBff<any>('/api/auth/google', data);
    ApiClient.setToken(null);
    const primaryRole = resolveCookieRole(res.user);
    setUiRoleCookie(primaryRole);

    if (typeof window !== 'undefined' && res.user) {
      localStorage.setItem('cozynest_user', JSON.stringify(res.user));
    }
    return {
      tokens: { token: '', refreshToken: '' },
      user: res.user,
      isNewUser: Boolean(res.isNewUser ?? res.newUser ?? false),
    };
  }

  async refreshToken(_refreshToken?: string): Promise<AuthSession> {
    const data = await postAuthBff<any>('/api/auth/refresh', {});
    ApiClient.setToken(null);
    const primaryRole = resolveCookieRole(data.user);
    setUiRoleCookie(primaryRole);

    if (typeof window !== 'undefined' && data.user) {
      localStorage.setItem('cozynest_user', JSON.stringify(data.user));
    }
    return {
      tokens: { token: '', refreshToken: '' },
      user: data.user,
    };
  }

  async getMe(): Promise<User> {
    const me = await ApiClient.get<User>('/me');
    if (typeof window !== 'undefined' && me) {
      localStorage.setItem('cozynest_user', JSON.stringify(me));
    }
    return me;
  }

  async applyLandlord(): Promise<LandlordApplicationSummary> {
    return ApiClient.post<LandlordApplicationSummary>('/me/landlord-application');
  }

  async getProfile(): Promise<User> {
    try {
      return await ApiClient.get<User>('/auth/profile');
    } catch {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cozynest_user');
        if (stored) return JSON.parse(stored);
      }
      throw new Error('Không thể tải thông tin hồ sơ');
    }
  }

  async updateProfile(data: { fullName: string; phone: string }): Promise<User> {
    try {
      const res = await ApiClient.put<User>('/auth/profile', data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cozynest_user', JSON.stringify(res));
      }
      return res;
    } catch {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cozynest_user');
        const currentUser = stored ? JSON.parse(stored) : {};
        const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem('cozynest_user', JSON.stringify(updated));
        return updated;
      }
      throw new Error('Lỗi cập nhật hồ sơ');
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    return await ApiClient.get<UserProfile>('/users/me');
  }

  async updateUserProfile(data: UpdateUserProfileDto): Promise<UserProfile> {
    const res = await ApiClient.put<UserProfile>('/users/me', data);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cozynest_user');
      const currentUser = stored ? JSON.parse(stored) : {};
      const updated = {
        ...currentUser,
        fullName: res.fullName,
        phone: res.phone,
        avatarUrl: res.avatarUrl,
        gender: res.gender,
        dateOfBirth: res.dateOfBirth,
      };
      localStorage.setItem('cozynest_user', JSON.stringify(updated));
    }
    return res;
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await ApiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cozynest_user');
      if (stored) {
        const u = JSON.parse(stored);
        u.avatarUrl = res.avatarUrl;
        localStorage.setItem('cozynest_user', JSON.stringify(u));
      }
    }
    return res;
  }

  async deleteAvatar(): Promise<void> {
    await ApiClient.delete('/users/me/avatar');
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cozynest_user');
      if (stored) {
        const u = JSON.parse(stored);
        u.avatarUrl = null;
        localStorage.setItem('cozynest_user', JSON.stringify(u));
      }
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await ApiClient.post('/auth/change-password', {
      currentPassword,
      oldPassword: currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await ApiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    await ApiClient.post('/auth/reset-password', { email, otp, newPassword });
  }

  async verifyEmail(email: string, otp: string): Promise<void> {
    await ApiClient.post('/auth/verify-email', { email, otp });
  }

  async resendVerifyEmail(email: string): Promise<void> {
    await ApiClient.post('/auth/verify-email/resend', { email });
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
      await ApiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      ApiClient.setToken(null);
      setUiRoleCookie();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cozynest_user');
      }
    }
  }
}
