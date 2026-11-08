import { AuthRepository, AuthSession } from '@/domain/repositories/AuthRepository';

export class GoogleAuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async getStatus(): Promise<{ enabled: boolean; clientIdFingerprint: string }> {
    return this.authRepository.getGoogleStatus();
  }

  async getNonce(): Promise<{ nonce: string }> {
    return this.authRepository.getGoogleNonce();
  }

  async execute(credential: string, nonce: string, intendedRole?: string): Promise<AuthSession> {
    return this.authRepository.loginWithGoogle({ credential, nonce, intendedRole });
  }
}

