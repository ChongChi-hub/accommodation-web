'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { toast } from '@/presentation/stores/toast.store';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (c: any) => void; renderButton: (p: HTMLElement, o: any) => void; prompt: (n?: any) => void; cancel: () => void; } } };
  }
}

interface GoogleLoginButtonProps {
  label?: string;
  intendedRole?: 'TENANT' | 'LANDLORD';
  isRegister?: boolean;
  returnUrl?: string;
}

export function GoogleLoginButton({
  label = 'Tiếp tục với Google',
  intendedRole = 'TENANT',
  isRegister = false,
  returnUrl,
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const locale = useLocale();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [fingerprintMismatch, setFingerprintMismatch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const currentNonceRef = useRef<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const isFlagEnabled = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === 'true';
  const isPlaceholder = !clientId || clientId.includes('placeholder') || clientId.includes('your-google-client-id');

  // 1. Check configuration and backend status
  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      if (!isFlagEnabled || isPlaceholder) {
        if (mounted) setIsConfigured(false);
        return;
      }

      try {
        const status = await container.auth.googleAuthUseCase.getStatus();
        if (!status.enabled) {
          if (mounted) setIsConfigured(false);
          return;
        }

        // Compare fingerprints in dev mode
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.crypto?.subtle) {
          try {
            const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(clientId));
            const feFp = Array.from(new Uint8Array(buf).slice(0, 4)).map((b) => b.toString(16).padStart(2, '0')).join('');
            if (status.clientIdFingerprint && status.clientIdFingerprint !== feFp) {
              setFingerprintMismatch(`Frontend (${feFp}) ≠ Backend (${status.clientIdFingerprint})`);
            }
          } catch {}
        }

        if (mounted) setIsConfigured(true);
      } catch {
        if (mounted) setIsConfigured(false);
      }
    }

    checkStatus();
    return () => {
      mounted = false;
    };
  }, [isFlagEnabled, isPlaceholder, clientId]);

  // 2. Fetch fresh nonce and initialize GIS
  const initGis = useCallback(async () => {
    if (!window.google?.accounts?.id || !clientId || isSubmittingRef.current) return;

    try {
      const nonceRes = await container.auth.googleAuthUseCase.getNonce();
      currentNonceRef.current = nonceRes.nonce;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        nonce: nonceRes.nonce,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: isRegister ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 380,
          locale: locale === 'en' ? 'en' : 'vi',
        });
      }
    } catch {
      // Ignore background init error
    }
  }, [clientId, isRegister, locale]);

  useEffect(() => {
    if (gisLoaded && isConfigured) {
      initGis();
    }
  }, [gisLoaded, isConfigured, initGis]);

  // 3. Handle credential token response from Google
  const handleCredentialResponse = async (response: { credential?: string }) => {
    if (isSubmittingRef.current) return; // Prevent double invocation
    const credential = response?.credential;
    const nonce = currentNonceRef.current;

    if (!credential || !nonce) {
      toast.error('Không nhận được mã xác thực Google hợp lệ.');
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      const result = await useAuthStore.getState().loginWithGoogle(
        credential,
        nonce,
        isRegister ? intendedRole : undefined
      );

      if (result.success) {
        if (!isRegister && result.role === 'TENANT') {
          toast.success(locale === 'en' ? 'Signed in with Google successfully!' : 'Đã đăng nhập bằng Google thành công!');
        } else if (isRegister) {
          const isL = intendedRole === 'LANDLORD';
          toast.success(locale === 'en' ? (isL ? 'Landlord registered with Google!' : 'Tenant registered with Google!') : (isL ? 'Đã đăng ký tài khoản Chủ trọ bằng Google!' : 'Đã đăng ký tài khoản Người thuê bằng Google!'));
        }

        // Redirect based on verified role, approval status or returnUrl
        const target = returnUrl && returnUrl.startsWith('/') ? returnUrl
          : result.user?.roles?.includes('LANDLORD') ? '/dashboard/landlord'
          : result.user?.roles?.includes('ADMIN') ? '/dashboard/admin'
          : result.user?.roles?.includes('MODERATOR') ? '/dashboard/moderator'
          : isRegister && intendedRole === 'LANDLORD' ? '/dashboard/landlord/kyc'
          : '/dashboard/tenant';
        router.push(target);
      }
    } catch (err: any) {
      const code = err?.errorCode || '';
      const msg = err instanceof Error ? err.message : '';
      const errMap: Record<string, string> = {
        ERR_RATE_LIMIT_EXCEEDED: locale === 'en' ? 'Too many login attempts. Please wait 1 minute.' : 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 1 phút.',
        ERR_USER_SUSPENDED: locale === 'en' ? 'Account is suspended.' : 'Tài khoản của bạn đã bị khóa hoặc đình chỉ hoạt động.',
        ERR_GOOGLE_NOT_CONFIGURED: locale === 'en' ? 'Google authentication is currently unavailable.' : 'Tính năng đăng nhập Google hiện chưa sẵn sàng.',
        ERR_INVALID_NONCE: locale === 'en' ? 'Invalid Google token or session expired.' : 'Phiên xác thực Google không hợp lệ hoặc đã hết hạn.',
      };
      toast.error(errMap[code] || msg || (locale === 'en' ? 'Google authentication failed.' : 'Đăng nhập Google thất bại. Vui lòng thử lại.'));
      initGis();
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleManualTrigger = () => {
    if (isLoading || isSubmittingRef.current) return;
    if (window.google?.accounts?.id) {
      initGis().then(() => {
        try {
          window.google?.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Popup suppressed or closed
              setIsLoading(false);
              isSubmittingRef.current = false;
            }
          });
        } catch {
          toast.error('Không thể mở cửa sổ đăng nhập Google.');
        }
      });
    } else {
      toast.error('Đang tải thư viện Google Identity Services. Vui lòng thử lại trong giây lát.');
    }
  };

  // If feature flag or status is disabled, do not render
  if (isConfigured === false) return null;

  return (
    <div className="w-full space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGisLoaded(true)}
      />

      {fingerprintMismatch && (
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
          ⚠️ <strong>Cảnh báo cấu hình dev:</strong> Google Client ID ở Frontend và Backend không khớp nhau: {fingerprintMismatch}. Vui lòng đồng bộ tệp .env!
        </div>
      )}

      <div className="relative w-full flex justify-center">
        <div
          ref={buttonContainerRef}
          className={`w-full flex justify-center min-h-[44px] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        />

        {(!gisLoaded || isLoading) && (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleManualTrigger}
            className="absolute inset-0 w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{isLoading ? (locale === 'en' ? 'Signing in with Google...' : 'Đang xử lý đăng nhập Google...') : label}</span>
          </button>
        )}
      </div>
    </div>
  );
}
