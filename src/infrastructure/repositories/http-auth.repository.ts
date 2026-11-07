import { AuthRepository, AuthSession } from '@/domain/repositories/AuthRepository';
import { User } from '@/domain/entities/User';
import { ApiClient } from '../http/api-client';

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<AuthSession> {
    const data = await ApiClient.post<any>('/auth/login', { email, password });
    ApiClient.setToken(data.token);
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
    return ApiClient.get<User>('/auth/profile');
  }

  async logout(): Promise<void> {
    try {
      await ApiClient.post('/auth/logout');
    } finally {
      ApiClient.setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('toam_refresh_token');
        localStorage.removeItem('toam_user');
      }
    }
  }
}

