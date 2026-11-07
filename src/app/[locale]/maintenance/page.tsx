'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Wrench, Clock, AlertCircle, RefreshCw, PhoneCall } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

export default function MaintenancePage() {
  const t = useTranslations('pages.maintenance');

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-surface-muted/30">
      <div className="w-full max-w-xl bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 shadow-sm">
          <Wrench className="w-12 h-12 animate-bounce-subtle" />
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-600"></span>
          </span>
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/80 rounded-full">
            {t('badge')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm font-medium text-foreground-muted max-w-md mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Estimation & Impact */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-surface-muted border border-border text-xs font-semibold text-teal-800 dark:text-teal-300">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{t('estimateTime')}</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-muted text-xs text-foreground-muted leading-relaxed text-left border border-border/80 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{t('featuresAffected')}</span>
          </div>
        </div>

        {/* Reload button & Hotline */}
        <div className="space-y-4 pt-2">
          <Button
            variant="primary"
            onClick={handleRefresh}
            className="w-full sm:w-auto px-6 py-2.5 inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('checkStatus')}</span>
          </Button>

          <p className="text-xs text-foreground-muted flex items-center justify-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{t('emergencyContact')}</span>
          </p>
        </div>
      </div>
    </main>
  );
}

