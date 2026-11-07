'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (val: number) => void;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: RatingProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(value);

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            className={cn(
              'transition-transform',
              interactive && 'cursor-pointer hover:scale-110'
            )}
            aria-label={`${starValue} sao`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-stone-300 dark:text-stone-700'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

