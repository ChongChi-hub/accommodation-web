import { User, UserRole } from '@/domain/entities/User';
import { container } from '@/infrastructure/di/container';
import { ApiError } from '@/infrastructure/http/api-client';
import { getEffectiveRole } from '@/presentation/utils/user-display';

export const LOADING_RESET = {
  isLoading: true,
  error: null,
  errorCode: null,
  errorStatus: null,
  retryAfterSeconds: null,
};

export const CLEARED_AUTH_STATE = {
  user: null,
  activeRole: null,
  accessToken: null,
  isAuthenticated: false,
  hasHydrated: true,
};

export function readPreferredRoleCookie(): UserRole | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)cozynest_role=([^;]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1]) as UserRole;
  return ['TENANT', 'LANDLORD', 'MODERATOR', 'ADMIN'].includes(value) ? value : null;
}

export function writePreferredRoleCookie(role: UserRole): void {
  if (typeof window === 'undefined') return;
  try {
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    document.cookie = `cozynest_role=${role}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
  } catch {
    // Ignore cookie write failure
  }
}

export async function enrichFromMe(fallbackUser: User): Promise<User> {
  try {
    if (container.auth.authRepository.getMe) {
      return await container.auth.authRepository.getMe();
    }
  } catch {
    // Keep session user if /me fails transiently
  }
  return fallbackUser;
}

export function tryOfflineSessionRestore(err: unknown): { user: User; activeRole: UserRole | null } | null {
  const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('cozynest_user') : null;
  if (!(err instanceof ApiError && err.statusCode === 0 && storedUserRaw)) return null;
  try {
    const parsedUser = JSON.parse(storedUserRaw) as User;
    return { user: parsedUser, activeRole: getEffectiveRole(parsedUser, readPreferredRoleCookie()) };
  } catch {
    return null;
  }
}

export function extractApiErrorState(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return {
      error: err.message || fallback,
      errorCode: err.errorCode || 'ERR_UNKNOWN',
      errorStatus: err.statusCode,
      retryAfterSeconds: err.retryAfter ?? null,
    };
  }
  return {
    error: err instanceof Error ? err.message : fallback,
    errorCode: 'ERR_UNKNOWN',
    errorStatus: null,
    retryAfterSeconds: null,
  };
}
