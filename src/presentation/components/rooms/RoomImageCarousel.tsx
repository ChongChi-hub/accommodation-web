'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X, Home as HomeIcon } from 'lucide-react';
import { RoomImageDetailDto } from '@/application/dto/listing.dto';

interface RoomImageCarouselProps {
  images: (RoomImageDetailDto | string)[];
  title: string;
}

export function RoomImageCarousel({ images, title }: RoomImageCarouselProps) {
  const normalizedImages: { url: string; alt: string; width: number; height: number }[] =
    images.length > 0
      ? images.map((img, idx) => {
          if (typeof img === 'string') {
            return { url: img, alt: `${title} - Ảnh ${idx + 1}`, width: 1280, height: 720 };
          }
          return {
            url: img.imageUrl,
            alt: img.altText || `${title} - Ảnh ${idx + 1}`,
            width: img.width || 1280,
            height: img.height || 720,
          };
        })
      : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
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

  const goToFirst = useCallback(() => setCurrentIndex(0), []);
  const goToLast = useCallback(() => setCurrentIndex(Math.max(0, total - 1)), [total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'Home') goToFirst();
      else if (e.key === 'End') goToLast();
      else if (e.key === 'Escape' && isLightboxOpen) setIsLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, goToFirst, goToLast, isLightboxOpen]);

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

  if (total === 0) {
    return (
      <div className="aspect-16/9 w-full rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center text-stone-400">
        <HomeIcon className="w-12 h-12 stroke-1 mb-2 text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-medium">Tổ Ấm - Chưa có hình ảnh hiển thị</span>
      </div>
    );
  }

  const currentImg = normalizedImages[currentIndex];

  return (
    <div className="space-y-3">
      {/* Main image container */}
      <div
        className="relative aspect-16/9 w-full overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 select-none group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={currentImg.url}
          alt={currentImg.alt}
          fill
          priority={currentIndex === 0}
          className="object-cover motion-safe:transition-all motion-safe:duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
        />

        {/* Counter badge */}
        <div className="absolute bottom-3 right-3 bg-stone-900/75 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {currentIndex + 1}/{total}
        </div>

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/60 hover:bg-stone-900/80 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Xem toàn màn hình"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Left/Right nav buttons */}
        {total > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/60 hover:bg-stone-900/80 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/60 hover:bg-stone-900/80 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Ảnh kế tiếp"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
          {normalizedImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-4/3 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'border-teal-700 ring-2 ring-teal-100 dark:ring-teal-950 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`Ảnh nhỏ ${idx + 1}`}
              role="tab"
              aria-selected={currentIndex === idx}
            >
              <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Đóng toàn màn hình (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full max-w-5xl aspect-16/9 max-h-[80vh]">
            <Image
              src={currentImg.url}
              alt={currentImg.alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <div className="text-white text-sm mt-4 font-medium flex items-center gap-4">
            <button onClick={goToPrev} className="p-2 hover:bg-white/10 rounded-full cursor-pointer">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span>
              {currentIndex + 1} / {total}
            </span>
            <button onClick={goToNext} className="p-2 hover:bg-white/10 rounded-full cursor-pointer">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
