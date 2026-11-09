import { create } from 'zustand';
import { User, UserRole } from '@/domain/entities/User';
import { container } from '@/infrastructure/di/container';
import { ApiClient } from '@/infrastructure/http/api-client';
import { getEffectiveRole, hasDualRole } from '@/presentation/utils/user-display';
import {
  CLEARED_AUTH_STATE,
  LOADING_RESET,
  enrichFromMe,
  extractApiErrorState,
  readPreferredRoleCookie,
  tryOfflineSessionRestore,
  writePreferredRoleCookie,
} from './auth-store.helpers';

interface AuthState {
  user: User | null;
  activeRole: UserRole | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  errorStatus: number | null;
  retryAfterSeconds: number | null;
  initSession: () => Promise<void>;
  refreshMe: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (
    credential: string,
    nonce: string,
    intendedRole?: string
  ) => Promise<{ success: boolean; role?: string; user?: User; isNewUser?: boolean }>;
  register: (data: { email: string; phone: string; password: string; fullName: string; role: string }) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  verifyEmail: (email: string, otp: string) => Promise<boolean>;
  resendVerifyEmail: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  switchRole: (role: 'TENANT' | 'LANDLORD') => boolean;
  updateUser: (partial: Partial<User>) => void;
}

let inFlightInit: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  ...CLEARED_AUTH_STATE,
  hasHydrated: false,
  isLoading: false,
  error: null,
  errorCode: null,
  errorStatus: null,
  retryAfterSeconds: null,

  initSession: async () => {
    if (typeof window === 'undefined') return;
    if (get().hasHydrated && get().isAuthenticated && ApiClient.getToken()) return;
    if (inFlightInit) return inFlightInit;
    inFlightInit = (async () => {
      try {
        const refreshToken = localStorage.getItem('cozynest_refresh_token');
        if (!refreshToken) {
          localStorage.removeItem('cozynest_user');
          set(CLEARED_AUTH_STATE);
          return;
        }
        const session = await container.auth.authRepository.refreshToken(refreshToken);
        ApiClient.setToken(session.tokens.token);
        const user = await enrichFromMe(session.user);
        set({ user, activeRole: getEffectiveRole(user, readPreferredRoleCookie()), accessToken: session.tokens.token, isAuthenticated: true, hasHydrated: true });
      } catch (err) {
        const restored = tryOfflineSessionRestore(err);
        if (restored) {
          set({ ...restored, isAuthenticated: true, hasHydrated: true });
          return;
        }
        ApiClient.setToken(null);
        localStorage.removeItem('cozynest_refresh_token');
        localStorage.removeItem('cozynest_user');
        set(CLEARED_AUTH_STATE);
      } finally {
        inFlightInit = null;
      }
    })();
    return inFlightInit;
  },

  refreshMe: async () => {
    try {
      if (!container.auth.authRepository.getMe) return get().user;
      const freshUser = await container.auth.authRepository.getMe();
      set({ user: freshUser, activeRole: getEffectiveRole(freshUser, get().activeRole), isAuthenticated: true, hasHydrated: true });
      return freshUser;
    } catch {
      return get().user;
    }
  },

  login: async (email, password) => {
    set(LOADING_RESET);
    try {
      const session = await container.auth.loginUseCase.execute({ email, password });
      ApiClient.setToken(session.tokens.token);
      const user = await enrichFromMe(session.user);
      set({ user, activeRole: getEffectiveRole(user, readPreferredRoleCookie()), accessToken: session.tokens.token, isAuthenticated: true, hasHydrated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, ...extractApiErrorState(err, 'Đăng nhập thất bại') });
      return false;
    }
  },

  loginWithGoogle: async (credential, nonce, intendedRole) => {
    set(LOADING_RESET);
    try {
      const session = await container.auth.googleAuthUseCase.execute(credential, nonce, intendedRole);
      ApiClient.setToken(session.tokens.token);
      const user = await enrichFromMe(session.user);
      const activeRole = getEffectiveRole(user, readPreferredRoleCookie());
      set({ user, activeRole, accessToken: session.tokens.token, isAuthenticated: true, hasHydrated: true, isLoading: false });
      return { success: true, role: activeRole || session.user?.roles?.[0] || 'TENANT', user, isNewUser: session.isNewUser };
    } catch (err) {
      set({ isLoading: false, ...extractApiErrorState(err, 'Đăng nhập Google thất bại') });
      throw err;
    }
  },

  register: async (data) => {
    set(LOADING_RESET);
    try {
      const session = await container.auth.registerUseCase.execute(data);
      ApiClient.setToken(session.tokens.token);
      const user = await enrichFromMe(session.user);
      set({ user, activeRole: getEffectiveRole(user, readPreferredRoleCookie()), accessToken: session.tokens.token, isAuthenticated: true, hasHydrated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, ...extractApiErrorState(err, 'Đăng ký thất bại') });
      return false;
    }
  },

  forgotPassword: async (email) => {
    set(LOADING_RESET);
    try {
      await container.auth.authRepository.forgotPassword(email);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, ...extractApiErrorState(err, 'Không thể gửi mã xác thực') });
      return false;
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    set(LOADING_RESET);
    try {
      await container.auth.authRepository.resetPassword(email, otp, newPassword);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, ...extractApiErrorState(err, 'Đặt lại mật khẩu thất bại') });
      return false;
    }
  },

  verifyEmail: async (email, otp) => {
    set(LOADING_RESET);
    try {
      await container.auth.authRepository.verifyEmail?.(email, otp);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, ...extractApiErrorState(err, 'Xác thực email thất bại') });
      return false;
    }
  },

  resendVerifyEmail: async (email) => {
    set(LOADING_RESET);
    try {
      await container.auth.authRepository.resendVerifyEmail?.(email);
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, ...extractApiErrorState(err, 'Không thể gửi lại mã') });
      return false;
    }
  },

  logout: async () => {
    try {
      await container.auth.authRepository.logout();
    } catch {
      // Ignore network errors
    } finally {
      ApiClient.setToken(null);
      set(CLEARED_AUTH_STATE);
    }
  },

  clearError: () => set({ error: null, errorCode: null, errorStatus: null, retryAfterSeconds: null }),

  switchRole: (newRole: 'TENANT' | 'LANDLORD') => {
    const current = get().user;
    if (!current || !hasDualRole(current)) return false;
    writePreferredRoleCookie(newRole);
    set({ activeRole: newRole });
    return true;
  },

  updateUser: (partial: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cozynest_user', JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
    }
    set({ user: updated });
  },
}));
