import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from './login.use-case';
import { AuthRepository } from '@/domain/repositories/AuthRepository';

describe('LoginUseCase', () => {
  it('throws an error if email or password is empty', async () => {
    const mockRepo: AuthRepository = {
      login: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      getProfile: vi.fn(),
      logout: vi.fn(),
    };
    const useCase = new LoginUseCase(mockRepo);

    await expect(useCase.execute({ email: '', password: '' })).rejects.toThrow(
      'Vui lòng nhập đầy đủ email và mật khẩu'
    );
  });

  it('calls authRepository.login with email and password', async () => {
    const mockRepo: AuthRepository = {
      login: vi.fn().mockResolvedValue({
        tokens: { token: 'mock-jwt', refreshToken: 'mock-refresh' },
        user: { id: 'u1', email: 'tenant@toam.vn', fullName: 'Demo Tenant' } as any,
      }),
      register: vi.fn(),
      refreshToken: vi.fn(),
      getProfile: vi.fn(),
      logout: vi.fn(),
    };
    const useCase = new LoginUseCase(mockRepo);

    const result = await useCase.execute({ email: 'tenant@toam.vn', password: 'password123' });
    expect(result.tokens.token).toBe('mock-jwt');
    expect(mockRepo.login).toHaveBeenCalledWith('tenant@toam.vn', 'password123');
  });
});
