'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { toast } from '@/presentation/stores/toast.store';
import { TextField } from '@/presentation/components/auth/TextField';
import { OtpInput } from '@/presentation/components/auth/OtpInput';
import { SubmitButton, type SubmitStatus } from '@/presentation/components/auth/SubmitButton';
import { FormErrorSummary } from '@/presentation/components/auth/FormErrorSummary';
import { resolveAuthErrorKey } from '@/presentation/validation/auth-errors';
import { emailSchema } from '@/presentation/validation/auth.validation';
import { ArrowLeft, ArrowRight, Mail, MailCheck, RotateCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { user, verifyEmail, resendVerifyEmail, clearError } = useAuthStore();

  const [initialEmail, setInitialEmail] = useState(user?.email || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    const paramEmail = new URLSearchParams(window.location.search).get('email');
    if (paramEmail) {
      setInitialEmail(paramEmail);
      setEmail(paramEmail);
    }
  }, []);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [cooldown, setCooldown] = useState(0);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; otp?: string }>({});

  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!email && user?.email) setEmail(user.email);
  }, [email, user?.email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const applyStoreError = (fallbackKey: string) => {
    const st = useAuthStore.getState();
    const mapped = resolveAuthErrorKey(st.errorCode);
    const network = st.errorCode === 'ERR_NETWORK';
    setIsNetworkError(network);

    if (st.errorStatus === 429 || st.errorCode?.includes('RATE_LIMIT')) {
      setCooldown(st.retryAfterSeconds && st.retryAfterSeconds > 0 ? st.retryAfterSeconds : 60);
    }

    const msgKey = mapped
      ? mapped
      : st.errorStatus === 503
        ? 'errors.serviceUnavailable'
        : st.errorStatus === 429
          ? 'errors.tooManyRequests'
          : network
            ? 'errors.networkError'
            : fallbackKey;

    setSummaryError(t(msgKey));
    requestAnimationFrame(() => errorSummaryRef.current?.focus());
  };

  const performVerify = async () => {
    setSummaryError(null);
    setIsNetworkError(false);
    clearError();

    const parsedEmail = emailSchema.safeParse(email);
    const otpValid = /^\d{6}$/.test(otp.trim());

    if (!parsedEmail.success || !otpValid) {
      setFieldErrors({
        email: parsedEmail.success ? undefined : t(parsedEmail.error.issues[0].message),
        otp: otpValid ? undefined : t('errors.otpRequired'),
      });
      return;
    }

    setFieldErrors({});
    setStatus('loading');
    const ok = await verifyEmail(parsedEmail.data, otp.trim());

    if (ok) {
      setStatus('success');
      toast.success(t('verifyEmailSuccess'));
      setTimeout(() => router.push('/login'), 260);
      return;
    }

    setStatus('idle');
    applyStoreError('errors.otpInvalid');
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setSummaryError(null);
    setIsNetworkError(false);
    clearError();

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setFieldErrors({ email: t(parsedEmail.error.issues[0].message) });
      return;
    }

    const ok = await resendVerifyEmail(parsedEmail.data);
    if (ok) {
      setCooldown(60);
      toast.info(t('otpSentSuccess'));
    } else {
      applyStoreError('errors.serviceUnavailable');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 auth-stagger" style={{ '--stagger': 0 } as React.CSSProperties}>
        <div className="auth-envelope w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950 border border-primary/20 dark:border-primary-400/30 flex items-center justify-center text-primary dark:text-primary-300">
          <MailCheck className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('verifyEmailTitle')}</h1>
        <p className="text-sm text-foreground-muted">
          {t('verifyEmailSubtitle', { email: email || t('emailPlaceholder') })}
        </p>
      </div>

      <FormErrorSummary
        ref={errorSummaryRef}
        message={summaryError}
        countdownSeconds={cooldown > 0 ? cooldown : null}
        isNetworkError={isNetworkError}
        onRetry={performVerify}
      />

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          performVerify();
        }}
        noValidate
      >
        {!initialEmail && (
          <TextField
            id="verify-email-address"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            label={t('email')}
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
            }}
            error={fieldErrors.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />
        )}

        <OtpInput
          label={t('otpLabel')}
          value={otp}
          onChange={(val) => {
            setOtp(val);
            if (fieldErrors.otp) setFieldErrors((p) => ({ ...p, otp: undefined }));
          }}
          error={fieldErrors.otp}
          staggerIndex={1}
        />

        <SubmitButton
          status={status}
          idleLabel={t('verifyEmailBtn')}
          loadingLabel={t('verifyEmailLoading')}
          idleIcon={<ArrowRight className="w-4 h-4" />}
          staggerIndex={2}
        />
      </form>

      <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
        <span>{t('noCodeReceived')}</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-2 -mr-2 rounded-md text-primary dark:text-primary-400 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{cooldown > 0 ? t('resendOtpCooldown', { seconds: cooldown }) : t('resendOtp')}</span>
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-2 text-xs font-semibold text-primary dark:text-primary-400 hover:underline rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('backToLogin')}</span>
        </Link>
      </div>
    </div>
  );
}
