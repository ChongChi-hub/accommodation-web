'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LayoutGrid, List as ListIcon, X } from 'lucide-react';
import { APP_ROUTES, ROOM_CATEGORY_ALIAS_MAP } from '@/shared/routes';
import { useRooms } from '@/presentation/hooks/useRooms';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomFilterBar } from '@/presentation/components/rooms/RoomFilterBar';
import { RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { cn } from '@/lib/cn';

export type CategoryKey = 'phongTro' | 'nhaNguyenCan' | 'canHo' | 'oGhep';

export interface RoomsCatalogClientProps {
  categoryKey?: CategoryKey;
}

export function RoomsCatalogClient({ categoryKey }: RoomsCatalogClientProps) {
  const tCat = useTranslations('categoryPages');
  const tNav = useTranslations('header.nav');
  const tCommon = useTranslations('common');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const meta = categoryKey ? ROOM_CATEGORY_ALIAS_MAP[categoryKey] : undefined;
  const presetCodes = meta ? meta.roomTypeCodes.join(',') : undefined;

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
  } = useRooms({}, presetCodes);

  const heading = categoryKey ? tCat(`${categoryKey}.title`) : tCat('allRoomsTitle');
  const subtitle = categoryKey ? tCat(`${categoryKey}.description`) : tCat('allRoomsDescription');
  const breadcrumbItems = categoryKey
    ? [{ label: tCat('breadcrumbRooms'), href: APP_ROUTES.rooms }, { label: heading }]
    : [{ label: tCat('breadcrumbRooms') }];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{heading}</h1>
        <p className="text-xs sm:text-sm text-foreground-muted">{subtitle}</p>
      </div>

      <RoomFilterBar
        params={params}
        onChange={updateParams}
        onReset={resetParams}
        provinces={provinces}
        wards={wards}
        hideRoomTypeFilter={Boolean(categoryKey)}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-foreground-muted font-medium">
            {tCat('resultsCount', { count: rooms.length })}
          </p>
          {params.q && (
            <button
              type="button"
              onClick={() => updateParams({ q: undefined })}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary dark:text-primary-300 text-[11px] font-semibold cursor-pointer"
            >
              <span>{tCat('queryBadge', { q: params.q })}</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-surface text-primary dark:text-primary-300 shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            )}
            aria-label="Grid"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-surface text-primary dark:text-primary-300 shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            )}
            aria-label="List"
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
        <ErrorState title={tCommon('error')} message={error} onRetry={retry} />
      ) : rooms.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title={tCat('emptyTitle')}
            description={tCat('emptyDescription')}
            actionLabel={tCat('resetFilters')}
            onAction={resetParams}
          />
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-foreground-muted">{tCat('suggestionsLabel')}</span>
            <Link
              href={APP_ROUTES.phongTro}
              className="px-3 py-1 rounded-full border border-border bg-surface hover:border-primary text-foreground font-medium"
            >
              {tNav('phongTro')}
            </Link>
            <Link
              href={APP_ROUTES.canHo}
              className="px-3 py-1 rounded-full border border-border bg-surface hover:border-primary text-foreground font-medium"
            >
              {tNav('canHo')}
            </Link>
            <Link
              href={APP_ROUTES.rooms}
              className="px-3 py-1 rounded-full border border-border bg-surface hover:border-primary text-primary dark:text-primary-300 font-semibold"
            >
              {tCat('breadcrumbRooms')}
            </Link>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
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

