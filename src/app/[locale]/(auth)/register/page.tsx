'use client';

import React, { useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { RoleCard } from '@/presentation/components/auth/RoleCard';
import { TextField } from '@/presentation/components/auth/TextField';
import { PasswordField } from '@/presentation/components/auth/PasswordField';
import { SubmitButton } from '@/presentation/components/auth/SubmitButton';
import { FormErrorSummary } from '@/presentation/components/auth/FormErrorSummary';
import { GoogleLoginButton } from '@/presentation/components/auth/GoogleLoginButton';
import { useRegisterForm } from '@/presentation/hooks/useRegisterForm';
import { Mail, Phone, User, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const f = useRegisterForm('TENANT');
  const { setRole, t, refs } = f;

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('role')?.toUpperCase() === 'LANDLORD') {
      setRole('LANDLORD');
    }
  }, [setRole]);

  return (
    <div className="space-y-5">
      <div className="space-y-1.5 auth-stagger" style={{ '--stagger': 0 } as React.CSSProperties}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('registerTitle')}</h1>
        <p className="text-sm text-foreground-muted">{t('registerSubtitle')}</p>
      </div>

      <FormErrorSummary
        ref={refs.errorSummaryRef}
        message={f.summaryError}
        countdownSeconds={f.cooldown > 0 ? f.cooldown : null}
        isNetworkError={f.isNetworkError}
        onRetry={f.performSubmit}
      />

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          f.performSubmit();
        }}
        noValidate
      >
        <RoleCard value={f.role} onChange={f.setRole} staggerIndex={1} />

        <TextField
          ref={refs.fullNameRef}
          id="register-fullname"
          name="fullName"
          type="text"
          autoComplete="name"
          label={t('fullName')}
          placeholder={t('fullNamePlaceholder')}
          value={f.fullName}
          onChange={(e) => {
            f.setFullName(e.target.value);
            if (f.fieldErrors.fullName) f.setFieldErrors((p) => ({ ...p, fullName: undefined }));
          }}
          onBlur={() => f.validateSingleField('fullName')}
          error={f.fieldErrors.fullName}
          valid={f.fullNameValid && !f.fieldErrors.fullName}
          leftIcon={<User className="w-4 h-4" />}
          desktopAutoFocus
          staggerIndex={2}
        />

        <TextField
          ref={refs.emailRef}
          id="register-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          label={t('email')}
          placeholder={t('emailPlaceholder')}
          value={f.email}
          onChange={(e) => {
            f.setEmail(e.target.value);
            if (f.fieldErrors.email) f.setFieldErrors((p) => ({ ...p, email: undefined }));
          }}
          onBlur={() => f.validateSingleField('email')}
          error={f.fieldErrors.email}
          valid={f.emailValid && !f.fieldErrors.email}
          suggestion={f.emailSuggestion}
          onApplySuggestion={(fixed) => {
            f.setEmail(fixed);
            f.setFieldErrors((p) => ({ ...p, email: undefined }));
          }}
          leftIcon={<Mail className="w-4 h-4" />}
          staggerIndex={3}
        />

        <TextField
          ref={refs.phoneRef}
          id="register-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          label={t('phoneOptional')}
          placeholder={t('phonePlaceholder')}
          value={f.phone}
          onChange={(e) => {
            f.setPhone(e.target.value);
            if (f.fieldErrors.phone) f.setFieldErrors((p) => ({ ...p, phone: undefined }));
          }}
          onBlur={() => f.validateSingleField('phone')}
          error={f.fieldErrors.phone}
          valid={f.phoneValid && !f.fieldErrors.phone}
          leftIcon={<Phone className="w-4 h-4" />}
          staggerIndex={4}
        />

        <PasswordField
          ref={refs.passwordRef}
          id="register-password"
          name="password"
          autoComplete="new-password"
          label={t('password')}
          placeholder={t('passwordPlaceholder')}
          value={f.password}
          onChange={(e) => {
            f.setPassword(e.target.value);
            if (f.fieldErrors.password) f.setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          onBlur={() => f.validateSingleField('password')}
          error={f.fieldErrors.password}
          showStrength
          strength={f.strength}
          staggerIndex={5}
        />

        <PasswordField
          ref={refs.confirmRef}
          id="register-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          label={t('confirmPassword')}
          placeholder={t('confirmPasswordPlaceholder')}
          value={f.confirmPassword}
          onChange={(e) => {
            f.setConfirmPassword(e.target.value);
            if (f.fieldErrors.confirmPassword) {
              f.setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
            }
          }}
          onBlur={() => f.validateSingleField('confirmPassword')}
          error={f.fieldErrors.confirmPassword}
          matchState={f.matchState}
          staggerIndex={6}
        />

        <div className="space-y-1.5 auth-stagger" style={{ '--stagger': 7 } as React.CSSProperties}>
          <label
            htmlFor="register-terms"
            className="flex items-start gap-2.5 min-h-[44px] py-1.5 cursor-pointer select-none text-xs text-foreground-muted leading-relaxed"
          >
            <input
              ref={refs.termsRef}
              id="register-terms"
              name="acceptTerms"
              type="checkbox"
              checked={f.acceptTerms}
              onChange={(e) => {
                f.setAcceptTerms(e.target.checked);
                if (f.fieldErrors.acceptTerms) {
                  f.setFieldErrors((p) => ({ ...p, acceptTerms: undefined }));
                }
              }}
              aria-invalid={Boolean(f.fieldErrors.acceptTerms)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer shrink-0"
            />
            <span>
              {t('acceptTermsPrefix')}{' '}
              <Link href="/terms" className="font-semibold text-primary dark:text-primary-400 hover:underline">
                {t('termsLink')}
              </Link>{' '}
              {t('acceptTermsAnd')}{' '}
              <Link href="/privacy" className="font-semibold text-primary dark:text-primary-400 hover:underline">
                {t('privacyLink')}
              </Link>
            </span>
          </label>
          {f.fieldErrors.acceptTerms && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {f.fieldErrors.acceptTerms}
            </p>
          )}
        </div>

        <SubmitButton
          status={f.status}
          idleLabel={t('registerBtn')}
          loadingLabel={t('registerBtnLoading')}
          successLabel={t('registerBtnSuccess')}
          idleIcon={<UserPlus className="w-4 h-4" />}
          disabled={f.cooldown > 0}
          staggerIndex={8}
        />

        <div className="relative py-1.5">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wider">
            <span className="bg-background px-3 text-foreground-muted">{t('or')}</span>
          </div>
        </div>

        <GoogleLoginButton label={t('googleRegister')} isRegister intendedRole={f.role} />
      </form>

      <p className="text-center text-xs text-foreground-muted">
        <span>{t('haveAccount')} </span>
        <Link href="/login" className="inline-flex items-center min-h-[44px] -my-2.5 px-1 font-semibold text-primary dark:text-primary-400 hover:underline rounded">
          {t('loginBtn')}
        </Link>
      </p>
    </div>
  );
}
