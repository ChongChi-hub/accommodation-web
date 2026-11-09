'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Compass } from 'lucide-react';
import { RoomDto } from '@/application/dto/listing.dto';
import { SectionState } from '@/presentation/hooks/useHomePageData';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { Reveal, Stagger } from '@/presentation/components/motion';
import { Button } from '@/presentation/components/ui/Button';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';

interface HomeLatestRoomsProps {
  roomsState: SectionState<RoomDto[]>;
  totalActiveRooms?: number;
  onRetry?: () => void;
}

export function HomeLatestRooms({
  roomsState,
  totalActiveRooms,
  onRetry,
}: HomeLatestRoomsProps) {
  const t = useTranslations('latest');

  return (
    <section className="py-16 md:py-20 bg-stone-50/50 dark:bg-stone-900/40 border-b border-stone-200/60 dark:border-stone-800">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <Reveal variant="fadeUp">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              {t('sectionSubtitle')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              {t('sectionTitle')}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t('sectionDescription')}
            </p>
          </Reveal>

          <Link
            href="/rooms"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
          >
            <span>
              {totalActiveRooms
                ? t('viewAllCount', { count: totalActiveRooms })
                : t('viewAll')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {roomsState.error ? (
          <ErrorState
            title={t('errorTitle')}
            message={roomsState.error}
            onRetry={onRetry}
            className="my-6"
          />
        ) : roomsState.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl w-full" />
            ))}
          </div>
        ) : roomsState.data.length === 0 ? (
          <div className="text-center py-12 text-sm text-stone-500">
            {t('noRooms')}
          </div>
        ) : (
          <Reveal variant="fadeUp">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {roomsState.data.slice(0, 8).map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </Reveal>
        )}

        {/* Mobile View All CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/rooms" className="w-full inline-block">
            <Button variant="outline" size="md" className="w-full">
              {totalActiveRooms
                ? t('viewAllCount', { count: totalActiveRooms })
                : t('viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
