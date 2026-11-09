'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { toast } from '@/presentation/stores/toast.store';
import { TextField } from '@/presentation/components/auth/TextField';
import { OtpInput } from '@/presentation/components/auth/OtpInput';
import { PasswordField } from '@/presentation/components/auth/PasswordField';
import { SubmitButton, type SubmitStatus } from '@/presentation/components/auth/SubmitButton';
import { FormErrorSummary } from '@/presentation/components/auth/FormErrorSummary';
import { evaluatePasswordStrength } from '@/presentation/validation/password-strength';
import { resolveAuthErrorKey } from '@/presentation/validation/auth-errors';
import { createResetPasswordSchema, emailSchema } from '@/presentation/validation/auth.validation';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { resetPassword, clearError } = useAuthStore();

  const [initialEmail, setInitialEmail] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const paramEmail = new URLSearchParams(window.location.search).get('email') || '';
    if (paramEmail) {
      setInitialEmail(paramEmail);
      setEmail((prev) => prev || paramEmail);
    }
  }, []);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const strength = evaluatePasswordStrength(newPassword, email);
  const matchState =
    confirmPassword.length > 0 ? (confirmPassword === newPassword ? 'match' : 'mismatch') : null;

  const performSubmit = async () => {
    setSummaryError(null);
    setIsNetworkError(false);
    clearError();

    const parsedEmail = emailSchema.safeParse(email);
    const parsedReset = createResetPasswordSchema(email).safeParse({
      otp,
      newPassword,
      confirmPassword,
    });

    if (!parsedEmail.success || !parsedReset.success) {
      const nextErr: { email?: string; otp?: string; newPassword?: string; confirmPassword?: string } = {};
      if (!parsedEmail.success) nextErr.email = t(parsedEmail.error.issues[0].message);
      if (!parsedReset.success) {
        for (const issue of parsedReset.error.issues) {
          const key = issue.path[0] as 'otp' | 'newPassword' | 'confirmPassword';
          if (!nextErr[key]) nextErr[key] = t(issue.message);
        }
      }
      setFieldErrors(nextErr);
      if (nextErr.newPassword && !nextErr.email && !nextErr.otp) passwordRef.current?.focus();
      else if (nextErr.confirmPassword && !nextErr.email && !nextErr.otp && !nextErr.newPassword) {
        confirmRef.current?.focus();
      }
      return;
    }

    setFieldErrors({});
    setStatus('loading');
    const ok = await resetPassword(parsedEmail.data, parsedReset.data.otp, parsedReset.data.newPassword);

    if (ok) {
      setStatus('success');
      toast.success(t('passwordResetSuccess'));
      setTimeout(() => router.push('/login'), 260);
      return;
    }

    setStatus('idle');
    const st = useAuthStore.getState();
    const mapped = resolveAuthErrorKey(st.errorCode);
    const network = st.errorCode === 'ERR_NETWORK';
    setIsNetworkError(network);
    const msg = mapped ? t(mapped) : t(network ? 'errors.networkError' : 'errors.otpInvalid');
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

  return (
    <div className="space-y-5">
      <div className="space-y-1.5 auth-stagger" style={{ '--stagger': 0 } as React.CSSProperties}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('resetPasswordTitle')}</h1>
        <p className="text-sm text-foreground-muted">
          {t('resetPasswordSubtitle', { email: email || t('emailPlaceholder') })}
        </p>
      </div>

      <FormErrorSummary
        ref={errorSummaryRef}
        message={summaryError}
        isNetworkError={isNetworkError}
        onRetry={performSubmit}
      />

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          performSubmit();
        }}
        noValidate
      >
        {!initialEmail && (
          <TextField
            id="reset-email"
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

        <PasswordField
          ref={passwordRef}
          id="reset-new-password"
          name="newPassword"
          autoComplete="new-password"
          label={t('newPassword')}
          placeholder={t('passwordPlaceholder')}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: undefined }));
          }}
          error={fieldErrors.newPassword}
          showStrength
          strength={strength}
          staggerIndex={2}
        />

        <PasswordField
          ref={confirmRef}
          id="reset-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          label={t('confirmNewPassword')}
          placeholder={t('confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
          }}
          error={fieldErrors.confirmPassword}
          matchState={matchState}
          staggerIndex={3}
        />

        <SubmitButton
          status={status}
          idleLabel={t('saveNewPasswordBtn')}
          loadingLabel={t('saveNewPasswordLoading')}
          idleIcon={<CheckCircle2 className="w-4 h-4" />}
          staggerIndex={4}
        />
      </form>

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
