import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldAlert, Home, LifeBuoy, ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

export default function ForbiddenPage() {
  const t = useTranslations('pages.forbidden');

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-surface-muted/40">
      <div className="w-full max-w-lg bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        {/* Warning Icon Container */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Status Code & Headings */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-bold font-mono tracking-widest text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 rounded-full">
            ERROR {t('code')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm font-medium text-foreground-muted max-w-md mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Description Box */}
        <div className="p-4 rounded-2xl bg-surface-muted text-xs text-foreground-muted leading-relaxed text-left border border-border/80">
          {t('description')}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>{t('backHome')}</span>
            </Button>
          </Link>
          <Link href="/support" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <LifeBuoy className="w-4 h-4" />
              <span>{t('contactSupport')}</span>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
