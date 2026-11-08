'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useBookmarkToggle } from '@/presentation/hooks/useBookmarks';
import { cn } from '@/lib/cn';

export interface BookmarkButtonProps {
  roomId: number;
  initialBookmarked?: boolean;
  initialCount?: number;
  showCount?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BookmarkButton({
  roomId,
  initialBookmarked = false,
  initialCount = 0,
  showCount = false,
  className,
  size = 'md',
}: BookmarkButtonProps) {
  const { isBookmarked, bookmarkCount, isPending, toggle } = useBookmarkToggle(
    roomId,
    initialBookmarked,
    initialCount
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? 'Bỏ lưu phòng' : 'Lưu phòng'}
      className={cn(
        'group inline-flex items-center justify-center gap-1.5 rounded-full p-2 transition-transform duration-200 active:scale-90 focus:outline-none',
        isBookmarked
          ? 'bg-rose-50/90 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 hover:bg-rose-100'
          : 'bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white',
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-colors duration-200',
          isBookmarked && 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400'
        )}
      />
      {showCount && (
        <span className="text-xs font-semibold tabular-nums text-stone-700 dark:text-stone-300">
          {bookmarkCount}
        </span>
      )}
    </button>
  );
}
