'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { toast } from '@/presentation/stores/toast.store';
import { useAuthStore } from '@/presentation/stores/auth.store';
import Image from 'next/image';

function calculatePasswordStrength(pass: string): { score: number; labelKey: 'passwordWeak' | 'passwordMedium' | 'passwordStrong'; color: string } {
  if (!pass) return { score: 0, labelKey: 'passwordWeak', color: 'bg-stone-200' };
  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 2) return { score: 1, labelKey: 'passwordWeak', color: 'bg-red-500' };
  if (score <= 4) return { score: 2, labelKey: 'passwordMedium', color: 'bg-amber-500' };
  return { score: 3, labelKey: 'passwordStrong', color: 'bg-teal-600' };
}

function ResetPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const { resetPassword, isLoading, error } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError(t('passwordMismatch'));
      return;
    }
    setLocalError('');

    const success = await resetPassword(emailParam, otp, password);
    if (success) {
      toast.success(t('passwordResetSuccess'));
      router.push('/login');
    } else {
      const activeError = useAuthStore.getState().error;
      toast.error(activeError || t('resetPasswordError'));
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl bg-white dark:bg-stone-900 p-8 shadow-xl border border-stone-200/80 dark:border-stone-800">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block mb-2">
          <Image src="/logo.svg" alt="Tổ Ấm" width={130} height={30} />
        </Link>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          {t('resetPasswordTitle')}
        </h1>
        <p className="text-xs text-stone-500">
          {t('resetPasswordSubtitle', { email: emailParam || 'email' })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('otpLabel')}
          required
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          leftIcon={<KeyRound className="w-4 h-4" />}
        />

        <div>
          <Input
            name="newPassword"
            label={t('newPassword')}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            leftIcon={<Lock className="w-4 h-4" />}
          />
          {password.length > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${(strength.score / 3) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-stone-500">
                {t(strength.labelKey)}
              </span>
            </div>
          )}
        </div>

        <Input
          name="confirmPassword"
          label={t('confirmNewPassword')}
          type="password"
          required
          error={localError}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="******"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={isLoading}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          {t('saveNewPasswordBtn')}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-stone-100 dark:border-stone-800">
        <Link
          href="/login"
          className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline"
        >
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Suspense fallback={<div className="text-sm text-stone-500">...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
