'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { RoomDto } from '@/application/dto/listing.dto';
import { SectionState } from '@/presentation/hooks/useHomePageData';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { Reveal } from '@/presentation/components/motion/Reveal';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';

interface HomeFeaturedCarouselProps {
  roomsState: SectionState<RoomDto[]>;
  onRetry?: () => void;
}

export function HomeFeaturedCarousel({ roomsState, onRetry }: HomeFeaturedCarouselProps) {
  const t = useTranslations('featured');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [roomsState.data]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -340 : 340;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      scroll('right');
    }
  };

  return (
    <section className="py-16 bg-white dark:bg-stone-900 border-b border-stone-200/60 dark:border-stone-800">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <Reveal variant="fadeUp">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t('sectionSubtitle')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              {t('sectionTitle')}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t('sectionDescription')}
            </p>
          </Reveal>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label={t('prev')}
              className="p-2.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label={t('next')}
              className="p-2.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Content */}
        {roomsState.error ? (
          <ErrorState
            title={t('errorTitle')}
            message={roomsState.error}
            onRetry={onRetry}
            className="my-6"
          />
        ) : roomsState.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl w-full" />
            ))}
          </div>
        ) : roomsState.data.length === 0 ? (
          <div className="text-center py-12 text-sm text-stone-500">
            {t('noRooms')}
          </div>
        ) : (
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Danh sách tin đăng nổi bật"
            className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none focus:outline-none focus:ring-2 focus:ring-teal-500/30 rounded-2xl"
          >
            {roomsState.data.map((room) => (
              <div
                key={room.id}
                className="w-72 sm:w-80 shrink-0 snap-start flex flex-col"
              >
                <RoomCard room={room} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

