'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

export interface OtpInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  staggerIndex?: number;
}

export function OtpInput({
  id = 'otp-input',
  label,
  value,
  onChange,
  error,
  disabled = false,
  staggerIndex,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const prevErrorRef = useRef<string | null | undefined>(null);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      setShakeKey((k) => k + 1);
    }
    prevErrorRef.current = error;
  }, [error]);

  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const setDigitAt = (index: number, char: string) => {
    const next = [...digits];
    next[index] = char;
    onChange(next.join('').slice(0, 6));
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '');
    if (!clean) {
      setDigitAt(index, '');
      return;
    }

    // Handle multi-character input (e.g. mobile SMS OS autofill)
    if (clean.length > 1) {
      const merged = clean.slice(0, 6);
      onChange(merged);
      const focusIdx = Math.min(merged.length - 1, 5);
      inputsRef.current[focusIdx]?.focus();
      return;
    }

    setDigitAt(index, clean);
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        setDigitAt(index - 1, '');
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      inputsRef.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      inputsRef.current[5]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    const targetIdx = Math.min(pasted.length - 1, 5);
    inputsRef.current[targetIdx]?.focus();
  };

  const errorId = `${id}-error`;
  const labelId = `${id}-label`;

  return (
    <div
      className={`space-y-2 ${staggerIndex !== undefined ? 'auth-stagger' : ''}`}
      style={staggerIndex !== undefined ? ({ '--stagger': staggerIndex } as React.CSSProperties) : undefined}
    >
      <span id={labelId} className="block text-xs font-semibold uppercase tracking-wide text-foreground">
        {label}
      </span>

      <div
        key={shakeKey}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        className={`flex items-center justify-between gap-2 ${error ? 'auth-shake' : ''}`}
      >
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            id={idx === 0 ? id : `${id}-${idx}`}
            name={idx === 0 ? 'otp' : undefined}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={idx === 0 ? 6 : 1}
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            aria-label={`${label} ${idx + 1}/6`}
            aria-invalid={Boolean(error)}
            disabled={disabled}
            value={digit}
            onChange={(e) => handleChange(idx, e)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold font-mono rounded-xl border bg-surface text-foreground transition-[border-color,box-shadow] duration-150 focus:outline-none ${
              digit ? 'auth-otp-filled' : ''
            } ${
              error
                ? 'border-red-500 dark:border-red-400 focus:ring-3 focus:ring-red-500/20'
                : digit
                  ? 'border-primary/70 focus:border-primary focus:ring-3 focus:ring-primary/20'
                  : 'border-border focus:border-primary focus:ring-3 focus:ring-primary/20'
            }`}
          />
        ))}
      </div>

      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

