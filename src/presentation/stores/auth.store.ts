import { create } from 'zustand';
import { User } from '@/domain/entities/User';
import { container } from '@/infrastructure/di/container';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initSession: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; phone: string; password: string; fullName: string; role: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initSession: () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('toam_user');
      const token = localStorage.getItem('toam_access_token');
      if (stored && token) {
        set({ user: JSON.parse(stored), isAuthenticated: true });
      }
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const session = await container.auth.loginUseCase.execute({ email, password });
      set({ user: session.user, isAuthenticated: true, isLoading: false });
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
      set({ user: session.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Đăng ký thất bại',
      });
      return false;
    }
  },

  logout: async () => {
    await container.auth.authRepository.logout();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

