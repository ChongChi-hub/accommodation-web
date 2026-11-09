'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { TextField } from '@/presentation/components/auth/TextField';
import { PasswordField } from '@/presentation/components/auth/PasswordField';
import { SubmitButton, type SubmitStatus } from '@/presentation/components/auth/SubmitButton';
import { FormErrorSummary } from '@/presentation/components/auth/FormErrorSummary';
import { GoogleLoginButton } from '@/presentation/components/auth/GoogleLoginButton';
import { EMAIL_REGEX, VN_PHONE_REGEX, loginSchema } from '@/presentation/validation/auth.validation';
import {
  getSafeRedirectUrl,
  resolveAuthErrorKey,
  resolveReturnUrlReasonKey,
} from '@/presentation/validation/auth-errors';
import { Info, LogIn, User } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login, clearError } = useAuthStore();

  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setReturnUrl(sp.get('returnUrl') || sp.get('redirect'));
    setAction(sp.get('action'));
    setRoomId(sp.get('roomId'));
  }, []);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const reasonKey = resolveReturnUrlReasonKey(returnUrl);
  const trimmedId = identifier.trim();
  const isIdentifierValid = EMAIL_REGEX.test(trimmedId) || VN_PHONE_REGEX.test(trimmedId);

  const performSubmit = async () => {
    if (cooldown > 0) return;
    setSummaryError(null);
    setIsNetworkError(false);
    clearError();

    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      const nextErr: { identifier?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'identifier' | 'password';
        if (!nextErr[key]) nextErr[key] = t(issue.message);
      }
      setFieldErrors(nextErr);
      if (nextErr.identifier) identifierRef.current?.focus();
      else if (nextErr.password) passwordRef.current?.focus();
      return;
    }

    setFieldErrors({});
    setStatus('loading');
    const ok = await login(trimmedId, password);

    if (ok) {
      setStatus('success');
      if (action === 'bookmark' && roomId) {
        try {
          await container.bookmark.bookmarkRepository.addBookmark(Number(roomId));
        } catch {
          // Bookmark error should not block login redirect
        }
      }
      const roles = useAuthStore.getState().user?.roles || [];
      const safeTarget = getSafeRedirectUrl(returnUrl, roles);
      setTimeout(() => {
        if (safeTarget) router.push(safeTarget as any);
        else if (roles.includes('ADMIN')) router.push('/dashboard/admin');
        else if (roles.includes('MODERATOR')) router.push('/dashboard/moderator');
        else if (roles.includes('LANDLORD')) router.push('/dashboard/landlord');
        else router.push('/dashboard/tenant');
      }, 220);
      return;
    }

    setStatus('idle');
    const st = useAuthStore.getState();
    const mappedKey = resolveAuthErrorKey(st.errorCode);
    const network = st.errorCode === 'ERR_NETWORK';
    setIsNetworkError(network);

    if (st.errorStatus === 429 || st.errorCode === 'ERR_AUTH_TEMPORARY_LOCKED') {
      setCooldown(st.retryAfterSeconds && st.retryAfterSeconds > 0 ? st.retryAfterSeconds : 60);
    }

    const fallbackKey =
      st.errorStatus === 429
        ? 'errors.tooManyRequests'
        : st.errorStatus === 503
          ? 'errors.serviceUnavailable'
          : network
            ? 'errors.networkError'
            : 'errors.badCredentials';

    setSummaryError(mappedKey ? t(mappedKey) : t(fallbackKey));
    requestAnimationFrame(() => errorSummaryRef.current?.focus());
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 auth-stagger" style={{ '--stagger': 0 } as React.CSSProperties}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('loginTitle')}</h1>
        <p className="text-sm text-foreground-muted">{t('loginSubtitle')}</p>
      </div>

      {reasonKey && (
        <div
          className="auth-stagger flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-primary-50/80 dark:bg-primary-950 border border-primary/25 dark:border-primary-400/30 text-xs font-medium text-primary-900 dark:text-primary-100"
          style={{ '--stagger': 1 } as React.CSSProperties}
        >
          <Info className="w-4 h-4 shrink-0 text-primary dark:text-primary-300" aria-hidden="true" />
          <span>{t(reasonKey)}</span>
        </div>
      )}

      <FormErrorSummary
        ref={errorSummaryRef}
        message={summaryError}
        countdownSeconds={cooldown > 0 ? cooldown : null}
        isNetworkError={isNetworkError}
        onRetry={performSubmit}
      />

      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); performSubmit(); }} noValidate>
        <TextField
          ref={identifierRef}
          id="login-identifier"
          name="identifier"
          type="text"
          inputMode="text"
          autoComplete="username"
          label={t('identifier')}
          placeholder={t('identifierPlaceholder')}
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (fieldErrors.identifier) setFieldErrors((p) => ({ ...p, identifier: undefined }));
          }}
          error={fieldErrors.identifier}
          valid={isIdentifierValid && !fieldErrors.identifier}
          leftIcon={<User className="w-4 h-4" />}
          desktopAutoFocus
          staggerIndex={2}
        />

        <PasswordField
          ref={passwordRef}
          id="login-password"
          name="password"
          autoComplete="current-password"
          label={t('password')}
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          error={fieldErrors.password}
          staggerIndex={3}
          rightSlot={
            <Link
              href="/forgot-password"
              className="inline-flex items-center min-h-[44px] -my-2.5 px-1 text-xs font-semibold text-primary dark:text-primary-400 hover:underline focus-visible:outline-2 focus-visible:outline-primary rounded"
            >
              {t('forgotPassword')}
            </Link>
          }
        />

        <SubmitButton
          status={status}
          idleLabel={t('loginBtn')}
          loadingLabel={t('loginBtnLoading')}
          successLabel={t('loginBtnSuccess')}
          idleIcon={<LogIn className="w-4 h-4" />}
          disabled={cooldown > 0}
          staggerIndex={4}
        />

        <div className="relative py-2 auth-stagger" style={{ '--stagger': 5 } as React.CSSProperties}>
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wider">
            <span className="bg-background px-3 text-foreground-muted">{t('or')}</span>
          </div>
        </div>

        <div className="auth-stagger" style={{ '--stagger': 6 } as React.CSSProperties}>
          <GoogleLoginButton label={t('googleLogin')} returnUrl={returnUrl || undefined} />
        </div>
      </form>

      <p
        className="text-center text-xs text-foreground-muted auth-stagger"
        style={{ '--stagger': 7 } as React.CSSProperties}
      >
        <span>{t('noAccount')} </span>
        <Link href="/register" className="inline-flex items-center min-h-[44px] -my-2.5 px-1 font-semibold text-primary dark:text-primary-400 hover:underline rounded">
          {t('registerBtn')}
        </Link>
      </p>
    </div>
  );
}
