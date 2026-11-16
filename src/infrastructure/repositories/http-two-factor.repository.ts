import { TwoFactorSetupData, TwoFactorStatus } from '@/domain/entities/TwoFactor';
import { TwoFactorRepository } from '@/domain/repositories/TwoFactorRepository';
import { ApiClient } from '../http/api-client';

export class HttpTwoFactorRepository implements TwoFactorRepository {
  async getStatus(): Promise<TwoFactorStatus> {
    return ApiClient.get<TwoFactorStatus>('/auth/2fa/status');
  }

  async setup(): Promise<TwoFactorSetupData> {
    return ApiClient.post<TwoFactorSetupData>('/auth/2fa/setup');
  }

  async verify(code: string): Promise<TwoFactorStatus> {
    return ApiClient.post<TwoFactorStatus>('/auth/2fa/verify', { code });
  }

  async verifyChallenge(code: string): Promise<{ verified: boolean }> {
    return ApiClient.post<{ verified: boolean }>('/auth/2fa/verify-challenge', { code });
  }

  async disable(code: string): Promise<TwoFactorStatus> {
    return ApiClient.post<TwoFactorStatus>('/auth/2fa/disable', { code });
  }
}
