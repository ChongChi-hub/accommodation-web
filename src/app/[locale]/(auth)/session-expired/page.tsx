import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ClockAlert, LogIn, Home } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

export default function SessionExpiredPage() {
  const t = useTranslations('pages.sessionExpired');

  return (
    <section className="w-full py-2">
      <div className="w-full bg-surface border border-border rounded-2xl p-6 shadow-sm text-center space-y-5">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 shadow-xs">
          <ClockAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm font-medium text-foreground-muted">
            {t('subtitle')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-muted text-xs text-foreground-muted leading-relaxed text-left border border-border/80">
          {t('description')}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/login" className="w-full sm:w-auto flex-1">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              <span>{t('loginAgain')}</span>
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>{t('backHome')}</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

