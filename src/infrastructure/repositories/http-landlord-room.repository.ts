import {
  ILandlordRoomRepository,
  Pagination,
} from '@/domain/repositories/LandlordRoomRepository';
import {
  LandlordRoomItem,
  LandlordRoomSummary,
  LandlordRoomDetail,
  ImageUploadResult,
  UpdateRoomPayload,
  CreateRoomPayload,
  LandlordRoomFilterParams,
} from '@/domain/entities/LandlordRoom';
import { ApiClient } from '../http/api-client';

export class HttpLandlordRoomRepository implements ILandlordRoomRepository {
  async getRooms(params: LandlordRoomFilterParams): Promise<{ data: LandlordRoomItem[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.sort) query.append('sort', params.sort);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const qs = query.toString();
    const endpoint = `/landlord/rooms${qs ? `?${qs}` : ''}`;
    const envelope = await ApiClient.getEnvelope<LandlordRoomItem[]>(
      endpoint,
      params.signal ? { signal: params.signal } : undefined
    );

    const paginationRaw = envelope.pagination || {
      page: params.page || 0,
      size: params.size || 10,
      totalElements: envelope.data ? envelope.data.length : 0,
      totalPages: 1,
    };

    const pagination: Pagination = {
      page: paginationRaw.page ?? 0,
      size: paginationRaw.size ?? (paginationRaw.limit ?? 10),
      totalElements: paginationRaw.totalElements ?? (paginationRaw.total ?? (envelope.data ? envelope.data.length : 0)),
      totalPages: paginationRaw.totalPages ?? 1,
    };

    return {
      data: envelope.data || [],
      pagination,
    };
  }

  async getSummary(): Promise<LandlordRoomSummary> {
    return ApiClient.get<LandlordRoomSummary>('/landlord/rooms/summary');
  }

  async getRoom(id: number | string): Promise<LandlordRoomDetail> {
    return ApiClient.get<LandlordRoomDetail>(`/landlord/rooms/${id}`);
  }

  async createRoom(data: CreateRoomPayload): Promise<LandlordRoomItem> {
    return ApiClient.post<LandlordRoomItem>('/landlord/rooms', data);
  }

  async toggleVisibility(id: number | string, visible: boolean): Promise<void> {
    await ApiClient.patch(`/landlord/rooms/${id}/visibility`, { visible });
  }

  async deleteRoom(id: number | string): Promise<void> {
    await ApiClient.delete(`/landlord/rooms/${id}`);
  }

  async updateRoom(id: number | string, data: UpdateRoomPayload): Promise<void> {
    await ApiClient.put(`/landlord/rooms/${id}`, data);
  }

  async uploadImages(roomId: number | string, files: File[]): Promise<ImageUploadResult> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return ApiClient.post<ImageUploadResult>(`/landlord/rooms/${roomId}/images`, formData);
  }

  async setCoverImage(roomId: number | string, imageId: number): Promise<void> {
    await ApiClient.patch(`/landlord/rooms/${roomId}/images/${imageId}/cover`);
  }

  async deleteImage(roomId: number | string, imageId: number): Promise<void> {
    await ApiClient.delete(`/landlord/rooms/${roomId}/images/${imageId}`);
  }

  async reorderImages(roomId: number | string, imageIds: number[]): Promise<void> {
    await ApiClient.put(`/landlord/rooms/${roomId}/images/order`, { imageIds });
  }

  async submitForReview(roomId: number | string): Promise<void> {
    await ApiClient.post(`/landlord/rooms/${roomId}/submit`);
  }
}
