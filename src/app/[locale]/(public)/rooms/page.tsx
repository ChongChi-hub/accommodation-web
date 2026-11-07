'use client';

import React, { useState } from 'react';
import { LayoutGrid, List as ListIcon, Home } from 'lucide-react';
import { useRooms } from '@/presentation/hooks/useRooms';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomFilterBar } from '@/presentation/components/rooms/RoomFilterBar';
import { RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { cn } from '@/lib/cn';

export default function RoomsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const {
    rooms,
    provinces,
    districts,
    params,
    isLoading,
    error,
    updateParams,
    resetParams,
    retry,
  } = useRooms();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Tìm phòng trọ' }]} />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Tìm kiếm phòng trọ & căn hộ
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Hơn {rooms.length > 0 ? rooms.length : 'hàng trăm'} phòng trọ đã qua kiểm duyệt thực tế, giá cả minh bạch.
        </p>
      </div>

      <RoomFilterBar
        params={params}
        onChange={updateParams}
        onReset={resetParams}
        provinces={provinces}
        districts={districts}
      />

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
          Tìm thấy <span className="font-bold text-teal-700 dark:text-teal-400">{rooms.length}</span> phòng phù hợp
        </p>
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-white dark:bg-stone-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-stone-400 hover:text-stone-600'
            )}
            aria-label="Dạng lưới"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-white dark:bg-stone-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-stone-400 hover:text-stone-600'
            )}
            aria-label="Dạng danh sách"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Không thể tải danh sách phòng"
          message={error}
          onRetry={retry}
        />
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Không tìm thấy phòng nào phù hợp"
          description="Hãy thử bỏ bớt bộ lọc hoặc chọn một khu vực khác để xem thêm nhiều lựa chọn hơn."
          actionLabel="Đặt lại bộ lọc"
          onAction={resetParams}
        />
      ) : (
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
