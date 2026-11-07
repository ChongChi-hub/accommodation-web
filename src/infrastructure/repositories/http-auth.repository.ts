import { AuthRepository, AuthSession } from '@/domain/repositories/AuthRepository';
import { User } from '@/domain/entities/User';
import { ApiClient } from '../http/api-client';

function setAuthCookies(token?: string, role?: string) {
  if (typeof document !== 'undefined') {
    if (token) {
      document.cookie = `toam_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = 'toam_token=; path=/; max-age=0; SameSite=Lax';
    }
    if (role) {
      document.cookie = `toam_role=${encodeURIComponent(role)}; path=/; max-age=2592000; SameSite=Lax`;
    } else {
      document.cookie = 'toam_role=; path=/; max-age=0; SameSite=Lax';
    }
  }
}

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<AuthSession> {
    const data = await ApiClient.post<any>('/auth/login', { email, password });
    ApiClient.setToken(data.token);
    const primaryRole = data.user?.roles?.[0] || 'TENANT';
    setAuthCookies(data.token, primaryRole);

    if (typeof window !== 'undefined') {
      localStorage.setItem('toam_refresh_token', data.refreshToken);
      localStorage.setItem('toam_user', JSON.stringify(data.user));
    }
    return {
      tokens: { token: data.token, refreshToken: data.refreshToken },
      user: data.user,
    };
  }

  async register(data: { email: string; phone: string; password: string; fullName: string; role: string }): Promise<AuthSession> {
    const res = await ApiClient.post<any>('/auth/register', data);
    ApiClient.setToken(res.token);
    const primaryRole = res.user?.roles?.[0] || data.role || 'TENANT';
    setRoleCookie(primaryRole);

    if (typeof window !== 'undefined') {
      localStorage.setItem('toam_refresh_token', res.refreshToken);
      localStorage.setItem('toam_user', JSON.stringify(res.user));
    }
    return {
      tokens: { token: res.token, refreshToken: res.refreshToken },
      user: res.user,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    const data = await ApiClient.post<any>('/auth/refresh-token', { refreshToken });
    ApiClient.setToken(data.token);
    const primaryRole = data.user?.roles?.[0] || 'TENANT';
    setAuthCookies(data.token, primaryRole);

    if (typeof window !== 'undefined') {
      localStorage.setItem('toam_refresh_token', data.refreshToken);
      localStorage.setItem('toam_user', JSON.stringify(data.user));
    }
    return {
      tokens: { token: data.token, refreshToken: data.refreshToken },
      user: data.user,
    };
  }

  async getProfile(): Promise<User> {
    try {
      return await ApiClient.get<User>('/auth/profile');
    } catch {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('toam_user');
        if (stored) return JSON.parse(stored);
      }
      throw new Error('Không thể tải thông tin hồ sơ');
    }
  }

  async updateProfile(data: { fullName: string; phone: string }): Promise<User> {
    try {
      const res = await ApiClient.put<User>('/auth/profile', data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('toam_user', JSON.stringify(res));
      }
      return res;
    } catch {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('toam_user');
        const currentUser = stored ? JSON.parse(stored) : {};
        const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem('toam_user', JSON.stringify(updated));
        return updated;
      }
      throw new Error('Lỗi cập nhật hồ sơ');
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await ApiClient.post('/auth/change-password', { oldPassword, newPassword });
  }

  async forgotPassword(email: string): Promise<void> {
    await ApiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    await ApiClient.post('/auth/reset-password', { email, otp, newPassword });
  }

  async logout(): Promise<void> {
    try {
      await ApiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      ApiClient.setToken(null);
      setAuthCookies();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('toam_refresh_token');
        localStorage.removeItem('toam_user');
      }
    }
  }
}
