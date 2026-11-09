'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Home, Building2, Building, Users } from 'lucide-react';
import { MEDIA_MANIFEST } from '@/shared/media-manifest';
import { Reveal, Stagger } from '@/presentation/components/motion';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { SectionState } from '@/presentation/hooks/useHomePageData';
import { RoomFacetsDto } from '@/application/dto/listing.dto';

const CATEGORIES = [
  {
    id: 'phong-tro',
    titleKey: 'phongTro',
    descKey: 'phongTroDesc',
    icon: Home,
    asset: MEDIA_MANIFEST['categories']['phong-tro'],
    href: '/rooms?roomType=SINGLE',
  },
  {
    id: 'nha-nguyen-can',
    titleKey: 'nhaNguyenCan',
    descKey: 'nhaNguyenCanDesc',
    icon: Building2,
    asset: MEDIA_MANIFEST['categories']['nha-nguyen-can'],
    href: '/rooms?roomType=FULL_HOUSE',
  },
  {
    id: 'can-ho',
    titleKey: 'canHo',
    descKey: 'canHoDesc',
    icon: Building,
    asset: MEDIA_MANIFEST['categories']['can-ho'],
    href: '/rooms?roomType=MINI_APARTMENT',
  },
  {
    id: 'o-ghep',
    titleKey: 'oGhep',
    descKey: 'oGhepDesc',
    icon: Users,
    asset: MEDIA_MANIFEST['categories']['o-ghep'],
    href: '/rooms?roomType=SHARED',
  },
];

interface HomeCategoryTilesProps {
  facetsState: SectionState<RoomFacetsDto | null>;
  onRetry?: () => void;
}

export function HomeCategoryTiles({ facetsState, onRetry }: HomeCategoryTilesProps) {
  const t = useTranslations('categories');
  const locale = useLocale();

  return (
    <section id="categories-section" className="py-16 md:py-20 bg-stone-50/50 dark:bg-stone-900/40">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <Reveal variant="fadeUp" className="max-w-2xl mb-10">
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

        {facetsState.error ? (
          <ErrorState
            title={t('errorTitle')}
            message={facetsState.error}
            onRetry={onRetry}
            className="my-6"
          />
        ) : facetsState.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72 rounded-2xl w-full" />
            ))}
          </div>
        ) : (
          <Reveal variant="fadeUp">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CATEGORIES.map((cat) => {
                const categoryObj = facetsState.data?.categories?.find((c) => c.code === cat.id);
                const count = categoryObj?.count ?? 0;
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover-lift flex flex-col justify-end p-5 border border-stone-200/80 dark:border-stone-800"
                  >
                    {/* Photo background */}
                    <Image
                      src={cat.asset.webp640}
                      alt={locale === 'vi' ? cat.asset.altVi : cat.asset.altEn}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      placeholder="blur"
                      blurDataURL={cat.asset.blurDataURL}
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Scrim for Contrast */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent"
                      aria-hidden="true"
                    />

                    {/* Card Content */}
                    <div className="relative z-10 text-white">
                      <div className="w-9 h-9 rounded-xl bg-teal-600/80 backdrop-blur-md flex items-center justify-center text-white mb-3">
                        <Icon className="w-5 h-5" />
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-teal-200 transition-colors">
                        {t(`items.${cat.titleKey}`)}
                      </h3>

                      <p className="text-xs text-stone-300 line-clamp-2 mt-1">
                        {t(`items.${cat.descKey}`)}
                      </p>

                      <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-stone-300 font-medium">
                        <span>{t('roomsAvailable', { count })}</span>
                        <span className="flex items-center gap-1 text-teal-300 group-hover:translate-x-1 transition-transform">
                          {t('explore')} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
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
