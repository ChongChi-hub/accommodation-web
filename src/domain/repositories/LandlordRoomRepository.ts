import {
  LandlordRoomItem,
  LandlordRoomSummary,
  LandlordRoomDetail,
  ImageUploadResult,
  UpdateRoomPayload,
  CreateRoomPayload,
  LandlordRoomFilterParams,
} from '../entities/LandlordRoom';

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ILandlordRoomRepository {
  getRooms(params: LandlordRoomFilterParams): Promise<{ data: LandlordRoomItem[]; pagination: Pagination }>;
  getSummary(): Promise<LandlordRoomSummary>;
  getRoom(id: number | string): Promise<LandlordRoomDetail>;
  createRoom(data: CreateRoomPayload): Promise<LandlordRoomItem>;
  toggleVisibility(id: number | string, visible: boolean): Promise<void>;
  deleteRoom(id: number | string): Promise<void>;
  updateRoom(id: number | string, data: UpdateRoomPayload): Promise<void>;
  uploadImages(roomId: number | string, files: File[]): Promise<ImageUploadResult>;
  setCoverImage(roomId: number | string, imageId: number): Promise<void>;
  deleteImage(roomId: number | string, imageId: number): Promise<void>;
  reorderImages(roomId: number | string, imageIds: number[]): Promise<void>;
}
