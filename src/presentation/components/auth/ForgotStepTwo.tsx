'use client';

import React from 'react';
import { CheckCircle2, Mail, RotateCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { OtpInput } from './OtpInput';
import { PasswordField } from './PasswordField';
import { SubmitButton, type SubmitStatus } from './SubmitButton';
import { FormErrorSummary } from './FormErrorSummary';
import { evaluatePasswordStrength } from '@/presentation/validation/password-strength';

interface ForgotStepTwoProps {
  email: string;
  otp: string;
  onOtpChange: (val: string) => void;
  newPassword: string;
  onNewPasswordChange: (val: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (val: string) => void;
  fieldErrors: { otp?: string; newPassword?: string; confirmPassword?: string };
  summaryError: string | null;
  cooldown: number;
  isNetworkError: boolean;
  status: SubmitStatus;
  passwordRef: React.RefObject<HTMLInputElement | null>;
  confirmRef: React.RefObject<HTMLInputElement | null>;
  errorSummaryRef: React.RefObject<HTMLDivElement | null>;
  onEditEmail: () => void;
  onResendOtp: () => void;
  onSubmit: () => void;
}

export function ForgotStepTwo({
  email,
  otp,
  onOtpChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  fieldErrors,
  summaryError,
  cooldown,
  isNetworkError,
  status,
  passwordRef,
  confirmRef,
  errorSummaryRef,
  onEditEmail,
  onResendOtp,
  onSubmit,
}: ForgotStepTwoProps) {
  const t = useTranslations('auth');
  const strength = evaluatePasswordStrength(newPassword, email);
  const matchState =
    confirmPassword.length > 0 ? (confirmPassword === newPassword ? 'match' : 'mismatch') : null;

  return (
    <div key="step-2" className="space-y-5 auth-step-right">
      <div className="flex items-start gap-3">
        <div className="auth-envelope shrink-0 w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950 border border-primary/20 dark:border-primary-400/30 flex items-center justify-center text-primary dark:text-primary-300">
          <Mail className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{t('forgotStep2Title')}</h1>
          <p className="text-xs text-foreground-muted leading-relaxed">
            {t('forgotStep2Subtitle', { email })}
          </p>
          <button
            type="button"
            onClick={onEditEmail}
            className="min-h-[44px] inline-flex items-center px-2 -ml-2 -my-1.5 rounded-md text-xs font-semibold text-primary dark:text-primary-400 hover:underline cursor-pointer"
          >
            {t('editEmailBtn')}
          </button>
        </div>
      </div>

      <FormErrorSummary
        ref={errorSummaryRef}
        message={summaryError}
        countdownSeconds={cooldown > 0 ? cooldown : null}
        isNetworkError={isNetworkError}
        onRetry={onSubmit}
      />

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        noValidate
      >
        <OtpInput
          label={t('otpLabel')}
          value={otp}
          onChange={onOtpChange}
          error={fieldErrors.otp}
        />

        <PasswordField
          ref={passwordRef}
          id="forgot-new-password"
          name="newPassword"
          autoComplete="new-password"
          label={t('newPassword')}
          placeholder={t('passwordPlaceholder')}
          value={newPassword}
          onChange={(e) => onNewPasswordChange(e.target.value)}
          error={fieldErrors.newPassword}
          showStrength
          strength={strength}
        />

        <PasswordField
          ref={confirmRef}
          id="forgot-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          label={t('confirmNewPassword')}
          placeholder={t('confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          error={fieldErrors.confirmPassword}
          matchState={matchState}
        />

        <SubmitButton
          status={status}
          idleLabel={t('saveNewPasswordBtn')}
          loadingLabel={t('saveNewPasswordLoading')}
          idleIcon={<CheckCircle2 className="w-4 h-4" />}
        />
      </form>

      <div className="flex items-center justify-between text-xs text-foreground-muted pt-1 border-t border-border">
        <span>{t('noCodeReceived')}</span>
        <button
          type="button"
          disabled={cooldown > 0 || status === 'loading'}
          onClick={onResendOtp}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-2 -mr-2 rounded-md font-semibold text-primary dark:text-primary-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{cooldown > 0 ? t('resendOtpCooldown', { seconds: cooldown }) : t('resendOtp')}</span>
        </button>
      </div>
    </div>
  );
}
