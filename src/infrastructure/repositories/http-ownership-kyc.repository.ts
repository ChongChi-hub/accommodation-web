import { AdminOwnershipDocItem, PropertyOwnershipDoc } from '@/domain/entities/Billing';
import { PendingRoomItem } from '@/domain/repositories/AdminRepository';
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

  async getAdminOwnershipDocs(rooms: PendingRoomItem[]): Promise<AdminOwnershipDocItem[]> {
    const rawDocs = await ApiClient.get<PropertyOwnershipDoc[]>('/admin/rooms/ownership-docs');
    const docs = Array.isArray(rawDocs) ? rawDocs : [];
    const roomMap = new Map<number, PendingRoomItem>();
    for (const room of rooms || []) {
      roomMap.set(Number(room.id), room);
    }

    const results: AdminOwnershipDocItem[] = docs.map((doc) => {
      const room = roomMap.get(Number(doc.roomId));
      return {
        ...doc,
        roomTitle: room?.title || `Phòng #${doc.roomId}`,
        landlordName: room?.landlordName || `Chủ trọ #${doc.landlordId}`,
        roomAddress: room?.address,
        verifiedOwnership: Boolean((room as { verifiedOwnership?: boolean } | undefined)?.verifiedOwnership),
      };
    });

    return results.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getSignedDownloadUrl(objectKey: string): Promise<string> {
    const res = await ApiClient.get<{ signedUrl?: string }>(
      `/landlord/storage/signed-url?objectKey=${encodeURIComponent(objectKey)}`
    );
    if (!res?.signedUrl) {
      throw new Error('Không thể tạo liên kết xem tài liệu bảo mật');
    }
    return res.signedUrl;
  }

  async fetchSignedBlob(signedUrl: string): Promise<{ blob: Blob; contentType: string }> {
    const response = await fetch(signedUrl, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Không thể tải tệp giấy tờ (${response.status})`);
    }
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.blob();
    return { blob, contentType };
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

