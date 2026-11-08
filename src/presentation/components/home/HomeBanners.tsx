'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { BannerDto } from '@/application/dto/listing.dto';

interface HomeBannersProps {
  banners: BannerDto[];
  isLoading?: boolean;
}

export function HomeBanners({ banners, isLoading }: HomeBannersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (isLoading || banners.length === 0) return null;

  const current = banners[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-lg">
      <div className="relative aspect-21/9 sm:aspect-28/9 w-full min-h-[160px] sm:min-h-[200px]">
        <Image
          src={current.imageUrl}
          alt={current.title}
          fill
          priority
          className="object-cover opacity-40 transition-opacity duration-700"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent flex items-center p-6 sm:p-10">
          <div className="max-w-xl space-y-2">
            {current.badgeText && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-stone-950">
                {current.badgeText}
              </span>
            )}
            <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
              {current.title}
            </h2>
            {current.subtitle && (
              <p className="text-xs text-stone-300 hidden sm:block leading-relaxed">
                {current.subtitle}
              </p>
            )}
            <div className="pt-2">
              <Link
                href={current.linkUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4"
              >
                Tìm hiểu thêm <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 flex items-center gap-1 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

