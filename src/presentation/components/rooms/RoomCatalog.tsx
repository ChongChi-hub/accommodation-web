'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, List as ListIcon, X, ArrowUpDown } from 'lucide-react';
import { ROOM_CATEGORY_ALIAS_MAP } from '@/shared/routes';
import { useRooms } from '@/presentation/hooks/useRooms';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomFilterBar } from '@/presentation/components/rooms/RoomFilterBar';
import { RoomCatalogHero } from '@/presentation/components/rooms/RoomCatalogHero';
import { RoomCatalogSeo } from '@/presentation/components/rooms/RoomCatalogSeo';
import { RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { container } from '@/infrastructure/di/container';
import { cn } from '@/lib/cn';

export type CategoryKey = 'phongTro' | 'nhaNguyenCan' | 'canHo' | 'oGhep';

const HERO_IMAGES_MAP: Record<CategoryKey, string> = {
  phongTro: '/images/categories/phong-tro-1920.webp',
  nhaNguyenCan: '/images/categories/nha-nguyen-can-1920.webp',
  canHo: '/images/categories/can-ho-1920.webp',
  oGhep: '/images/categories/o-ghep-1920.webp',
};

const CATEGORY_TITLES_MAP: Record<CategoryKey, { title: string; desc: string }> = {
  phongTro: {
    title: 'Phòng trọ cho thuê',
    desc: 'Phòng trọ khép kín, an ninh, giá cả phù hợp với học sinh, sinh viên và người đi làm.',
  },
  nhaNguyenCan: {
    title: 'Nhà nguyên căn',
    desc: 'Không gian sống riêng tư, rộng rãi, thuận tiện cho hộ gia đình hoặc nhóm bạn ở chung.',
  },
  canHo: {
    title: 'Căn hộ chung cư',
    desc: 'Căn hộ dịch vụ, chung cư mini hiện đại với đầy đủ tiện ích và an ninh 24/7.',
  },
  oGhep: {
    title: 'Ở ghép & Ký túc xá',
    desc: 'Tìm bạn cùng phòng, chia sẻ không gian sống văn minh, tiết kiệm chi phí tối đa.',
  },
};

export function RoomCatalog({ categoryKey = 'phongTro' }: { categoryKey?: CategoryKey }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [facetCount, setFacetCount] = useState<number>(0);

  const meta = ROOM_CATEGORY_ALIAS_MAP[categoryKey];
  const presetCode = meta?.roomTypeCodes.join(',');
  const info = CATEGORY_TITLES_MAP[categoryKey];

  const {
    rooms,
    provinces,
    wards,
    params,
    isLoading,
    error,
    updateParams,
    resetParams,
    retry,
  } = useRooms({}, presetCode);

  useEffect(() => {
    const saved = localStorage.getItem('cozynest_view_mode');
    if (saved === 'grid' || saved === 'list') setViewMode(saved);
  }, []);

  const handleSetViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('cozynest_view_mode', mode);
  };

  useEffect(() => {
    void container.listing.listingRepository.getFacets().then((res) => {
      const match = res.categories?.find((c) => c.code === meta?.aliasSlug);
      if (match) setFacetCount(match.count);
    }).catch(() => {});
  }, [meta?.aliasSlug]);

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = [];
    if (params.q) list.push({ key: 'q', label: `Từ khóa: "${params.q}"`, clear: () => updateParams({ q: undefined }) });
    if (params.provinceCode) {
      const p = provinces.find((x) => x.code === params.provinceCode);
      list.push({ key: 'prov', label: p ? p.name : params.provinceCode, clear: () => updateParams({ provinceCode: undefined, wardCode: undefined }) });
    }
    if (params.wardCode) {
      const w = wards.find((x) => x.code === params.wardCode);
      list.push({ key: 'ward', label: w ? w.name : params.wardCode, clear: () => updateParams({ wardCode: undefined }) });
    }
    if (params.minPrice || params.maxPrice) {
      list.push({ key: 'price', label: 'Khoảng giá đã chọn', clear: () => updateParams({ minPrice: undefined, maxPrice: undefined }) });
    }
    if (params.bedrooms) list.push({ key: 'bed', label: `${params.bedrooms} Phòng ngủ`, clear: () => updateParams({ bedrooms: undefined }) });
    if (params.allowPets) list.push({ key: 'pets', label: 'Nuôi pet', clear: () => updateParams({ allowPets: undefined }) });
    return list;
  }, [params, provinces, wards, updateParams]);

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950/60 pb-16">
      {/* Hero Header */}
      <RoomCatalogHero
        title={info.title}
        description={info.desc}
        heroImage={HERO_IMAGES_MAP[categoryKey]}
        totalRooms={facetCount || rooms.length}
      />

      {/* Overlapping Floating Search & Filter Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        <RoomFilterBar
          params={params}
          onChange={updateParams}
          onReset={resetParams}
          provinces={provinces}
          wards={wards}
          categoryKey={categoryKey}
          hideRoomTypeFilter
        />

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <span className="text-xs text-stone-400">Đang lọc:</span>
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={f.clear}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-medium cursor-pointer"
              >
                <span>{f.label}</span>
                <X className="w-3 h-3 hover:text-teal-950" />
              </button>
            ))}
            <button type="button" onClick={resetParams} className="text-xs text-stone-400 hover:text-stone-600 underline ml-1">
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Sticky Filter Bar / Sorter */}
        <div className="sticky top-16 z-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 py-3 px-4 rounded-xl my-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
            Tìm thấy <span className="text-teal-600 dark:text-teal-400 font-bold tabular-nums">{rooms.length}</span> phòng trọ
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={params.sortBy || 'newest'}
                onChange={(e) => updateParams({ sortBy: e.target.value })}
                className="bg-transparent border-none text-xs font-medium text-stone-700 dark:text-stone-300 outline-none cursor-pointer"
                aria-label="Sắp xếp kết quả"
              >
                <option value="newest">Mới nhất</option>
                <option value="priceAsc">Giá tăng dần</option>
                <option value="priceDesc">Giá giảm dần</option>
                <option value="areaDesc">Diện tích lớn nhất</option>
              </select>
            </div>

            {/* Grid / List Switcher */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={cn('p-1.5 rounded-md transition-colors cursor-pointer', viewMode === 'grid' ? 'bg-white dark:bg-stone-700 text-teal-600 shadow-xs' : 'text-stone-400')}
                aria-label="Xem lưới"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('list')}
                className={cn('p-1.5 rounded-md transition-colors cursor-pointer', viewMode === 'list' ? 'bg-white dark:bg-stone-700 text-teal-600 shadow-xs' : 'text-stone-400')}
                aria-label="Xem danh sách"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Room Results List */}
        {isLoading ? (
          <div className={cn('grid gap-6', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {Array.from({ length: 6 }).map((_, i) => (
              <RoomCardSkeleton key={i} variant={viewMode} />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="Lỗi tải dữ liệu" message={error} onRetry={retry} />
        ) : rooms.length === 0 ? (
          <EmptyState
            title="Không tìm thấy phòng phù hợp"
            description="Hãy thử thay đổi khoảng giá, khu vực hoặc đặt lại các bộ lọc đã chọn."
            actionLabel="Đặt lại bộ lọc"
            onAction={resetParams}
          />
        ) : (
          <div className={cn('grid gap-6', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} variant={viewMode} />
            ))}
          </div>
        )}

        {/* SEO Hand-crafted copy and FAQ */}
        <RoomCatalogSeo categoryKey={categoryKey} categoryPath={meta?.path} />
      </div>
    </div>
  );
}

