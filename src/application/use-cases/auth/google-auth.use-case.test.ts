import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleAuthUseCase } from './google-auth.use-case';
import { AuthRepository } from '@/domain/repositories/AuthRepository';

describe('GoogleAuthUseCase', () => {
  let mockAuthRepo: AuthRepository;
  let useCase: GoogleAuthUseCase;

  beforeEach(() => {
    mockAuthRepo = {
      login: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      getUserProfile: vi.fn(),
      updateUserProfile: vi.fn(),
      uploadAvatar: vi.fn(),
      deleteAvatar: vi.fn(),
      changePassword: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      getGoogleStatus: vi.fn().mockResolvedValue({ enabled: true, clientIdFingerprint: 'e334eb49' }),
      getGoogleNonce: vi.fn().mockResolvedValue({ nonce: 'test-nonce-123' }),
      loginWithGoogle: vi.fn().mockResolvedValue({
        tokens: { token: 'jwt-access', refreshToken: 'ref-token' },
        user: { id: 'u-1', email: 'g@test.com', fullName: 'Google User', roles: ['TENANT'] },
      }),
    } as unknown as AuthRepository;

    useCase = new GoogleAuthUseCase(mockAuthRepo);
  });

  it('lấy trạng thái Google Auth từ repository', async () => {
    const status = await useCase.getStatus();
    expect(status.enabled).toBe(true);
    expect(status.clientIdFingerprint).toBe('e334eb49');
    expect(mockAuthRepo.getGoogleStatus).toHaveBeenCalled();
  });

  it('lấy nonce ngẫu nhiên bảo mật', async () => {
    const nonce = await useCase.getNonce();
    expect(nonce.nonce).toBe('test-nonce-123');
    expect(mockAuthRepo.getGoogleNonce).toHaveBeenCalled();
  });

  it('thực hiện xác thực Google ID token thành công', async () => {
    const session = await useCase.execute('valid-cred', 'test-nonce-123', 'TENANT');
    expect(session.tokens.token).toBe('jwt-access');
    expect(session.user.email).toBe('g@test.com');
    expect(mockAuthRepo.loginWithGoogle).toHaveBeenCalledWith({
      credential: 'valid-cred',
      nonce: 'test-nonce-123',
      intendedRole: 'TENANT',
    });
  });
});

