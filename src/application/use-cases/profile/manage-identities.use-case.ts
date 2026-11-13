import { ApiClient } from '@/infrastructure/http/api-client';
import { UserIdentity } from '@/domain/entities/UserIdentity';

export class ManageIdentitiesUseCase {
  async getIdentities(): Promise<UserIdentity[]> {
    return ApiClient.get<UserIdentity[]>('/me/identities');
  }

  async linkGoogle(credential: string, nonce: string): Promise<UserIdentity> {
    return ApiClient.post<UserIdentity>('/me/identities/google', { credential, nonce });
  }

  async unlinkGoogle(): Promise<void> {
    return ApiClient.delete<void>('/me/identities/google');
  }
}

export const manageIdentitiesUseCase = new ManageIdentitiesUseCase();
