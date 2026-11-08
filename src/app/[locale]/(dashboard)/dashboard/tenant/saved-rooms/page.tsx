'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useBookmarks } from '@/presentation/hooks/useBookmarks';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Bookmark, Search } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/presentation/components/ui/Button';

export default function TenantSavedRoomsPage() {
  const t = useTranslations('tenant.savedRooms');
  const { rooms, isLoading, error, refetch } = useBookmarks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t('title')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/rooms">
          <Button variant="outline" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
            {t('exploreMore')}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <RoomCardSkeleton />
          <RoomCardSkeleton />
          <RoomCardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          title={t('errorTitle')}
          message={error}
          onRetry={refetch}
        />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" />}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={{ ...room, isBookmarked: true }} />
          ))}
        </div>
      )}
    </div>
  );
}
