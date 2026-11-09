'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  error?: string | null;
  valid?: boolean;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  desktopAutoFocus?: boolean;
  suggestion?: string | null;
  onApplySuggestion?: (suggestion: string) => void;
  staggerIndex?: number;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    id,
    name,
    label,
    error,
    valid = false,
    leftIcon,
    rightSlot,
    desktopAutoFocus = false,
    suggestion,
    onApplySuggestion,
    staggerIndex,
    className = '',
    ...rest
  },
  forwardedRef
) {
  const tAuth = useTranslations('auth');
  const innerRef = useRef<HTMLInputElement>(null);
  const inputRef = (forwardedRef as React.RefObject<HTMLInputElement>) || innerRef;
  const [shakeKey, setShakeKey] = useState(0);
  const prevErrorRef = useRef<string | null | undefined>(null);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      setShakeKey((k) => k + 1);
    }
    prevErrorRef.current = error;
  }, [error]);

  useEffect(() => {
    if (
      desktopAutoFocus &&
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1024px)').matches
    ) {
      const el = inputRef.current;
      if (el) el.focus();
    }
  }, [desktopAutoFocus, inputRef]);

  const errorId = `${id}-error`;

  return (
    <div
      className={`space-y-1.5 ${staggerIndex !== undefined ? 'auth-stagger' : ''}`}
      style={staggerIndex !== undefined ? ({ '--stagger': staggerIndex } as React.CSSProperties) : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wide text-foreground"
        >
          {label}
        </label>
        {rightSlot}
      </div>

      <div key={shakeKey} className={error ? 'auth-shake' : undefined}>
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 text-foreground-muted flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={inputRef}
            id={id}
            name={name}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={`auth-input w-full min-h-[44px] py-2.5 text-sm rounded-xl border bg-surface text-foreground placeholder:text-foreground-muted/70 transition-[border-color,box-shadow] duration-150 focus:outline-none ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${valid || error ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-red-500 dark:border-red-400 focus:ring-3 focus:ring-red-500/20'
                : 'border-border focus:border-primary focus:ring-3 focus:ring-primary/20'
            } ${className}`}
            {...rest}
          />

          {valid && !error && (
            <span
              className="pointer-events-none absolute right-3 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" className="auth-tick-path" />
              </svg>
            </span>
          )}

          {error && (
            <span
              className="pointer-events-none absolute right-3 text-red-500 dark:text-red-400"
              aria-hidden="true"
            >
              <AlertCircle className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {!error && suggestion && onApplySuggestion && (
        <div className="flex items-center justify-between gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-100">
          <span>{tAuth('emailTypoHint', { suggestion })}</span>
          <button
            type="button"
            onClick={() => onApplySuggestion(suggestion)}
            className="min-h-[44px] inline-flex items-center px-2.5 -my-1.5 rounded-md font-semibold underline hover:text-amber-700 dark:hover:text-amber-200 cursor-pointer whitespace-nowrap"
          >
            {tAuth('applySuggestion')}
          </button>
        </div>
      )}
    </div>
  );
});

