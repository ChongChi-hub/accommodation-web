'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PasswordStrengthResult } from '@/presentation/validation/password-strength';

export interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string | null;
  rightSlot?: React.ReactNode;
  showStrength?: boolean;
  strength?: PasswordStrengthResult | null;
  matchState?: 'match' | 'mismatch' | null;
  staggerIndex?: number;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  {
    id,
    name,
    label,
    value,
    error,
    rightSlot,
    showStrength = false,
    strength = null,
    matchState = null,
    staggerIndex,
    className = '',
    onKeyDown,
    onKeyUp,
    ...rest
  },
  forwardedRef
) {
  const tAuth = useTranslations('auth');
  const [visible, setVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const prevErrorRef = useRef<string | null | undefined>(null);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      setShakeKey((k) => k + 1);
    }
    prevErrorRef.current = error;
  }, [error]);

  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const errorId = `${id}-error`;
  const capsId = `${id}-caps`;
  const strengthId = `${id}-strength`;

  const describedByIds = [
    error ? errorId : null,
    capsLockOn ? capsId : null,
    showStrength && value ? strengthId : null,
  ]
    .filter(Boolean)
    .join(' ');

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
          <span className="pointer-events-none absolute left-3.5 text-foreground-muted flex items-center">
            <Lock className="w-4 h-4" />
          </span>

          <input
            ref={forwardedRef}
            id={id}
            name={name}
            type={visible ? 'text' : 'password'}
            value={value}
            aria-invalid={Boolean(error)}
            aria-describedby={describedByIds || undefined}
            onKeyDown={(e) => {
              checkCaps(e);
              onKeyDown?.(e);
            }}
            onKeyUp={(e) => {
              checkCaps(e);
              onKeyUp?.(e);
            }}
            className={`auth-input w-full min-h-[44px] pl-10 pr-12 py-2.5 text-sm rounded-xl border bg-surface text-foreground placeholder:text-foreground-muted/70 transition-[border-color,box-shadow] duration-150 focus:outline-none ${
              error
                ? 'border-red-500 dark:border-red-400 focus:ring-3 focus:ring-red-500/20'
                : 'border-border focus:border-primary focus:ring-3 focus:ring-primary/20'
            } ${className}`}
            {...rest}
          />

          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? tAuth('hidePassword') : tAuth('showPassword')}
            className="absolute right-0.5 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-foreground-muted hover:text-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {capsLockOn && (
        <p id={capsId} className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{tAuth('capsLockWarning')}</span>
        </p>
      )}

      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {!error && matchState === 'match' && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{tAuth('passwordMatchSuccess')}</span>
        </p>
      )}

      {showStrength && strength && (
        <div id={strengthId} className="pt-1 space-y-2">
          {value.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-muted">{tAuth('passwordStrength')}</span>
                <span
                  aria-live="polite"
                  role="status"
                  className="font-semibold text-foreground"
                >
                  {tAuth(strength.labelKey)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.barColor}`}
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          <ul className="grid grid-cols-1 gap-1 text-xs">
            {[
              { ok: strength.checklist.minLength, label: tAuth('checklist.minLength') },
              {
                ok: value.length > 0 ? strength.checklist.within72Bytes : false,
                label: tAuth('checklist.maxBytes', { bytes: strength.byteCount }),
              },
              { ok: strength.checklist.notPersonalOrCommon, label: tAuth('checklist.notPersonal') },
              { ok: strength.checklist.notRepetitive, label: tAuth('checklist.notRepetitive') },
            ].map((item, idx) => (
              <li
                key={idx}
                className={`flex items-center gap-2 transition-colors ${
                  item.ok ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-foreground-muted'
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    item.ok
                      ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-border'
                  }`}
                >
                  {item.ok && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

