'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { BannerDto } from '@/application/dto/listing.dto';
import { SectionState } from '@/presentation/hooks/useHomePageData';
import { Skeleton } from '@/presentation/components/ui/Skeleton';

interface HomeBannersProps {
  bannersState: SectionState<BannerDto[]>;
  onRetry?: () => void;
}

export function HomeBanners({ bannersState }: HomeBannersProps) {
  const t = useTranslations('banners');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const banners = bannersState.data;

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  if (bannersState.isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6">
        <Skeleton className="h-32 sm:h-36 rounded-2xl w-full" />
      </div>
    );
  }

  if (banners.length === 0 || bannersState.error) {
    return null; // Gracefully degrade if banners are unavailable
  }

  const current = banners[currentIndex];

  return (
    <section
      aria-label="Thông tin cam kết nền tảng"
      className="container mx-auto px-4 sm:px-6 max-w-7xl py-6"
    >
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-2xl bg-stone-900 border border-stone-800 text-white shadow-md max-h-[160px] flex items-center"
      >
        <div className="relative w-full h-32 sm:h-36 flex items-center">
          <Image
            src={current.imageUrl}
            alt={current.title}
            fill
            sizes="100vw"
            className="object-cover opacity-30 transition-opacity duration-700"
          />

          <div
            className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/70 to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 px-6 sm:px-10 flex flex-col justify-center max-w-2xl">
            {current.badgeText && (
              <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-1.5">
                <ShieldCheck className="w-3 h-3" />
                {current.badgeText}
              </span>
            )}
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white leading-tight">
              {current.title}
            </h3>
            {current.subtitle && (
              <p className="text-xs text-stone-300 line-clamp-1 mt-0.5">
                {current.subtitle}
              </p>
            )}
            <div className="mt-2">
              <Link
                href={current.linkUrl || '/safety-guide'}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-300 hover:text-teal-200"
              >
                {t('learnMore')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {banners.length > 1 && (
          <div
            className="absolute bottom-3 right-4 flex items-center gap-1.5 z-20"
            role="tablist"
            aria-label="Chuyển biểu ngữ"
          >
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={currentIndex === i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === i ? 'w-5 bg-teal-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Biểu ngữ ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
