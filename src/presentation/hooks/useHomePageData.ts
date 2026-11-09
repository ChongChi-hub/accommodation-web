'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RoomDto,
  HotAreaDto,
  BannerDto,
  PlatformStatsDto,
  RoomFacetsDto,
  CmsArticleDto,
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

  const [stats, setStats] = useState<SectionState<PlatformStatsDto | null>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const [facets, setFacets] = useState<SectionState<RoomFacetsDto | null>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const [articles, setArticles] = useState<SectionState<CmsArticleDto[]>>({
    data: [],
    isLoading: true,
    error: null,
  });

  const listingRepo = container.listing.listingRepository;

  const fetchLatestRooms = useCallback(() => {
    setLatestRooms((prev) => ({ ...prev, isLoading: true, error: null }));
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
  }, [listingRepo]);

  const fetchFeaturedRooms = useCallback(() => {
    setFeaturedRooms((prev) => ({ ...prev, isLoading: true, error: null }));
    listingRepo
      .getRooms({ size: 6, sortBy: 'rating' })
      .then((data) => setFeaturedRooms({ data, isLoading: false, error: null }))
      .catch((err) =>
        setFeaturedRooms({
          data: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải phòng nổi bật',
        })
      );
  }, [listingRepo]);

  const fetchHotAreas = useCallback(() => {
    setHotAreas((prev) => ({ ...prev, isLoading: true, error: null }));
    listingRepo
      .getHotAreas()
      .then((data) => setHotAreas({ data, isLoading: false, error: null }))
      .catch((err) =>
        setHotAreas({
          data: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải khu vực',
        })
      );
  }, [listingRepo]);

  const fetchBanners = useCallback(() => {
    setBanners((prev) => ({ ...prev, isLoading: true, error: null }));
    listingRepo
      .getBanners()
      .then((data) => setBanners({ data, isLoading: false, error: null }))
      .catch((err) =>
        setBanners({
          data: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải thông tin nổi bật',
        })
      );
  }, [listingRepo]);

  const fetchStats = useCallback(() => {
    setStats((prev) => ({ ...prev, isLoading: true, error: null }));
    listingRepo
      .getPlatformStats()
      .then((data) => setStats({ data, isLoading: false, error: null }))
      .catch((err) =>
        setStats({
          data: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải thống kê',
        })
      );
  }, [listingRepo]);

  const fetchFacets = useCallback(() => {
    setFacets((prev) => ({ ...prev, isLoading: true, error: null }));
    listingRepo
      .getFacets()
      .then((data) => setFacets({ data, isLoading: false, error: null }))
      .catch((err) =>
        setFacets({
          data: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải phân loại',
        })
      );
  }, [listingRepo]);

  const fetchArticles = useCallback(() => {
    setArticles((prev) => ({ ...prev, isLoading: true, error: null }));
    listingRepo
      .getArticles()
      .then((data) => setArticles({ data, isLoading: false, error: null }))
      .catch((err) =>
        setArticles({
          data: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi tải cẩm nang',
        })
      );
  }, [listingRepo]);

  const fetchAll = useCallback(() => {
    fetchLatestRooms();
    fetchFeaturedRooms();
    fetchHotAreas();
    fetchBanners();
    fetchStats();
    fetchFacets();
    fetchArticles();
  }, [
    fetchLatestRooms,
    fetchFeaturedRooms,
    fetchHotAreas,
    fetchBanners,
    fetchStats,
    fetchFacets,
    fetchArticles,
  ]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    latestRooms,
    featuredRooms,
    hotAreas,
    banners,
    stats,
    facets,
    articles,
    retryLatestRooms: fetchLatestRooms,
    retryFeaturedRooms: fetchFeaturedRooms,
    retryHotAreas: fetchHotAreas,
    retryBanners: fetchBanners,
    retryStats: fetchStats,
    retryFacets: fetchFacets,
    retryArticles: fetchArticles,
    retryAll: fetchAll,
  };
}
