import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageIdentitiesUseCase } from './manage-identities.use-case';
import { ApiClient } from '@/infrastructure/http/api-client';

describe('ManageIdentitiesUseCase', () => {
  let useCase: ManageIdentitiesUseCase;

  beforeEach(() => {
    useCase = new ManageIdentitiesUseCase();
    vi.restoreAllMocks();
  });

  it('lấy danh sách identities người dùng thành công', async () => {
    const mockIdentities = [
      {
        id: 'id-1',
        provider: 'GOOGLE',
        providerSubject: 'sub-123',
        emailAtLink: 'user@gmail.com',
        emailVerified: true,
        displayName: 'Test User',
        pictureUrl: null,
        locale: 'vi',
        linkedAt: '2026-11-12T10:00:00Z',
        lastLoginAt: '2026-11-12T10:00:00Z',
      },
    ];
    vi.spyOn(ApiClient, 'get').mockResolvedValue(mockIdentities);

    const result = await useCase.getIdentities();
    expect(result).toHaveLength(1);
    expect(result[0].provider).toBe('GOOGLE');
    expect(ApiClient.get).toHaveBeenCalledWith('/me/identities');
  });

  it('liên kết tài khoản Google thành công', async () => {
    const mockLinked = {
      id: 'id-2',
      provider: 'GOOGLE',
      providerSubject: 'sub-456',
      emailAtLink: 'linked@gmail.com',
      emailVerified: true,
      displayName: 'Linked User',
      pictureUrl: null,
      locale: 'vi',
      linkedAt: '2026-11-12T10:00:00Z',
      lastLoginAt: null,
    };
    vi.spyOn(ApiClient, 'post').mockResolvedValue(mockLinked);

    const result = await useCase.linkGoogle('cred-xyz', 'nonce-abc');
    expect(result.emailAtLink).toBe('linked@gmail.com');
    expect(ApiClient.post).toHaveBeenCalledWith('/me/identities/google', {
      credential: 'cred-xyz',
      nonce: 'nonce-abc',
    });
  });

  it('hủy liên kết tài khoản Google thành công', async () => {
    vi.spyOn(ApiClient, 'delete').mockResolvedValue(undefined);

    await useCase.unlinkGoogle();
    expect(ApiClient.delete).toHaveBeenCalledWith('/me/identities/google');
  });
});
