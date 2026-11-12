'use client';
import { useTranslations } from 'next-intl';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Sparkles } from 'lucide-react';
import { APP_ROUTES } from '@/shared/routes';

interface RoomCatalogHeroProps {
  title: string;
  description: string;
  heroImage: string;
  totalRooms: number;
}

export function RoomCatalogHero({
  title,
  description,
  heroImage,
  totalRooms,
}: RoomCatalogHeroProps) {
  const tAuto = useTranslations('autoI18n');
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (totalRooms <= 0) {
      setDisplayCount(0);
      return;
    }
    const duration = 600;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayCount(Math.round(progress * totalRooms));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [totalRooms]);

  return (
    <div className="relative h-72 sm:h-80 md:h-92 w-full overflow-hidden bg-stone-900">
      {/* Background Image */}
      <Image
        src={heroImage}
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center brightness-90"
      />

      {/* Contrast Scrim (>= 4.5:1 ratio for white text) */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/60 to-stone-950/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-between pt-6 pb-16">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: APP_ROUTES.home },
            { label: 'Phòng trọ', href: APP_ROUTES.rooms },
            { label: title },
          ]}
          className="text-stone-300 [&_a]:text-stone-300 [&_a:hover]:text-white [&_span]:text-white/90"
        />

        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {displayCount}{' '}{tAuto('k0577')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-2xl font-normal leading-relaxed drop-shadow-xs">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

