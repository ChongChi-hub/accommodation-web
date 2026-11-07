'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'outline' | 'elevated';
  interactive?: boolean;
}

export function Card({
  className,
  variant = 'default',
  interactive = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    default:
      'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs',
    muted:
      'bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800/80',
    outline:
      'bg-transparent border border-stone-300 dark:border-stone-700',
    elevated:
      'bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 shadow-md',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-200',
        variants[variant],
        interactive &&
          'hover:-translate-y-0.5 hover:shadow-md hover:border-teal-600/40 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-base font-semibold text-stone-900 dark:text-stone-100 tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-stone-600 dark:text-stone-300', className)} {...props}>
      {children}
    </div>
  );
}

