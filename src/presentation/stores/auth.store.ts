import { create } from 'zustand';
import { User } from '@/domain/entities/User';
import { container } from '@/infrastructure/di/container';
import { ApiClient } from '@/infrastructure/http/api-client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; phone: string; password: string; fullName: string; role: string }) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  switchRole: (role: 'TENANT' | 'LANDLORD') => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initSession: async () => {
    if (typeof window === 'undefined') return;
    try {
      const storedUser = localStorage.getItem('toam_user');
      const refreshToken = localStorage.getItem('toam_refresh_token');

      if (storedUser && refreshToken) {
        const user = JSON.parse(storedUser);
        set({ user, isAuthenticated: true });

        // Synchronize in-memory access token via refresh token rotation
        try {
          const session = await container.auth.authRepository.refreshToken(refreshToken);
          ApiClient.setToken(session.tokens.token);
          set({
            user: session.user,
            accessToken: session.tokens.token,
            isAuthenticated: true,
          });
        } catch {
          // If refresh token expired, retain user session for demo/offline fallback or logout
          ApiClient.setToken('demo_token');
        }
      }
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const session = await container.auth.loginUseCase.execute({ email, password });
      ApiClient.setToken(session.tokens.token);
      set({
        user: session.user,
        accessToken: session.tokens.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Đăng nhập thất bại',
      });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const session = await container.auth.registerUseCase.execute(data);
      ApiClient.setToken(session.tokens.token);
      set({
        user: session.user,
        accessToken: session.tokens.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Đăng ký thất bại',
      });
      return false;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await container.auth.authRepository.forgotPassword(email);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Không thể gửi mã xác thực',
      });
      return false;
    }
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      await container.auth.authRepository.resetPassword(email, otp, newPassword);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại',
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await container.auth.authRepository.logout();
    } catch {
      // Ignore
    } finally {
      ApiClient.setToken(null);
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),

  switchRole: (newRole: 'TENANT' | 'LANDLORD') => {
    const current = get().user;
    if (!current) return;
    const updatedRoles = [newRole];
    const updatedUser = { ...current, roles: updatedRoles };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('toam_user', JSON.stringify(updatedUser));
        document.cookie = `toam_role=${newRole}; path=/; max-age=2592000; SameSite=Lax`;
      } catch {}
    }
    set({ user: updatedUser });
  },
}));
