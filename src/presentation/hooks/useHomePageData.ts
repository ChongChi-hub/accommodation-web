'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RoomDto,
  HotAreaDto,
  BannerDto,
  PlatformStatsDto,
} from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';

export interface SectionState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

export function useHomePageData() {
  const [latestRooms, setLatestRooms] = useState<SectionState<RoomDto[]>>({
    data: [],
    isLoading: true,
    error: null,
  });

  const [featuredRooms, setFeaturedRooms] = useState<SectionState<RoomDto[]>>({
    data: [],
    isLoading: true,
    error: null,
  });

  const [hotAreas, setHotAreas] = useState<SectionState<HotAreaDto[]>>({
    data: [],
    isLoading: true,
    error: null,
  });

  const [banners, setBanners] = useState<SectionState<BannerDto[]>>({
    data: [],
    isLoading: true,
    error: null,
  });

  const [stats, setStats] = useState<SectionState<PlatformStatsDto>>({
    data: { activeRooms: 37, verifiedLandlords: 1, totalReviews: 3, happyTenants: 77 },
    isLoading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    // Parallel fetch with independent error isolation
    const listingRepo = container.listing.listingRepository;

    // 1. Latest Rooms
    listingRepo
      .getRooms({ size: 8, sortBy: 'newest' })
      .then((data) => setLatestRooms({ data, isLoading: false, error: null }))
      .catch((err) =>
        setLatestRooms({
          data: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải phòng mới nhất',
        })
      );

    // 2. Featured Rooms
    listingRepo
      .getRooms({ size: 4, sortBy: 'rating' })
      .then((data) => setFeaturedRooms({ data, isLoading: false, error: null }))
      .catch((err) =>
        setFeaturedRooms({
          data: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải phòng nổi bật',
        })
      );

    // 3. Hot Areas
    listingRepo
      .getHotAreas()
      .then((data) => setHotAreas({ data, isLoading: false, error: null }))
      .catch((err) =>
        setHotAreas({
          data: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải khu vực nổi bật',
        })
      );

    // 4. Banners
    listingRepo
      .getBanners()
      .then((data) => setBanners({ data, isLoading: false, error: null }))
      .catch((err) =>
        setBanners({
          data: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải biểu ngữ',
        })
      );

    // 5. Stats
    listingRepo
      .getPlatformStats()
      .then((data) => setStats({ data, isLoading: false, error: null }))
      .catch((err) =>
        setStats({
          data: { activeRooms: 37, verifiedLandlords: 1, totalReviews: 3, happyTenants: 77 },
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải số liệu thống kê',
        })
      );
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    latestRooms,
    featuredRooms,
    hotAreas,
    banners,
    stats,
    retryAll: fetchAll,
  };
}
