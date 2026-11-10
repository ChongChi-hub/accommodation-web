'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Building, MapPin, ShieldCheck, MessageSquareQuote } from 'lucide-react';
import { PlatformStatsDto } from '@/application/dto/listing.dto';
import { SectionState } from '@/presentation/hooks/useHomePageData';
import { CountUp } from '@/presentation/components/motion/CountUp';
import { Reveal, Stagger } from '@/presentation/components/motion';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';

interface HomeStatsSectionProps {
  statsState: SectionState<PlatformStatsDto | null>;
  onRetry?: () => void;
}

export function HomeStatsSection({ statsState, onRetry }: HomeStatsSectionProps) {
  const t = useTranslations('stats');

  const statsData = statsState.data;

  const statItems = [
    {
      id: 'activeRooms',
      icon: Building,
      value: statsData?.activeRooms ?? 0,
      labelKey: 'activeRooms',
      descKey: 'activeRoomsDesc',
    },
    {
      id: 'provincesWithRooms',
      icon: MapPin,
      value: statsData?.provincesWithRooms ?? 0,
      labelKey: 'provinces',
      descKey: 'provincesDesc',
    },
    {
      id: 'verifiedLandlords',
      icon: ShieldCheck,
      value: statsData?.verifiedLandlords ?? 0,
      labelKey: 'verifiedHosts',
      descKey: 'verifiedHostsDesc',
    },
    {
      id: 'totalReviews',
      icon: MessageSquareQuote,
      value: statsData?.totalReviews ?? 0,
      labelKey: 'reviews',
      descKey: 'reviewsDesc',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-stone-900 border-b border-stone-200/60 dark:border-stone-800">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <Reveal variant="fadeUp" className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            {t('sectionSubtitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
            {t('sectionTitle')}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            {t('sectionDescription')}
          </p>
        </Reveal>

        {statsState.error ? (
          <ErrorState
            title={t('errorTitle')}
            message={statsState.error}
            onRetry={onRetry}
            className="my-6 max-w-md mx-auto"
          />
        ) : statsState.isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-2xl w-full" />
            ))}
          </div>
        ) : (
          <Reveal variant="fadeUp">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-stone-50/70 dark:bg-stone-800/50 rounded-2xl p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 flex flex-col items-center text-center hover-lift transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
                      <CountUp target={item.value} durationMs={1200} />
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 mt-1">
                      {t(`items.${item.labelKey}`)}
                    </h3>

                    <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                      {t(`items.${item.descKey}`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
