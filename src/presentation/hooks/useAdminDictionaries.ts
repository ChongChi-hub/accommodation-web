'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

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
      setItems({
        room_types: [
          {
            id: '1',
            code: 'MINI_APARTMENT',
            name: 'Chung cư mini',
            description: 'Phòng khép kín đầy đủ đồ tiện nghi hiện đại',
            status: 'ACTIVE',
          },
          {
            id: '2',
            code: 'STUDIO',
            name: 'Căn hộ Studio',
            description: 'Không gian mở kết hợp phòng ngủ và bếp',
            status: 'ACTIVE',
          },
          {
            id: '3',
            code: 'APARTMENT',
            name: 'Căn hộ nguyên căn',
            description: 'Căn hộ gia đình 2-3 phòng ngủ',
            status: 'ACTIVE',
          },
        ],
        amenities: [
          {
            id: '1',
            code: 'wifi',
            name: 'Wifi tốc độ cao',
            category: 'Tiện ích cơ bản',
            status: 'ACTIVE',
          },
          {
            id: '2',
            code: 'air_conditioner',
            name: 'Điều hòa 2 chiều',
            category: 'Điện lạnh',
            status: 'ACTIVE',
          },
          {
            id: '3',
            code: 'water_heater',
            name: 'Bình nóng lạnh',
            category: 'Thiết bị gia dụng',
            status: 'ACTIVE',
          },
        ],
        locations: [
          {
            id: '1',
            code: 'HN',
            name: 'Thành phố Hà Nội',
            coverage: '5 quận trọng điểm',
            status: 'COVERED',
          },
          {
            id: '2',
            code: 'HCM',
            name: 'Thành phố Hồ Chí Minh',
            coverage: '3 quận trọng điểm',
            status: 'COVERED',
          },
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

