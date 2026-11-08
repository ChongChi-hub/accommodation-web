import { describe, it, expect, vi } from 'vitest';
import { RegisterUseCase } from './register.use-case';
import { AuthRepository } from '@/domain/repositories/AuthRepository';

describe('RegisterUseCase', () => {
  it('throws an error if required fields are missing', async () => {
    const mockRepo: AuthRepository = {
      login: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      getUserProfile: vi.fn(),
      updateUserProfile: vi.fn(),
      uploadAvatar: vi.fn(),
      deleteAvatar: vi.fn(),
      getGoogleStatus: vi.fn(),
      getGoogleNonce: vi.fn(),
      loginWithGoogle: vi.fn(),
    };
    const useCase = new RegisterUseCase(mockRepo);

    await expect(
      useCase.execute({
        email: '',
        phone: '0901234567',
        password: 'Password123!',
        fullName: 'Nguyễn Văn A',
        role: 'TENANT',
      })
    ).rejects.toThrow('Vui lòng điền đầy đủ các trường thông tin bắt buộc');
  });

  it('delegates valid registration payload to authRepository.register', async () => {
    const mockRepo: AuthRepository = {
      login: vi.fn(),
      register: vi.fn().mockResolvedValue({
        tokens: { token: 'reg-token-123', refreshToken: 'reg-refresh-456' },
        user: { id: 'u2', email: 'landlord.new@cozynest.vn', fullName: 'Chủ Trọ Mới' } as any,
      }),
      refreshToken: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      getUserProfile: vi.fn(),
      updateUserProfile: vi.fn(),
      uploadAvatar: vi.fn(),
      deleteAvatar: vi.fn(),
      getGoogleStatus: vi.fn(),
      getGoogleNonce: vi.fn(),
      loginWithGoogle: vi.fn(),
    };
    const useCase = new RegisterUseCase(mockRepo);

    const dto = {
      email: 'landlord.new@cozynest.vn',
      phone: '0902345678',
      password: 'SecurePassword123!',
      fullName: 'Chủ Trọ Mới',
      role: 'LANDLORD',
    };

    const session = await useCase.execute(dto);
    expect(session.tokens.token).toBe('reg-token-123');
    expect(mockRepo.register).toHaveBeenCalledWith(dto);
  });
});
