'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex flex-row items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer whitespace-nowrap [&>svg]:shrink-0 [&>svg]:inline-block';

    const variants = {
      primary:
        'bg-teal-700 text-white hover:bg-teal-800 shadow-xs hover:shadow-sm focus-visible:ring-teal-700 active:bg-teal-900',
      secondary:
        'bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400 shadow-xs hover:shadow-sm focus-visible:ring-amber-500 active:bg-amber-600',
      outline:
        'border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/80 shadow-xs focus-visible:ring-teal-700',
      ghost:
        'bg-transparent text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:ring-teal-700',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-xs hover:shadow-sm focus-visible:ring-rose-500',
    };

    const sizes = {
      sm: 'h-8 text-xs px-3 gap-1.5',
      md: 'h-10 text-sm px-4 gap-2',
      lg: 'h-11 text-sm md:text-base px-5 gap-2.5',
      xl: 'h-12 text-base px-6 gap-3',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {!isLoading && leftIcon && (
          <span className="inline-flex items-center justify-center shrink-0 [&>svg]:shrink-0 [&>svg]:inline-block">
            {leftIcon}
          </span>
        )}
        <span className="inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap leading-none [&>svg]:shrink-0 [&>svg]:inline-block">
          {children}
        </span>
        {!isLoading && rightIcon && (
          <span className="inline-flex items-center justify-center shrink-0 [&>svg]:shrink-0 [&>svg]:inline-block">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
