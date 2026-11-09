'use client';

import React, { useId } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

export type LogoVariant = 'full' | 'icon' | 'monoLight' | 'monoDark';

export interface LogoProps {
  variant?: LogoVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const tBrand = useTranslations('brand');
  const maskId = useId();
  const iconSize = size === 'sm' ? 28 : 32;

  const roofFill =
    variant === 'monoLight'
      ? 'fill-white'
      : variant === 'monoDark'
      ? 'fill-stone-900'
      : 'fill-primary dark:fill-primary-300';

  const pinMask = variant === 'monoLight' || variant === 'monoDark';
  const wordmarkColor =
    variant === 'monoLight'
      ? 'text-white'
      : variant === 'monoDark'
      ? 'text-stone-900'
      : 'text-primary dark:text-primary-300';

  return (
    <span className={cn('inline-flex items-center gap-2 shrink-0 select-none', className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {pinMask ? (
          <>
            <defs>
              <mask id={maskId}>
                <rect width="48" height="48" fill="white" />
                <circle cx="24" cy="20" r="4.5" fill="black" />
                <path d="M24 23.5C21 23.5 19 28 24 35C29 28 27 23.5 24 23.5Z" fill="black" />
              </mask>
            </defs>
            <path
              d="M6 22L24 6L42 22H36V40C36 41.1 35.1 42 34 42H14C12.9 42 12 41.1 12 40V22H6Z"
              className={roofFill}
              mask={`url(#${maskId})`}
            />
            <path
              d="M28 10C32 10 36 12 37 16C33 16 29 14 28 10Z"
              className={variant === 'monoLight' ? 'fill-amber-300' : 'fill-stone-600'}
            />
          </>
        ) : (
          <>
            <path
              d="M6 22L24 6L42 22H36V40C36 41.1 35.1 42 34 42H14C12.9 42 12 41.1 12 40V22H6Z"
              className={roofFill}
            />
            <circle cx="24" cy="20" r="4.5" className="fill-background" />
            <path d="M24 23.5C21 23.5 19 28 24 35C29 28 27 23.5 24 23.5Z" className="fill-background" />
            <path d="M28 10C32 10 36 12 37 16C33 16 29 14 28 10Z" className="fill-accent" />
          </>
        )}
      </svg>

      {variant !== 'icon' && (
        <span
          className={cn(
            'font-extrabold tracking-tight uppercase whitespace-nowrap leading-none',
            size === 'sm' ? 'text-base' : 'text-lg',
            wordmarkColor
          )}
        >
          {tBrand('name')}
        </span>
      )}
    </span>
  );
}

