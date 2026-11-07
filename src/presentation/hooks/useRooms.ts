'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoomDto, RoomFilterParams, ProvinceDto, DistrictDto, WardDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';

export function useRooms(initialParams: RoomFilterParams = {}) {
  const [params, setParams] = useState<RoomFilterParams>(initialParams);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.listing.getRoomsUseCase.execute(params);
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu phòng trọ');
    } finally {
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
    loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    if (params.provinceCode) {
      loadWards(params.provinceCode);
    } else {
      setWards([]);
    }
  }, [params.provinceCode, loadWards]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const updateParams = (newParams: Partial<RoomFilterParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const resetParams = () => {
    setParams({});
  };

  return {
    rooms,
    provinces,
    districts,
    wards,
    params,
    isLoading,
    error,
    updateParams,
    resetParams,
    retry: fetchRooms,
  };
}

