'use client';

import React from 'react';
import { useRooms } from '@/presentation/hooks/useRooms';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Bookmark, Search } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/presentation/components/ui/Button';

export default function TenantSavedRoomsPage() {
  const { rooms, isLoading } = useRooms();
  const savedRooms = rooms.slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Phòng đã lưu
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Danh sách các phòng trọ bạn đã đánh dấu để so sánh và theo dõi.
          </p>
        </div>
        <Link href="/rooms">
          <Button variant="outline" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
            Khám phá thêm
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <RoomCardSkeleton />
          <RoomCardSkeleton />
        </div>
      ) : savedRooms.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" />}
          title="Chưa có phòng trọ nào được lưu"
          description="Khi duyệt danh sách phòng, hãy nhấn nút lưu để lưu lại những căn phòng bạn yêu thích."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
