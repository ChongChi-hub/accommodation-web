'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Grid,
  Home as HomeIcon,
  ImageIcon,
} from 'lucide-react';
import { RoomImageDetailDto } from '@/application/dto/listing.dto';
import { cn } from '@/lib/cn';

export interface RoomHeroGalleryProps {
  images: (RoomImageDetailDto | string)[];
  title: string;
}

interface NormalizedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';

export function RoomHeroGallery({ images, title }: RoomHeroGalleryProps) {
  const normalizedImages: NormalizedImage[] =
    images && images.length > 0
      ? images.map((img, idx) => {
          if (typeof img === 'string') {
            return {
              url: img,
              alt: `${title} - Hình ảnh ${idx + 1}`,
              width: 1280,
              height: 800,
            };
          }
          return {
            url: img.imageUrl,
            alt: img.altText || `${title} - Hình ảnh ${idx + 1}`,
            width: img.width || 1280,
            height: img.height || 800,
          };
        })
      : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  const touchStartX = useRef<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const total = normalizedImages.length;

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const openLightboxAt = (idx: number) => {
    setCurrentIndex(idx);
    setIsLightboxOpen(true);
  };

  // Lightbox keyboard navigation + focus trap
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, goToNext, goToPrev]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    touchStartX.current = null;
  };

  const handleImageError = (index: number) => {
    setImageErrorMap((prev) => ({ ...prev, [index]: true }));
  };

  // 0 images: Branded fallback placeholder
  if (total === 0) {
    return (
      <div className="relative aspect-16/10 max-h-[500px] w-full rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center text-stone-400 p-8 select-none">
        <HomeIcon className="w-14 h-14 stroke-1 mb-3 text-teal-700 dark:text-teal-400" />
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
          Tổ Ấm - Phòng trọ đang cập nhật ảnh thực tế
        </span>
        <span className="text-xs text-stone-500 mt-1">
          Chủ trọ sẽ tải lên hình ảnh phòng trong thời gian sớm nhất
        </span>
      </div>
    );
  }

  const getImageSrc = (index: number) => {
    if (imageErrorMap[index] || !normalizedImages[index]?.url) {
      return FALLBACK_IMAGE;
    }
    return normalizedImages[index].url;
  };

  return (
    <div className="space-y-3" id="gallery">
      {/* ================= DESKTOP MARKETPLACE HERO (md+) ================= */}
      <div className="hidden md:block relative w-full h-[460px] lg:h-[500px] rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-stone-100 dark:bg-stone-900">
        {total === 1 && (
          <div
            onClick={() => openLightboxAt(0)}
            className="relative w-full h-full cursor-pointer group"
          >
            <Image
              src={getImageSrc(0)}
              alt={normalizedImages[0].alt}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover transition-transform duration-300 group-hover:scale-102"
              onError={() => handleImageError(0)}
            />
          </div>
        )}

        {total === 2 && (
          <div className="grid grid-cols-2 gap-2 w-full h-full p-1 bg-stone-200/60 dark:bg-stone-800/60">
            {normalizedImages.slice(0, 2).map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightboxAt(idx)}
                className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
              >
                <Image
                  src={getImageSrc(idx)}
                  alt={img.alt}
                  fill
                  priority={idx === 0}
                  sizes="50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-103"
                  onError={() => handleImageError(idx)}
                />
              </div>
            ))}
          </div>
        )}

        {total === 3 && (
          <div className="grid grid-cols-5 gap-2 w-full h-full p-1 bg-stone-200/60 dark:bg-stone-800/60">
            <div
              onClick={() => openLightboxAt(0)}
              className="col-span-3 relative h-full rounded-xl overflow-hidden cursor-pointer group"
            >
              <Image
                src={getImageSrc(0)}
                alt={normalizedImages[0].alt}
                fill
                priority
                sizes="60vw"
                className="object-cover transition-transform duration-300 group-hover:scale-103"
                onError={() => handleImageError(0)}
              />
            </div>
            <div className="col-span-2 grid grid-rows-2 gap-2 h-full">
              {normalizedImages.slice(1, 3).map((img, idx) => (
                <div
                  key={idx + 1}
                  onClick={() => openLightboxAt(idx + 1)}
                  className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                >
                  <Image
                    src={getImageSrc(idx + 1)}
                    alt={img.alt}
                    fill
                    loading="lazy"
                    sizes="40vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-103"
                    onError={() => handleImageError(idx + 1)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {total >= 4 && (
          <div className="grid grid-cols-5 gap-2 w-full h-full p-1 bg-stone-200/60 dark:bg-stone-800/60">
            {/* Main photo 60% */}
            <div
              onClick={() => openLightboxAt(0)}
              className="col-span-3 relative h-full rounded-xl overflow-hidden cursor-pointer group"
            >
              <Image
                src={getImageSrc(0)}
                alt={normalizedImages[0].alt}
                fill
                priority
                sizes="60vw"
                className="object-cover transition-transform duration-300 group-hover:scale-102"
                onError={() => handleImageError(0)}
              />
            </div>

            {/* 2x2 grid 40% */}
            <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-2 h-full">
              {normalizedImages.slice(1, 5).map((img, idx) => (
                <div
                  key={idx + 1}
                  onClick={() => openLightboxAt(idx + 1)}
                  className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                >
                  <Image
                    src={getImageSrc(idx + 1)}
                    alt={img.alt}
                    fill
                    loading="lazy"
                    sizes="20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => handleImageError(idx + 1)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View all photos pill button */}
        <button
          onClick={() => openLightboxAt(0)}
          className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 font-semibold text-xs shadow-md border border-stone-200 dark:border-stone-700 backdrop-blur-md hover:bg-white dark:hover:bg-stone-900 transition-all cursor-pointer select-none active:scale-95"
          aria-label="Xem tất cả ảnh phòng trọ"
        >
          <Grid className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
          <span>Xem tất cả {total} ảnh</span>
        </button>
      </div>

      {/* ================= MOBILE SWIPEABLE CAROUSEL (< md) ================= */}
      <div
        className="md:hidden relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => openLightboxAt(currentIndex)}
      >
        <Image
          src={getImageSrc(currentIndex)}
          alt={normalizedImages[currentIndex]?.alt || title}
          fill
          priority={currentIndex === 0}
          sizes="100vw"
          className="object-cover"
          onError={() => handleImageError(currentIndex)}
        />

        {/* Counter indicator */}
        <div className="absolute bottom-3 right-3 bg-stone-900/80 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-xs">
          {currentIndex + 1}/{total}
        </div>

        {/* Nav arrows */}
        {total > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-stone-900/60 text-white backdrop-blur-xs"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-stone-900/60 text-white backdrop-blur-xs"
              aria-label="Ảnh kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* ================= FULLSCREEN LIGHTBOX MODAL ================= */}
      {isLightboxOpen && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-stone-950/95 flex flex-col justify-between p-4 md:p-6 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Thư viện ảnh toàn màn hình"
        >
          {/* Top header bar */}
          <div className="flex items-center justify-between text-white w-full max-w-6xl mx-auto py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-white/10">
                {currentIndex + 1} / {total}
              </span>
              <span className="text-xs text-stone-300 truncate max-w-md hidden sm:inline">
                {title}
              </span>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Đóng toàn màn hình (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Stage */}
          <div className="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-center my-2">
            <div className="relative w-full h-[65vh] max-h-[700px]">
              <Image
                src={getImageSrc(currentIndex)}
                alt={normalizedImages[currentIndex]?.alt || title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                onError={() => handleImageError(currentIndex)}
              />
            </div>

            {total > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-xs cursor-pointer transition-all active:scale-90"
                  aria-label="Ảnh trước (Mũi tên trái)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-xs cursor-pointer transition-all active:scale-90"
                  aria-label="Ảnh kế tiếp (Mũi tên phải)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {total > 1 && (
            <div className="w-full max-w-4xl mx-auto flex justify-center gap-2 overflow-x-auto py-2 scrollbar-none">
              {normalizedImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    'relative aspect-4/3 w-16 md:w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer',
                    currentIndex === idx
                      ? 'border-teal-500 ring-2 ring-teal-500/50 opacity-100 scale-105'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  )}
                  aria-label={`Chuyển đến ảnh ${idx + 1}`}
                >
                  <Image
                    src={getImageSrc(idx)}
                    alt={img.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                    onError={() => handleImageError(idx)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
