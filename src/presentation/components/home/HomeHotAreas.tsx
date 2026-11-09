'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MapPin, ArrowRight } from 'lucide-react';
import { HotAreaDto } from '@/application/dto/listing.dto';
import { SectionState } from '@/presentation/hooks/useHomePageData';
import { MEDIA_MANIFEST } from '@/shared/media-manifest';
import { Reveal, Stagger } from '@/presentation/components/motion';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';

const AREA_MEDIA_MAP: Record<string, string> = {
  HN: 'ha-noi',
  HCM: 'ho-chi-minh',
  DNG: 'da-nang',
  HP: 'hai-phong',
  HUE: 'hue',
  BDG: 'binh-duong',
  BN: 'bac-ninh',
  CT: 'can-tho',
};

interface HomeHotAreasProps {
  areasState: SectionState<HotAreaDto[]>;
  onRetry?: () => void;
}

export function HomeHotAreas({ areasState, onRetry }: HomeHotAreasProps) {
  const t = useTranslations('areas');
  const locale = useLocale();

  const getMediaAsset = (code: string) => {
    const key = AREA_MEDIA_MAP[code] || 'ha-noi';
    return MEDIA_MANIFEST['areas']?.[key] || MEDIA_MANIFEST['areas']['ha-noi'];
  };

  return (
    <section className="py-16 md:py-20 bg-stone-50/50 dark:bg-stone-900/40 border-b border-stone-200/60 dark:border-stone-800">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <Reveal variant="fadeUp" className="max-w-2xl mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {t('sectionSubtitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
            {t('sectionTitle')}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            {t('sectionDescription')}
          </p>
        </Reveal>

        {areasState.error ? (
          <ErrorState
            title={t('errorTitle')}
            message={areasState.error}
            onRetry={onRetry}
            className="my-6"
          />
        ) : areasState.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-4/3 rounded-2xl w-full" />
            ))}
          </div>
        ) : areasState.data.length === 0 ? (
          <div className="text-center py-12 text-sm text-stone-500">
            {t('noAreas')}
          </div>
        ) : (
          <Reveal variant="fadeUp">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {areasState.data.slice(0, 8).map((area, index) => {
                const asset = getMediaAsset(area.code);
                const isFeature = index === 0;

                return (
                  <Link
                    key={area.code}
                    href={`/rooms?provinceCode=${area.code}`}
                    className={`group relative rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-stone-900 shadow-xs hover:shadow-xl transition-all duration-300 hover-lift ${
                      isFeature
                        ? 'col-span-2 row-span-2 min-h-[300px] sm:min-h-[360px]'
                        : 'aspect-4/3 min-h-[160px]'
                    }`}
                  >
                    <Image
                      src={asset.webp640}
                      alt={locale === 'vi' ? asset.altVi : asset.altEn}
                      fill
                      sizes={
                        isFeature
                          ? '(max-width: 640px) 100vw, 50vw'
                          : '(max-width: 640px) 50vw, 25vw'
                      }
                      placeholder="blur"
                      blurDataURL={asset.blurDataURL}
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Scrim */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent"
                      aria-hidden="true"
                    />

                    {/* Area Details */}
                    <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10">
                      <h3
                        className={`font-bold leading-tight group-hover:text-teal-200 transition-colors ${
                          isFeature ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base'
                        }`}
                      >
                        {area.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-stone-300 mt-1">
                        <span>{t('roomCount', { count: area.roomCount })}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-teal-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
