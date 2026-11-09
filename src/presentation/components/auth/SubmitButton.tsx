'use client';

import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export type SubmitStatus = 'idle' | 'loading' | 'success';

interface SubmitButtonProps {
  status: SubmitStatus;
  idleLabel: string;
  loadingLabel: string;
  successLabel?: string;
  idleIcon?: React.ReactNode;
  disabled?: boolean;
  staggerIndex?: number;
  className?: string;
}

export function SubmitButton({
  status,
  idleLabel,
  loadingLabel,
  successLabel,
  idleIcon,
  disabled = false,
  staggerIndex,
  className = '',
}: SubmitButtonProps) {
  const isBusy = status === 'loading' || status === 'success';

  return (
    <div
      className={staggerIndex !== undefined ? 'auth-stagger' : undefined}
      style={staggerIndex !== undefined ? ({ '--stagger': staggerIndex } as React.CSSProperties) : undefined}
    >
      <button
        type="submit"
        disabled={disabled || isBusy}
        className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer disabled:cursor-not-allowed ${
          status === 'success'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-primary hover:bg-primary-800 text-white shadow-xs disabled:opacity-60'
        } ${className}`}
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{loadingLabel}</span>
          </>
        )}
        {status === 'success' && (
          <>
            <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            <span>{successLabel || idleLabel}</span>
          </>
        )}
        {status === 'idle' && (
          <>
            {idleIcon}
            <span>{idleLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}

