'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

export function CookieConsentBanner() {
  const t = useTranslations('cookieBanner');
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = localStorage.getItem('toam_cookie_consent');
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const handleConsent = async (agreedAll: boolean) => {
    const payload = {
      agreed: agreedAll,
      type: agreedAll ? 'ALL' : 'ESSENTIAL_ONLY',
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem('toam_cookie_consent', JSON.stringify(payload));
      // Best-effort sync to backend consent audit log
      await fetch('/api/v1/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType: 'COOKIE_CONSENT',
          version: 'v1.0',
          agreed: agreedAll,
          metadataJson: JSON.stringify(payload),
        }),
      }).catch(() => {});
    } catch {
      // Ignore local storage errors
    } finally {
      setVisible(false);
    }
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-2xl transition-all animate-in slide-in-from-bottom-4 duration-300 print:hidden"
    >
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>{t('title')}</span>
              <span className="text-[11px] font-medium text-teal-700 dark:text-teal-400 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {t('nd13Badge')}
              </span>
            </p>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              {t('desc')}{' '}
              <Link href="/privacy" className="text-teal-700 dark:text-teal-400 underline font-medium hover:text-teal-800">
                {t('privacyLink')}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleConsent(false)}
            className="flex-1 sm:flex-initial text-xs"
          >
            {t('btnEssentialOnly')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleConsent(true)}
            className="flex-1 sm:flex-initial text-xs"
          >
            {t('btnAcceptAll')}
          </Button>
          <button
            onClick={() => handleConsent(false)}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
