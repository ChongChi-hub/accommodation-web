'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { useRooms } from '@/presentation/hooks/useRooms';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomFilterBar } from '@/presentation/components/rooms/RoomFilterBar';
import { RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { LayoutGrid, List as ListIcon, MapPin } from 'lucide-react';
import { HotAreaDto } from '@/application/dto/listing.dto';
import { APP_ROUTES } from '@/shared/routes';
import { cn } from '@/lib/cn';

interface ProvinceCatalogClientProps {
  area: HotAreaDto;
}

const CATEGORY_TABS = [
  { id: '', label: 'Tất cả loại phòng' },
  { id: 'SINGLE', label: 'Phòng trọ' },
  { id: 'FULL_HOUSE', label: 'Nhà nguyên căn' },
  { id: 'can-ho', label: 'Căn hộ' },
  { id: 'SHARED', label: 'Ở ghép' },
];

export function ProvinceCatalogClient({ area }: ProvinceCatalogClientProps) {
  const [activeTab, setActiveTab] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
  } = useRooms({ provinceCode: area.code });

  const handleTabChange = (code: string) => {
    setActiveTab(code);
    updateParams({ roomTypeCode: code || undefined });
  };

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950/60 pb-16">
      {/* Province Hero Banner */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-900">
        <Image
          src={area.imageUrl || '/images/areas/ha-noi-640.webp'}
          alt={area.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

        <div className="relative z-1 mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-between pt-6 pb-12 text-white">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: APP_ROUTES.home },
              { label: 'Khu vực', href: '/khu-vuc' },
              { label: area.name },
            ]}
            className="text-stone-300 [&_a]:text-stone-300 [&_a:hover]:text-white [&_span]:text-white/90"
          />

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              <span>{area.roomCount} tin đăng tại {area.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Phòng trọ tại {area.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-6">
        <RoomFilterBar
          params={params}
          onChange={updateParams}
          onReset={resetParams}
          provinces={provinces}
          wards={wards}
        />

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'shrink-0 text-xs sm:text-sm px-4 py-2 rounded-xl border transition-all cursor-pointer font-medium',
                  isActive
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3 rounded-xl shadow-xs">
          <div className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
            Tìm thấy <span className="text-teal-600 font-bold tabular-nums">{rooms.length}</span> phòng trọ
          </div>

          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn('p-1.5 rounded-md transition-colors cursor-pointer', viewMode === 'grid' ? 'bg-white dark:bg-stone-700 text-teal-600 shadow-xs' : 'text-stone-400')}
              aria-label="Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn('p-1.5 rounded-md transition-colors cursor-pointer', viewMode === 'list' ? 'bg-white dark:bg-stone-700 text-teal-600 shadow-xs' : 'text-stone-400')}
              aria-label="List"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Room List */}
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
            title="Chưa có phòng phù hợp"
            description="Hãy thử bỏ chọn loại phòng hoặc thay đổi tiêu chí lọc để xem thêm kết quả."
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
      </div>
    </div>
  );
}

