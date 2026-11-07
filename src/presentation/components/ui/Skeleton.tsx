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

export function RoomCardSkeleton() {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 space-y-3">
      <Skeleton className="w-full h-48 rounded-xl" />
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="w-1/3 h-4" />
          <Skeleton className="w-1/5 h-4" />
        </div>
        <Skeleton className="w-4/5 h-5" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  );
}
