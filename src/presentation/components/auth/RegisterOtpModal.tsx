'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Mail, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface RegisterOtpModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onConfirm: (enteredOtp: string) => Promise<void>;
  onResend: () => Promise<boolean>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export function RegisterOtpModal({
  isOpen,
  email,
  onClose,
  onConfirm,
  onResend,
  isSubmitting = false,
  errorMessage = null,
}: RegisterOtpModalProps) {
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setCooldown(60);
      setLocalError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setLocalError('Vui lòng nhập đủ 6 chữ số mã xác thực.');
      return;
    }
    await onConfirm(cleanOtp);
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setLocalError(null);
    try {
      const ok = await onResend();
      if (ok) {
        setCooldown(60);
      }
    } finally {
      setIsResending(false);
    }
  };

  const displayError = localError || errorMessage;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Xác thực email đăng ký"
      description="Nhập mã xác thực gồm 6 chữ số đã được gửi tới email của bạn"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs">
          <Mail className="w-5 h-5 text-teal-600 shrink-0" />
          <div className="leading-relaxed">
            Mã OTP đã được gửi đến: <strong className="font-mono text-teal-700 dark:text-teal-300">{email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam).
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-otp-input" className="block text-xs font-semibold text-foreground">
            Mã xác thực (6 chữ số)
          </label>
          <input
            id="register-otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              setLocalError(null);
            }}
            placeholder="000000"
            className="w-full text-center text-2xl font-mono tracking-[0.35em] py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        {displayError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-foreground-muted pt-1">
          <span>Chưa nhận được mã?</span>
          <button
            type="button"
            disabled={cooldown > 0 || isResending || isSubmitting}
            onClick={handleResend}
            className="font-semibold text-primary hover:underline disabled:text-foreground-muted disabled:no-underline disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <RefreshCw className={cn('w-3 h-3', isResending && 'animate-spin')} />
            <span>{cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại mã'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="flex-1"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Quay lại
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1 gap-1.5"
            disabled={otp.trim().length !== 6 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Xác nhận & Tạo tài khoản</span>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
