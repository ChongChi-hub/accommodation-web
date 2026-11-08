import {
  KycRepository,
  KycModerationListParams,
  KycModerationPageResult,
} from '@/domain/repositories/KycRepository';
import {
  LandlordKycStatus,
  KycModerationListItem,
  KycModerationDetail,
} from '@/domain/entities/LandlordKyc';
import { ApiClient } from '../http/api-client';

export class HttpKycRepository implements KycRepository {
  async getLandlordKyc(): Promise<LandlordKycStatus> {
    return await ApiClient.get<LandlordKycStatus>('/landlord/kyc');
  }

  async submitLandlordKyc(formData: FormData): Promise<LandlordKycStatus> {
    return await ApiClient.post<LandlordKycStatus>('/landlord/kyc', formData);
  }

  async getKycImage(side: 'front' | 'back'): Promise<Blob> {
    return await ApiClient.getBlob(`/landlord/kyc/images/${side}`);
  }

  async getModerationKycList(params?: KycModerationListParams): Promise<KycModerationPageResult> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') {
      searchParams.set('status', params.status);
    }
    if (params?.page !== undefined) searchParams.set('page', String(params.page));
    if (params?.size !== undefined) searchParams.set('size', String(params.size));

    const qs = searchParams.toString();
    const endpoint = `/moderation/kyc${qs ? `?${qs}` : ''}`;
    const envelope = await ApiClient.getEnvelope<KycModerationListItem[]>(endpoint);

    const items = Array.isArray(envelope.data) ? envelope.data : [];
    const total = envelope.pagination?.totalElements ?? envelope.pagination?.total ?? items.length;
    const page = envelope.pagination?.page ?? 0;
    const totalPages = envelope.pagination?.totalPages ?? 1;

    return { items, total, page, totalPages };
  }

  async getModerationKycDetail(id: string): Promise<KycModerationDetail> {
    return await ApiClient.get<KycModerationDetail>(`/moderation/kyc/${id}`);
  }

  async getModerationKycImage(id: string, side: 'front' | 'back'): Promise<Blob> {
    return await ApiClient.getBlob(`/moderation/kyc/${id}/images/${side}`);
  }

  async approveKyc(id: string, version: number): Promise<void> {
    await ApiClient.post(`/moderation/kyc/${id}/approve?version=${version}`);
  }

  async rejectKyc(id: string, reasonCode: string, reasonNote: string, version: number): Promise<void> {
    await ApiClient.post(`/moderation/kyc/${id}/reject?version=${version}`, {
      reasonCode,
      reasonNote,
    });
  }
}

