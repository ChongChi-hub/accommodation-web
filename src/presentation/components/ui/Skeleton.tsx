'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({
  className,
  variant = 'rect',
  ...props
}: SkeletonProps) {
  const variantStyles = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'h-4 rounded-md',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-stone-200/80 dark:bg-stone-800',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function RoomCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' | 'compact' } = {}) {
  if (variant === 'list') {
    return (
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col sm:flex-row">
        <Skeleton className="w-full sm:w-72 aspect-4/3 sm:aspect-auto rounded-none shrink-0" />
        <div className="p-4 sm:p-5 flex-1 space-y-3">
          <div className="flex justify-between"><Skeleton className="w-24 h-5" /><Skeleton className="w-20 h-5" /></div>
          <Skeleton className="w-4/5 h-6" />
          <Skeleton className="w-1/2 h-4" />
          <div className="flex gap-2 pt-2"><Skeleton className="w-16 h-4" /><Skeleton className="w-16 h-4" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col">
      <Skeleton className="w-full aspect-4/3 rounded-none" />
      <div className="p-4 space-y-3 flex-1">
        <div className="flex justify-between items-center">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-4/5 h-5" />
        <Skeleton className="w-1/2 h-3" />
        <div className="flex justify-between items-center pt-2 border-t border-stone-100 dark:border-stone-800">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-12 h-4" />
        </div>
      </div>
    </div>
  );
}

