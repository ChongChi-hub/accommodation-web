import { describe, it, expect, vi } from 'vitest';
import { AuthRepository } from '@/domain/repositories/AuthRepository';

describe('Password Recovery & Refresh Token Repository Tests', () => {
  it('calls authRepository.forgotPassword with email and returns message', async () => {
    const mockRepo: AuthRepository = {
      login: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      forgotPassword: vi.fn().mockResolvedValue('Mã OTP khôi phục mật khẩu đã được gửi đến email.'),
      resetPassword: vi.fn(),
      logout: vi.fn(),
    };

    const result = await mockRepo.forgotPassword('tenant@toam.vn');
    expect(result).toContain('OTP khôi phục');
    expect(mockRepo.forgotPassword).toHaveBeenCalledWith('tenant@toam.vn');
  });

  it('calls authRepository.resetPassword with token and new password', async () => {
    const mockRepo: AuthRepository = {
      login: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn().mockResolvedValue('Mật khẩu đã được đặt lại thành công.'),
      logout: vi.fn(),
    };

    const result = await mockRepo.resetPassword('valid-otp-123456', 'NewPassword123!');
    expect(result).toContain('thành công');
    expect(mockRepo.resetPassword).toHaveBeenCalledWith('valid-otp-123456', 'NewPassword123!');
  });

  it('calls authRepository.refreshToken with refresh token and returns new session', async () => {
    const mockRepo: AuthRepository = {
      login: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn().mockResolvedValue({
        tokens: { token: 'refreshed-jwt', refreshToken: 'new-refresh-token' },
        user: { id: 'u1', email: 'tenant@toam.vn' } as any,
      }),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
    };

    const session = await mockRepo.refreshToken('old-refresh-token');
    expect(session.tokens.token).toBe('refreshed-jwt');
    expect(session.tokens.refreshToken).toBe('new-refresh-token');
    expect(mockRepo.refreshToken).toHaveBeenCalledWith('old-refresh-token');
  });
});
