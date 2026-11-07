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
      'bg-surface border border-border shadow-xs',
    muted:
      'bg-surface-muted border border-border',
    outline:
      'bg-transparent border border-border',
    elevated:
      'bg-surface border border-border shadow-md',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-5 md:p-6 transition-all duration-200 text-foreground',
        variants[variant],
        interactive &&
          'hover:-translate-y-0.5 hover:shadow-sm hover:border-teal-700/40 cursor-pointer',
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
        'text-base font-semibold text-foreground tracking-tight',
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
    <div className={cn('text-sm text-foreground', className)} {...props}>
      {children}
    </div>
  );
}
