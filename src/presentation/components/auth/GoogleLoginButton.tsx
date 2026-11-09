'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Script from 'next/script';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { toast } from '@/presentation/stores/toast.store';
import { resolveAuthErrorKey } from '@/presentation/validation/auth-errors';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (c: any) => void;
          renderButton: (p: HTMLElement, o: any) => void;
          prompt: (n?: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleLoginButtonProps {
  label?: string;
  intendedRole?: 'TENANT' | 'LANDLORD';
  isRegister?: boolean;
  returnUrl?: string;
}

export function GoogleLoginButton({
  label,
  intendedRole = 'TENANT',
  isRegister = false,
  returnUrl,
}: GoogleLoginButtonProps) {
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const currentNonceRef = useRef<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const intendedRoleRef = useRef<'TENANT' | 'LANDLORD'>(intendedRole);

  useEffect(() => {
    intendedRoleRef.current = intendedRole;
  }, [intendedRole]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const sync = () => setIsDarkTheme(document.documentElement.classList.contains('dark'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const isFlagEnabled = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === 'true';
  const isPlaceholder =
    !clientId || clientId.includes('placeholder') || clientId.includes('your-google-client-id');

  useEffect(() => {
    let mounted = true;
    async function checkStatus() {
      if (!isFlagEnabled || isPlaceholder) {
        if (mounted) setIsConfigured(false);
        return;
      }
      try {
        const status = await container.auth.googleAuthUseCase.getStatus();
        if (mounted) setIsConfigured(Boolean(status.enabled));
      } catch {
        if (mounted) setIsConfigured(false);
      }
    }
    checkStatus();
    return () => {
      mounted = false;
    };
  }, [isFlagEnabled, isPlaceholder]);

  const handleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      if (isSubmittingRef.current) return;
      const credential = response?.credential;
      const nonce = currentNonceRef.current;

      if (!credential || !nonce) {
        toast.error(tAuth('errors.invalidNonce'));
        return;
      }

      isSubmittingRef.current = true;
      setIsLoading(true);
      const selectedRole = isRegister ? intendedRoleRef.current : undefined;

      try {
        const result = await useAuthStore
          .getState()
          .loginWithGoogle(credential, nonce, selectedRole);

        if (result.success) {
          const userRoles = result.user?.roles || [];
          const hasLandlord = userRoles.includes('LANDLORD');

          if (result.isNewUser) {
            toast.success(tAuth('google.newCreated'));
          } else {
            const msg = tAuth('google.existingSignedIn');
            if (isRegister && intendedRoleRef.current === 'LANDLORD' && !hasLandlord) {
              toast.info(`${msg}. ${tAuth('google.becomeLandlordHint')}`);
            } else {
              toast.success(msg);
            }
          }

          const target =
            returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
              ? returnUrl
              : hasLandlord
                ? '/dashboard/landlord'
                : userRoles.includes('ADMIN')
                  ? '/dashboard/admin'
                  : userRoles.includes('MODERATOR')
                    ? '/dashboard/moderator'
                    : isRegister && intendedRoleRef.current === 'LANDLORD'
                      ? '/dashboard/landlord/kyc'
                      : '/dashboard/tenant';
          router.push(target as any);
        }
      } catch (err: any) {
        const mappedKey = resolveAuthErrorKey(err?.errorCode);
        toast.error(mappedKey ? tAuth(mappedKey) : tAuth('errors.networkError'));
      } finally {
        setIsLoading(false);
        isSubmittingRef.current = false;
      }
    },
    [isRegister, returnUrl, router, tAuth]
  );

  const initGis = useCallback(async () => {
    if (!window.google?.accounts?.id || !clientId || isSubmittingRef.current) return;
    try {
      const nonceRes = await container.auth.googleAuthUseCase.getNonce();
      currentNonceRef.current = nonceRes.nonce;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res: { credential?: string }) => handleCredentialResponse(res),
        nonce: nonceRes.nonce,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonContainerRef.current) {
        const hostWidth = buttonContainerRef.current.parentElement?.clientWidth || 400;
        const targetWidth = Math.min(Math.max(hostWidth, 240), 400);
        buttonContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          type: 'standard',
          theme: isDarkTheme ? 'filled_black' : 'outline',
          size: 'large',
          text: isRegister ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: targetWidth,
          locale: locale === 'en' ? 'en' : 'vi',
        });
      }
    } catch {
      // Ignore background init error
    }
  }, [clientId, handleCredentialResponse, isDarkTheme, isRegister, locale]);

  useEffect(() => {
    if (gisLoaded && isConfigured) {
      initGis();
    }
  }, [gisLoaded, isConfigured, initGis]);

  if (isConfigured === false) return null;

  const displayLabel = label || (isRegister ? tAuth('googleRegister') : tAuth('googleLogin'));
  const roleRuleNote = !isRegister
    ? tAuth('google.ruleLogin')
    : intendedRole === 'LANDLORD'
      ? tAuth('google.ruleRegisterLandlord')
      : tAuth('google.ruleRegisterTenant');

  return (
    <div className="w-full space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGisLoaded(true)}
      />

      {/* Strict 44px reserved container prevents CLS during GIS script loading */}
      <div className="relative w-full h-[44px] flex items-center justify-center">
        <div
          ref={buttonContainerRef}
          className={`w-full h-[44px] flex items-center justify-center overflow-hidden ${
            isLoading ? 'opacity-50 pointer-events-none' : ''
          }`}
        />

        {(!gisLoaded || isLoading) && (
          <div className="absolute inset-0 h-[44px] w-full flex items-center justify-center gap-2.5 rounded-xl border border-border bg-surface text-xs font-semibold text-foreground shadow-xs">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />
            ) : (
              <span className="h-4 w-4 rounded-full bg-surface-muted animate-pulse" aria-hidden="true" />
            )}
            <span>{displayLabel}</span>
          </div>
        )}
      </div>

      <p className="text-xs leading-relaxed text-center text-foreground-muted">
        {roleRuleNote}
      </p>
    </div>
  );
}
