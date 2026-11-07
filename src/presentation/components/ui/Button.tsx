'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

    const variants = {
      primary:
        'bg-teal-700 text-white hover:bg-teal-800 shadow-xs hover:shadow-sm focus-visible:ring-teal-700',
      secondary:
        'bg-amber-500 text-white hover:bg-amber-600 shadow-xs hover:shadow-sm focus-visible:ring-amber-500',
      outline:
        'border border-border bg-surface text-foreground hover:bg-surface-hover shadow-xs focus-visible:ring-teal-700',
      ghost:
        'bg-transparent text-foreground hover:bg-surface-hover focus-visible:ring-teal-700',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-xs hover:shadow-sm focus-visible:ring-rose-500',
    };

    const sizes = {
      sm: 'h-8 text-xs px-3 gap-1.5',
      md: 'h-10 text-sm px-4 gap-2',
      lg: 'h-12 text-base px-5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
