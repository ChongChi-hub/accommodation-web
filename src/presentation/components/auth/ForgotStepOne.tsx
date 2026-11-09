'use client';

import React from 'react';
import { Mail, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TextField } from './TextField';
import { SubmitButton, type SubmitStatus } from './SubmitButton';
import { FormErrorSummary } from './FormErrorSummary';
import { checkEmailTypo, emailSchema } from '@/presentation/validation/auth.validation';

interface ForgotStepOneProps {
  email: string;
  onEmailChange: (val: string) => void;
  emailError?: string;
  onClearEmailError: () => void;
  summaryError: string | null;
  cooldown: number;
  isNetworkError: boolean;
  status: SubmitStatus;
  slideLeft: boolean;
  emailRef: React.RefObject<HTMLInputElement | null>;
  errorSummaryRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: () => void;
}

export function ForgotStepOne({
  email,
  onEmailChange,
  emailError,
  onClearEmailError,
  summaryError,
  cooldown,
  isNetworkError,
  status,
  slideLeft,
  emailRef,
  errorSummaryRef,
  onSubmit,
}: ForgotStepOneProps) {
  const t = useTranslations('auth');
  const emailSuggestion = !emailError ? checkEmailTypo(email) : null;
  const emailValid = email.trim().length > 0 && emailSchema.safeParse(email).success && !emailError;

  return (
    <div
      key="step-1"
      className={`space-y-6 ${slideLeft ? 'auth-step-left' : 'auth-stagger'}`}
      style={{ '--stagger': 0 } as React.CSSProperties}
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('forgotPasswordTitle')}</h1>
        <p className="text-sm text-foreground-muted">{t('forgotPasswordSubtitle')}</p>
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
        <TextField
          ref={emailRef}
          id="forgot-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          label={t('email')}
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => {
            onEmailChange(e.target.value);
            if (emailError) onClearEmailError();
          }}
          error={emailError}
          valid={emailValid}
          suggestion={emailSuggestion}
          onApplySuggestion={(fixed) => {
            onEmailChange(fixed);
            onClearEmailError();
          }}
          leftIcon={<Mail className="w-4 h-4" />}
          desktopAutoFocus
        />

        <SubmitButton
          status={status}
          idleLabel={cooldown > 0 ? t('resendOtpCooldown', { seconds: cooldown }) : t('sendOtpBtn')}
          loadingLabel={t('sendOtpBtnLoading')}
          idleIcon={<Send className="w-4 h-4" />}
          disabled={cooldown > 0}
        />
      </form>
    </div>
  );
}

