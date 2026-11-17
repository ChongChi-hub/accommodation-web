'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiClient } from '@/infrastructure/http/api-client';

export interface DictionaryItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  coverage?: string;
  status: 'ACTIVE' | 'COVERED';
}

export function useAdminDictionaries() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [activeTab, setActiveTab] = useState<'room_types' | 'amenities' | 'locations'>('room_types');
  const [items, setItems] = useState<{
    room_types: DictionaryItem[];
    amenities: DictionaryItem[];
    locations: DictionaryItem[];
  }>({
    room_types: [],
    amenities: [],
    locations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (stateParam === 'loading') {
      setIsLoading(true);
      return;
    }
    if (stateParam === 'error') {
      setIsLoading(false);
      setError('SIMULATED_ERROR');
      return;
    }
    if (stateParam === 'empty') {
      setIsLoading(false);
      setItems({ room_types: [], amenities: [], locations: [] });
      return;
    }

    try {
      const [roomTypes, amenities, provinces] = await Promise.all([
        ApiClient.get<Array<{ id: number; code: string; name: string; description?: string }>>('/room-types').catch(() => []),
        ApiClient.get<Array<{ id: number; code: string; name: string; category?: string }>>('/amenities').catch(() => []),
        ApiClient.get<Array<{ id: number; code: string; name: string; fullName?: string }>>('/locations/provinces').catch(() => []),
      ]);

      const mappedRoomTypes: DictionaryItem[] = (Array.isArray(roomTypes) ? roomTypes : []).map((rt) => ({
        id: String(rt.id),
        code: rt.code,
        name: rt.name,
        description: rt.description || 'Loại phòng chuẩn hệ thống',
        status: 'ACTIVE',
      }));

      const mappedAmenities: DictionaryItem[] = (Array.isArray(amenities) ? amenities : []).map((am) => ({
        id: String(am.id),
        code: am.code,
        name: am.name,
        category: am.category || 'Tiện ích phòng',
        status: 'ACTIVE',
      }));

      const mappedLocations: DictionaryItem[] = (Array.isArray(provinces) ? provinces : []).map((p) => ({
        id: String(p.id),
        code: p.code,
        name: p.fullName || p.name,
        coverage: 'Toàn tỉnh / thành phố',
        status: 'COVERED',
      }));

      setItems({
        room_types: mappedRoomTypes.length > 0 ? mappedRoomTypes : [
          { id: '1', code: 'MINI_APARTMENT', name: 'Chung cư mini', description: 'Phòng khép kín đầy đủ đồ tiện nghi hiện đại', status: 'ACTIVE' },
          { id: '2', code: 'STUDIO', name: 'Căn hộ Studio', description: 'Không gian mở kết hợp phòng ngủ và bếp', status: 'ACTIVE' },
        ],
        amenities: mappedAmenities.length > 0 ? mappedAmenities : [
          { id: '1', code: 'wifi', name: 'Wifi tốc độ cao', category: 'Tiện ích cơ bản', status: 'ACTIVE' },
          { id: '2', code: 'air_conditioner', name: 'Điều hòa 2 chiều', category: 'Điện lạnh', status: 'ACTIVE' },
        ],
        locations: mappedLocations.length > 0 ? mappedLocations : [
          { id: '1', code: '01', name: 'Thành phố Hà Nội', coverage: 'Toàn tỉnh/thành', status: 'COVERED' },
          { id: '2', code: '79', name: 'Thành phố Hồ Chí Minh', coverage: 'Toàn tỉnh/thành', status: 'COVERED' },
        ],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    activeTab,
    setActiveTab,
    items: items[activeTab],
    isLoading,
    error,
    retry: fetchData,
  };
}
