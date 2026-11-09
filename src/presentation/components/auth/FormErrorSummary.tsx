'use client';

import React, { forwardRef } from 'react';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FormErrorSummaryProps {
  message: string | null;
  countdownSeconds?: number | null;
  isNetworkError?: boolean;
  onRetry?: () => void;
}

export const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(
  function FormErrorSummary({ message, countdownSeconds, isNetworkError, onRetry }, ref) {
    const tAuth = useTranslations('auth');

    if (!message) return null;

    return (
      <div
        ref={ref}
        tabIndex={-1}
        role="alert"
        aria-live="assertive"
        className="auth-shake flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-xs text-red-800 dark:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/40"
      >
        <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" aria-hidden="true" />
        <div className="flex-1 space-y-1.5">
          <p className="font-semibold leading-snug">{message}</p>

          {typeof countdownSeconds === 'number' && countdownSeconds > 0 && (
            <p className="inline-flex items-center gap-1.5 font-medium text-red-700 dark:text-red-300">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tAuth('countdownLockNote', { seconds: countdownSeconds })}</span>
            </p>
          )}

          {isNetworkError && onRetry && (
            <div>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-2 -ml-2 -my-1.5 rounded-md font-semibold underline hover:text-red-900 dark:hover:text-red-100 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tAuth('retryAction')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

