'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { toast } from '@/presentation/stores/toast.store';
import type { SubmitStatus } from '@/presentation/components/auth/SubmitButton';
import { ForgotStepOne } from '@/presentation/components/auth/ForgotStepOne';
import { ForgotStepTwo } from '@/presentation/components/auth/ForgotStepTwo';
import { resolveAuthErrorKey } from '@/presentation/validation/auth-errors';
import {
  createResetPasswordSchema,
  forgotPasswordStep1Schema,
} from '@/presentation/validation/auth.validation';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { forgotPassword, resetPassword, clearError } = useAuthStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [cooldown, setCooldown] = useState(0);
  const [stepStatus, setStepStatus] = useState<SubmitStatus>('idle');
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const applyStoreError = () => {
    const st = useAuthStore.getState();
    const mapped = resolveAuthErrorKey(st.errorCode);
    const network = st.errorCode === 'ERR_NETWORK';
    setIsNetworkError(network);

    if (st.errorStatus === 429 || st.errorCode?.includes('RATE_LIMIT')) {
      setCooldown(st.retryAfterSeconds && st.retryAfterSeconds > 0 ? st.retryAfterSeconds : 60);
    }

    const fallbackKey =
      st.errorStatus === 503
        ? 'errors.serviceUnavailable'
        : st.errorStatus === 429
          ? 'errors.tooManyRequests'
          : network
            ? 'errors.networkError'
            : 'errors.otpInvalid';

    const msg = mapped ? t(mapped) : t(fallbackKey);
    if (
      st.errorCode === 'ERR_AUTH_INVALID_OTP' ||
      st.errorCode === 'ERR_AUTH_OTP_EXPIRED' ||
      st.errorCode === 'ERR_AUTH_OTP_LOCKED'
    ) {
      setFieldErrors((p) => ({ ...p, otp: msg }));
    } else if (st.errorCode === 'ERR_AUTH_OLD_PASSWORD_REUSE' || st.errorCode?.startsWith('ERR_AUTH_PASSWORD')) {
      setFieldErrors((p) => ({ ...p, newPassword: msg }));
    }

    setSummaryError(msg);
    requestAnimationFrame(() => errorSummaryRef.current?.focus());
  };

  const sendOtpRequest = async () => {
    if (cooldown > 0) return;
    setSummaryError(null);
    setIsNetworkError(false);
    clearError();

    const parsed = forgotPasswordStep1Schema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors({ email: t(parsed.error.issues[0].message) });
      emailRef.current?.focus();
      return;
    }

    setEmail(parsed.data.email);
    setFieldErrors({});
    setStepStatus('loading');

    const ok = await forgotPassword(parsed.data.email);
    setStepStatus('idle');

    if (ok) {
      if (step === 2) {
        toast.info(t('otpSentSuccess'));
      }
      setCooldown(60);
      setSlideDir('right');
      setStep(2);
    } else {
      applyStoreError();
    }
  };

  const submitResetPassword = async () => {
    setSummaryError(null);
    setIsNetworkError(false);
    clearError();

    const parsed = createResetPasswordSchema(email).safeParse({
      otp,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const nextErr: { otp?: string; newPassword?: string; confirmPassword?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'otp' | 'newPassword' | 'confirmPassword';
        if (!nextErr[key]) nextErr[key] = t(issue.message);
      }
      setFieldErrors(nextErr);
      if (nextErr.newPassword && !nextErr.otp) passwordRef.current?.focus();
      else if (nextErr.confirmPassword && !nextErr.otp && !nextErr.newPassword) {
        confirmRef.current?.focus();
      }
      return;
    }

    setFieldErrors({});
    setStepStatus('loading');
    const ok = await resetPassword(email, parsed.data.otp, parsed.data.newPassword);

    if (ok) {
      setStepStatus('success');
      toast.success(t('passwordResetSuccess'));
      setTimeout(() => router.push('/login'), 260);
      return;
    }

    setStepStatus('idle');
    applyStoreError();
  };

  return (
    <div className="space-y-6">
      {step === 1 ? (
        <ForgotStepOne
          email={email}
          onEmailChange={setEmail}
          emailError={fieldErrors.email}
          onClearEmailError={() => setFieldErrors({})}
          summaryError={summaryError}
          cooldown={cooldown}
          isNetworkError={isNetworkError}
          status={stepStatus}
          slideLeft={slideDir === 'left'}
          emailRef={emailRef}
          errorSummaryRef={errorSummaryRef}
          onSubmit={sendOtpRequest}
        />
      ) : (
        <ForgotStepTwo
          email={email}
          otp={otp}
          onOtpChange={(val) => {
            setOtp(val);
            if (fieldErrors.otp) setFieldErrors((p) => ({ ...p, otp: undefined }));
          }}
          newPassword={newPassword}
          onNewPasswordChange={(val) => {
            setNewPassword(val);
            if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: undefined }));
          }}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={(val) => {
            setConfirmPassword(val);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
            }
          }}
          fieldErrors={fieldErrors}
          summaryError={summaryError}
          cooldown={cooldown}
          isNetworkError={isNetworkError}
          status={stepStatus}
          passwordRef={passwordRef}
          confirmRef={confirmRef}
          errorSummaryRef={errorSummaryRef}
          onEditEmail={() => {
            setSlideDir('left');
            setStep(1);
            setOtp('');
            setSummaryError(null);
            setFieldErrors({});
            clearError();
          }}
          onResendOtp={sendOtpRequest}
          onSubmit={submitResetPassword}
        />
      )}

      <div className="text-center pt-1 border-t border-border">
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
