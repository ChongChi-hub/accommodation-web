'use client';

import { useState, useEffect, useCallback } from 'react';
import { container } from '@/infrastructure/di/container';
import {
  LandlordRoomDetail,
  RoomImage,
  UpdateRoomPayload,
  ImageUploadResult,
} from '@/domain/entities/LandlordRoom';
import { toast } from '@/presentation/stores/toast.store';

export function useLandlordRoomDetail(roomId: number | string) {
  const [room, setRoom] = useState<LandlordRoomDetail | null>(null);
  const [images, setImages] = useState<RoomImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!roomId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.landlord.landlordRoomRepository.getRoom(roomId);
      setRoom(data);
      setImages(data.images || []);
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi tải thông tin phòng');
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateDetails = async (payload: UpdateRoomPayload): Promise<boolean> => {
    setIsSaving(true);
    try {
      await container.landlord.landlordRoomRepository.updateRoom(roomId, payload);
      toast.success('Cập nhật thông tin phòng thành công');
      await fetchDetail();
      return true;
    } catch (err: any) {
      if (err?.status === 409 || err?.message?.includes('409') || err?.errorCode === 'ERR_OPTIMISTIC_LOCK_CONFLICT') {
        toast.error('Dữ liệu phòng đã bị thay đổi bởi phiên làm việc khác. Vui lòng tải lại trang.');
      } else {
        toast.error(err?.message || 'Không thể lưu thay đổi');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImages = async (files: File[]): Promise<ImageUploadResult | null> => {
    setIsUploading(true);
    try {
      const result = await container.landlord.landlordRoomRepository.uploadImages(roomId, files);
      if (result.totalFailed > 0) {
        toast.warning(`Tải lên ${result.totalUploaded} ảnh thành công, ${result.totalFailed} ảnh thất bại`);
      } else {
        toast.success(`Tải lên thành công ${result.totalUploaded} ảnh`);
      }
      await fetchDetail();
      return result;
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi tải lên hình ảnh');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const setCover = async (imageId: number): Promise<boolean> => {
    // Optimistic
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        cover: img.id === imageId,
      }))
    );
    try {
      await container.landlord.landlordRoomRepository.setCoverImage(roomId, imageId);
      toast.success('Đã đặt ảnh bìa chính');
      return true;
    } catch (err: any) {
      await fetchDetail();
      toast.error(err?.message || 'Không thể đặt ảnh bìa');
      return false;
    }
  };

  const deleteImage = async (imageId: number): Promise<boolean> => {
    try {
      await container.landlord.landlordRoomRepository.deleteImage(roomId, imageId);
      toast.success('Đã xóa ảnh thành công');
      await fetchDetail();
      return true;
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa ảnh');
      return false;
    }
  };

  const reorderImages = async (newOrderedImages: RoomImage[]): Promise<boolean> => {
    setImages(newOrderedImages);
    const ids = newOrderedImages.map((img) => img.id);
    try {
      await container.landlord.landlordRoomRepository.reorderImages(roomId, ids);
      return true;
    } catch (err: any) {
      await fetchDetail();
      toast.error(err?.message || 'Không thể sắp xếp lại ảnh');
      return false;
    }
  };

  return {
    room,
    images,
    isLoading,
    isSaving,
    isUploading,
    error,
    updateDetails,
    uploadImages,
    setCover,
    deleteImage,
    reorderImages,
    refresh: fetchDetail,
  };
}
