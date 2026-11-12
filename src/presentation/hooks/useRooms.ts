'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { RoomDto, RoomFilterParams, ProvinceDto, WardDto, RoomPaginationMeta } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';

function parseUrlParams(
  searchParams: { get: (key: string) => string | null },
  presetRoomTypeCode?: string
): RoomFilterParams {
  const q = searchParams.get('q') || undefined;
  const provinceCode = searchParams.get('provinceCode') || searchParams.get('province') || undefined;
  const provinceSlug = searchParams.get('provinceSlug') || undefined;
  const roomTypeCode = searchParams.get('roomTypeCode') || searchParams.get('type') || presetRoomTypeCode || undefined;
  const rawMin = searchParams.get('minPrice') || searchParams.get('priceMin');
  const rawMax = searchParams.get('maxPrice') || searchParams.get('priceMax');
  const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || undefined;

  return {
    q,
    provinceCode,
    provinceSlug,
    districtCode: searchParams.get('districtCode') || undefined,
    wardCode: searchParams.get('wardCode') || undefined,
    roomTypeCode,
    minPrice: rawMin !== null && !Number.isNaN(Number(rawMin)) ? Number(rawMin) : undefined,
    maxPrice: rawMax !== null && !Number.isNaN(Number(rawMax)) ? Number(rawMax) : undefined,
    allowPets: searchParams.get('allowPets') === 'true' ? true : undefined,
    allowCooking: searchParams.get('allowCooking') === 'true' ? true : undefined,
    sortBy,
  };
}

export function useRooms(initialParams: RoomFilterParams = {}, presetRoomTypeCode?: string) {
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const [params, setParams] = useState<RoomFilterParams>(() => ({
    ...parseUrlParams(searchParams, presetRoomTypeCode),
    ...initialParams,
    ...(presetRoomTypeCode ? { roomTypeCode: presetRoomTypeCode } : {}),
  }));
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [pagination, setPagination] = useState<RoomPaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const parsed = parseUrlParams(new URLSearchParams(searchString), presetRoomTypeCode);
    setParams((prev) => ({
      ...parsed,
      ...(presetRoomTypeCode ? { roomTypeCode: presetRoomTypeCode } : {}),
      // Preserve explicit initial sort if url didn't specify
      sortBy: parsed.sortBy ?? prev.sortBy,
    }));
  }, [searchString, presetRoomTypeCode]);

  const fetchRooms = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const repo = container.listing.listingRepository;
      if (repo.searchRoomsPaginated) {
        const res = await repo.searchRoomsPaginated(params, controller.signal);
        if (!controller.signal.aborted) {
          setRooms(res.rooms);
          setPagination(res.pagination);
          setIsLoading(false);
        }
      } else {
        const data = await repo.getRooms(params, controller.signal);
        if (!controller.signal.aborted) {
          setRooms(data);
          setPagination({
            page: (params.page ?? 0) + 1,
            limit: params.size ?? 12,
            total: data.length,
            totalPages: data.length > 0 ? 1 : 0,
            hasNext: false,
            hasPrev: false,
          });
          setIsLoading(false);
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu phòng trọ');
      setIsLoading(false);
    }
  }, [params]);

  const loadLocations = useCallback(async () => {
    try {
      const provs = await container.listing.getLocationsUseCase.getProvinces();
      setProvinces(provs);
    } catch {
      // Ignore location error
    }
  }, []);

  const loadWards = useCallback(async (provCode: string) => {
    try {
      const wds = await container.listing.getLocationsUseCase.getWards(provCode);
      setWards(wds);
    } catch {
      setWards([]);
    }
  }, []);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    if (params.provinceCode) {
      void loadWards(params.provinceCode);
    } else {
      setWards([]);
    }
  }, [params.provinceCode, loadWards]);

  useEffect(() => {
    void fetchRooms();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchRooms]);

  const updateParams = useCallback((newParams: Partial<RoomFilterParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      page: newParams.page !== undefined ? newParams.page : 0,
    }));
  }, []);

  const setPage = useCallback((oneBasedPage: number) => {
    const zeroBased = Math.max(0, oneBasedPage - 1);
    setParams((prev) => ({ ...prev, page: zeroBased }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const resetParams = useCallback(() => {
    setParams(presetRoomTypeCode ? { roomTypeCode: presetRoomTypeCode, page: 0 } : { page: 0 });
  }, [presetRoomTypeCode]);

  return {
    rooms,
    pagination,
    provinces,
    wards,
    params,
    isLoading,
    error,
    updateParams,
    setPage,
    resetParams,
    retry: fetchRooms,
  };
}
