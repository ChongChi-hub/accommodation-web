'use client';

import React, { use, useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ShieldCheck, ShieldAlert, Star, Calendar, MessageSquare, Clock, Home } from 'lucide-react';
import { HostPublicProfileDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';
import { ApiError } from '@/infrastructure/http/api-client';
import { APP_ROUTES } from '@/shared/routes';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Badge } from '@/presentation/components/ui/Badge';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton, RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';

export default function HostProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('hostProfile');
  const tCat = useTranslations('categoryPages');

  const [profile, setProfile] = useState<HostPublicProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHostProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);
    try {
      const repo = container.listing.listingRepository;
      if (!repo.getHostProfile) {
        throw new Error(t('loadErrorTitle'));
      }
      const data = await repo.getHostProfile(id);
      setProfile(data);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        setIsNotFound(true);
      } else {
        setError(err instanceof Error ? err.message : t('loadErrorTitle'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void loadHostProfile();
  }, [loadHostProfile]);

  const joinedYear = profile?.joinedAt ? new Date(profile.joinedAt).getFullYear() : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: tCat('breadcrumbRooms'), href: APP_ROUTES.rooms },
          { label: profile?.name || t('breadcrumb') },
        ]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 space-y-4 h-fit">
            <Skeleton className="w-20 h-20 rounded-full mx-auto" />
            <Skeleton className="h-5 w-40 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </Card>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        </div>
      ) : isNotFound ? (
        <EmptyState
          title={t('notFoundTitle')}
          description={t('notFoundDesc')}
          actionLabel={t('backToRooms')}
          onAction={() => router.push(APP_ROUTES.rooms)}
        />
      ) : error || !profile ? (
        <ErrorState
          title={t('loadErrorTitle')}
          message={error || t('loadErrorTitle')}
          onRetry={loadHostProfile}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 text-center space-y-4 h-fit">
            <Avatar name={profile.name} src={profile.avatarUrl} size="xl" className="mx-auto" />
            <div>
              <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">{profile.name}</h1>
            </div>

            <div className="flex justify-center gap-2">
              {profile.verified ? (
                <Badge variant="success" size="sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> {t('verifiedBadge')}
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  <ShieldAlert className="w-3.5 h-3.5" /> {t('unverifiedBadge')}
                </Badge>
              )}
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-300">
              <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <p className="text-stone-400 text-[10px]">{t('ratingLabel')}</p>
                <p className="font-bold flex items-center justify-center gap-1 mt-0.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {profile.ratingAvg && profile.ratingAvg > 0
                    ? profile.ratingAvg.toFixed(1)
                    : t('noReviewsYet')}
                </p>
              </div>
              <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <p className="text-stone-400 text-[10px]">{t('responseRateLabel')}</p>
                <p className="font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                  {profile.responseRatePercent !== undefined && profile.responseRatePercent !== null
                    ? `${profile.responseRatePercent}%`
                    : '—'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-left text-xs text-stone-500 pt-2">
              {joinedYear && !Number.isNaN(joinedYear) && (
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t('joinedFrom', { year: joinedYear })}</span>
                </p>
              )}
              {profile.responseTimeMinutes !== undefined && profile.responseTimeMinutes !== null && (
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {t('responseTimeLabel')}: {t('minutesUnit', { minutes: profile.responseTimeMinutes })}
                  </span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('roomCountStat', { count: profile.roomCount ?? profile.rooms.length })}</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('responseRateLabel')}: {profile.responseRatePercent ?? 0}%</span>
              </p>
            </div>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {t('roomsSectionTitle', { count: profile.rooms.length })}
              </h2>
              <p className="text-xs text-stone-400">{t('roomsSectionSubtitle')}</p>
            </div>

            {profile.rooms.length === 0 ? (
              <EmptyState title={t('emptyRoomsTitle')} description={t('emptyRoomsDesc')} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
