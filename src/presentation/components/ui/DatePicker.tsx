'use client';

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            type="date"
            ref={ref}
            className={cn(
              'w-full rounded-xl border bg-white dark:bg-stone-900 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                : 'border-stone-200 dark:border-stone-800 focus:border-teal-600 focus:ring-teal-600',
              className
            )}
            {...props}
          />
          <div className="pointer-events-none absolute right-3 text-stone-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
