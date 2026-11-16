import { TwoFactorSetupData, TwoFactorStatus } from '../entities/TwoFactor';

export interface TwoFactorRepository {
  getStatus(): Promise<TwoFactorStatus>;
  setup(): Promise<TwoFactorSetupData>;
  verify(code: string): Promise<TwoFactorStatus>;
  verifyChallenge(code: string): Promise<{ verified: boolean }>;
  disable(code: string): Promise<TwoFactorStatus>;
}
