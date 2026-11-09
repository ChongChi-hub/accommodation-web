'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useAuthPanelContext, type AuthIntendedRole } from '@/presentation/components/auth/AuthPanelContext';
import type { SubmitStatus } from '@/presentation/components/auth/SubmitButton';
import { evaluatePasswordStrength } from '@/presentation/validation/password-strength';
import { resolveAuthErrorKey } from '@/presentation/validation/auth-errors';
import {
  checkEmailTypo,
  createRegisterSchema,
  emailSchema,
  fullNameSchema,
  optionalPhoneSchema,
  validateNewPasswordWithContext,
} from '@/presentation/validation/auth.validation';

export type RegField = 'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword' | 'acceptTerms';

export function useRegisterForm(initialRole: AuthIntendedRole) {
  const t = useTranslations('auth');
  const router = useRouter();
  const { setIntendedRole } = useAuthPanelContext();
  const { register, clearError } = useAuthStore();

  const [role, setRole] = useState<AuthIntendedRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegField, string>>>({});
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIntendedRole(role);
  }, [role, setIntendedRole]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateSingleField = (field: RegField) => {
    let key: string | null = null;
    if (field === 'fullName') {
      const normalized = fullName.trim().replace(/\s+/g, ' ');
      setFullName(normalized);
      const r = fullNameSchema.safeParse(normalized);
      if (!r.success) key = normalized ? r.error.issues[0].message : 'errors.nameRequired';
    } else if (field === 'email') {
      const clean = email.trim().toLowerCase();
      setEmail(clean);
      const r = emailSchema.safeParse(clean);
      if (!r.success) key = r.error.issues[0].message;
    } else if (field === 'phone') {
      const r = optionalPhoneSchema.safeParse(phone.trim());
      if (!r.success) key = r.error.issues[0].message;
    } else if (field === 'password') {
      key = validateNewPasswordWithContext(password, { email, fullName });
    } else if (field === 'confirmPassword' && confirmPassword !== password) {
      key = 'errors.passwordMismatch';
    }
    setFieldErrors((prev) => ({ ...prev, [field]: key ? t(key) : undefined }));
  };

  const performSubmit = async () => {
    if (cooldown > 0) return;
    setSummaryError(null);
    setIsNetworkError(false);
    clearError();

    const parsed = createRegisterSchema().safeParse({
      role,
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      acceptTerms,
    });

    if (!parsed.success) {
      const nextErr: Partial<Record<RegField, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as RegField;
        if (!nextErr[key]) nextErr[key] = t(issue.message);
      }
      setFieldErrors(nextErr);
      const refs: Record<RegField, React.RefObject<HTMLInputElement | null>> = {
        fullName: fullNameRef,
        email: emailRef,
        phone: phoneRef,
        password: passwordRef,
        confirmPassword: confirmRef,
        acceptTerms: termsRef,
      };
      const firstKey = (['fullName', 'email', 'phone', 'password', 'confirmPassword', 'acceptTerms'] as RegField[]).find(
        (k) => nextErr[k]
      );
      if (firstKey) refs[firstKey].current?.focus();
      return;
    }

    setFieldErrors({});
    setStatus('loading');
    const ok = await register({
      role,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      password,
    });

    if (ok) {
      setStatus('success');
      setTimeout(() => {
        router.push(role === 'LANDLORD' ? '/dashboard/landlord/kyc' : '/dashboard/tenant');
      }, 220);
      return;
    }

    setStatus('idle');
    const st = useAuthStore.getState();
    const mappedKey = resolveAuthErrorKey(st.errorCode);
    const network = st.errorCode === 'ERR_NETWORK';
    setIsNetworkError(network);

    if (st.errorStatus === 429) {
      setCooldown(st.retryAfterSeconds && st.retryAfterSeconds > 0 ? st.retryAfterSeconds : 60);
    }

    const msg = mappedKey
      ? t(mappedKey)
      : t(st.errorStatus === 429 ? 'errors.tooManyRequests' : network ? 'errors.networkError' : 'errors.emailExists');

    if (st.errorCode === 'ERR_AUTH_EMAIL_EXISTS') setFieldErrors((p) => ({ ...p, email: msg }));
    if (st.errorCode === 'ERR_AUTH_PHONE_EXISTS') setFieldErrors((p) => ({ ...p, phone: msg }));
    if (st.errorCode?.startsWith('ERR_AUTH_PASSWORD')) setFieldErrors((p) => ({ ...p, password: msg }));

    setSummaryError(msg);
    requestAnimationFrame(() => errorSummaryRef.current?.focus());
  };

  return {
    t,
    role,
    setRole,
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    acceptTerms,
    setAcceptTerms,
    fieldErrors,
    setFieldErrors,
    summaryError,
    isNetworkError,
    cooldown,
    status,
    strength: evaluatePasswordStrength(password, email, fullName),
    emailSuggestion: !fieldErrors.email ? checkEmailTypo(email) : null,
    fullNameValid: fullName.trim().length >= 2 && fullNameSchema.safeParse(fullName).success,
    emailValid: email.trim().length > 0 && emailSchema.safeParse(email).success,
    phoneValid: phone.trim().length > 0 && optionalPhoneSchema.safeParse(phone).success,
    matchState: (confirmPassword.length > 0 ? (confirmPassword === password ? 'match' : 'mismatch') : null) as
      | 'match'
      | 'mismatch'
      | null,
    refs: { fullNameRef, emailRef, phoneRef, passwordRef, confirmRef, termsRef, errorSummaryRef },
    validateSingleField,
    performSubmit,
  };
}
