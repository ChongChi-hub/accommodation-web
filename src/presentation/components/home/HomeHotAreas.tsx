'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MapPin, ArrowRight, Plus, ChevronUp } from 'lucide-react';
import { HotAreaDto } from '@/application/dto/listing.dto';
import { SectionState } from '@/presentation/hooks/useHomePageData';
import { MEDIA_MANIFEST } from '@/shared/media-manifest';
import { Reveal } from '@/presentation/components/motion';
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

const MAX_GRID_CARDS = 12; // 4x3 grid limit

interface HomeHotAreasProps {
  areasState: SectionState<HotAreaDto[]>;
  onRetry?: () => void;
}

export function HomeHotAreas({ areasState, onRetry }: HomeHotAreasProps) {
  const t = useTranslations('areas');
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);

  // Requirement: Chỉ hiện các tỉnh có ít nhất 1 phòng trống (> 0)
  const activeAreas = useMemo(() => {
    return (areasState.data || []).filter((area) => (area.roomCount ?? 0) > 0);
  }, [areasState.data]);

  const hasMoreThanLimit = activeAreas.length > MAX_GRID_CARDS;
  const remainingCount = activeAreas.length - (MAX_GRID_CARDS - 1);

  // Khi chưa mở rộng và có > 12 tỉnh: hiển thị 11 tỉnh đầu + 1 card dấu "+"
  const displayedAreas = useMemo(() => {
    if (!hasMoreThanLimit || isExpanded) {
      return activeAreas;
    }
    return activeAreas.slice(0, MAX_GRID_CARDS - 1);
  }, [activeAreas, hasMoreThanLimit, isExpanded]);

  const getFallbackMedia = (code: string) => {
    const key = AREA_MEDIA_MAP[code] || 'ha-noi';
    return MEDIA_MANIFEST['areas']?.[key] || MEDIA_MANIFEST['areas']['ha-noi'];
  };

  const resolveImage = (area: HotAreaDto) => {
    // Ưu tiên hình ảnh thật từ phòng trọ do chủ nhà cung cấp
    if (area.imageUrl && !area.imageUrl.includes('fallback.webp')) {
      return area.imageUrl;
    }
    const asset = getFallbackMedia(area.code);
    return asset?.webp640 || '/images/areas/ha-noi-640.webp';
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-4/3 rounded-2xl w-full" />
            ))}
          </div>
        ) : activeAreas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-10 text-center bg-white/40 dark:bg-stone-900/40">
            <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              Hiện tại chưa có phòng trọ nào được đăng trên hệ thống
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
              Khi chủ trọ đăng phòng và được phê duyệt, danh sách tỉnh thành và số phòng trống sẽ tự động xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <Reveal variant="fadeUp">
            {/* Khung lưới 4 cột ngang x 3 hàng dọc (Tối đa 12 card) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
              {displayedAreas.map((area) => {
                const imageSrc = resolveImage(area);

                return (
                  <Link
                    key={area.code}
                    href={`/rooms?provinceCode=${area.code}`}
                    className="group relative aspect-4/3 min-h-[170px] rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-stone-900 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
                  >
                    <Image
                      src={imageSrc}
                      alt={area.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized={imageSrc.startsWith('http') && !imageSrc.includes('res.cloudinary.com')}
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Scrim */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent"
                      aria-hidden="true"
                    />

                    {/* Area Details */}
                    <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10">
                      <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-teal-200 transition-colors">
                        {area.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-stone-300 mt-1">
                        <span className="font-medium text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {t('roomCount', { count: area.roomCount })}
                        </span>
                        <ArrowRight className="w-4 h-4 text-teal-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Card thứ 12: Dấu "+" khi có nhiều hơn 12 tỉnh có phòng trống */}
              {hasMoreThanLimit && !isExpanded && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  aria-label={`Xem thêm ${remainingCount} tỉnh thành có phòng trống`}
                  className="group relative aspect-4/3 min-h-[170px] rounded-2xl overflow-hidden border-2 border-dashed border-teal-500/50 hover:border-teal-400 bg-gradient-to-br from-stone-900 via-stone-850 to-teal-950/50 p-5 flex flex-col items-center justify-center text-center cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 group-hover:bg-teal-500/30 border border-teal-400/40 flex items-center justify-center text-teal-300 mb-2 transition-transform duration-300 group-hover:scale-110">
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-2xl font-black text-white group-hover:text-teal-200 tracking-tight transition-colors">
                    +{remainingCount}
                  </span>
                  <span className="text-xs font-semibold text-stone-300 mt-0.5 uppercase tracking-wider">
                    {t('otherProvinces')}
                  </span>
                  <span className="text-[11px] text-teal-400 mt-1 opacity-90 group-hover:opacity-100 font-medium">
                    {t('viewAll')}
                  </span>
                </button>
              )}
            </div>

            {/* Nút thu gọn lại nếu người dùng đã bấm mở rộng */}
            {hasMoreThanLimit && isExpanded && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer shadow-xs"
                >
                  <ChevronUp className="w-4 h-4" />
                  {t('collapse')}
                </button>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
