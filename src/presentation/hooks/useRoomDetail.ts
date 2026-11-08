'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoomDto, RoomDetailDto, ReviewDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';

export function useRoomDetail(slugOrId: string | number) {
  const [room, setRoom] = useState<RoomDetailDto | null>(null);
  const [recommendations, setRecommendations] = useState<RoomDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!slugOrId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.listing.getRoomDetailUseCase.execute(slugOrId);
      setRoom(data.room);
      setRecommendations(data.recommendations);
      setReviews(data.reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết phòng');
    } finally {
      setIsLoading(false);
    }
  }, [slugOrId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    room,
    recommendations,
    reviews,
    isLoading,
    error,
    retry: fetchDetail,
  };
}
