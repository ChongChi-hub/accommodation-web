'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface RoomCardCarouselProps {
  images: string[];
  title: string;
  aspectClassName?: string;
  sizes?: string;
}

export function RoomCardCarousel({
  images,
  title,
  aspectClassName = 'aspect-4/3',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: RoomCardCarouselProps) {
  const validImages = images.length > 0 ? images.slice(0, 5) : ['/images/rooms/room-fallback-640.webp'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  }, [validImages.length]);

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  }, [validImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
      } else {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
      }
    }
    setTouchStartX(null);
  };

  return (
    <div
      className={cn('relative w-full overflow-hidden bg-stone-100 dark:bg-stone-800 select-none', aspectClassName)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {validImages.map((src, idx) => (
        <div
          key={src + idx}
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            idx === currentIndex ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
          )}
        >
          {(idx === currentIndex || Math.abs(idx - currentIndex) <= 1) && (
            <Image
              src={src}
              alt={`${title} - ảnh ${idx + 1}`}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading={idx === 0 ? 'lazy' : 'lazy'}
            />
          )}
        </div>
      ))}

      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            aria-label="Ảnh trước"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextImage}
            aria-label="Ảnh sau"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-none">
            {validImages.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 shadow-xs',
                  idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
