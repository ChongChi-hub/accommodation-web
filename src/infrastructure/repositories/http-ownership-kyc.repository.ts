import { PropertyOwnershipDoc } from '@/domain/entities/Billing';
import { ApiClient } from '../http/api-client';

export class HttpOwnershipKycRepository {
  async uploadPrivateFile(file: File): Promise<{ objectKey: string; checksumSha256?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post<{ objectKey: string; checksumSha256?: string }>(
      '/landlord/storage/private-upload',
      formData
    );
  }

  async uploadOwnershipDoc(
    roomId: number | string,
    payload: { docType: string; fileUrl: string; rawNumber?: string; expiresAt?: string }
  ): Promise<PropertyOwnershipDoc> {
    return ApiClient.post<PropertyOwnershipDoc>(
      `/landlord/rooms/${encodeURIComponent(String(roomId))}/ownership-docs`,
      payload
    );
  }

  async getDocsByRoom(roomId: number | string): Promise<PropertyOwnershipDoc[]> {
    const res = await ApiClient.get<PropertyOwnershipDoc[]>(
      `/landlord/rooms/${encodeURIComponent(String(roomId))}/ownership-docs`
    );
    return Array.isArray(res) ? res : [];
  }

  async reviewDoc(
    docId: string,
    approve: boolean,
    rejectReason?: string
  ): Promise<PropertyOwnershipDoc> {
    return ApiClient.post<PropertyOwnershipDoc>(
      `/admin/rooms/ownership-docs/${encodeURIComponent(docId)}/review`,
      { approve, rejectReason }
    );
  }
}

