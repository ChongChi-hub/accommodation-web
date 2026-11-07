import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { UserX, LifeBuoy, PhoneCall, ShieldAlert } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

export default function AccountLockedPage() {
  const t = useTranslations('pages.accountLocked');

  return (
    <main className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-surface border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs">
          <UserX className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm font-medium text-foreground-muted">
            {t('subtitle')}
          </p>
        </div>

        {/* Reason Box */}
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 text-xs text-left border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
          <span className="font-bold text-rose-900 dark:text-rose-300">{t('reasonLabel')}</span>
          <p className="text-rose-800/90 dark:text-rose-300/80 leading-relaxed">
            {t('reasonDefault')}
          </p>
        </div>

        <p className="text-xs text-foreground-muted">
          {t('supportNotice')}
        </p>

        {/* Actions & Contact */}
        <div className="space-y-3 pt-2">
          <Link href="/support/new" className="block w-full">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <LifeBuoy className="w-4 h-4" />
              <span>{t('appealBtn')}</span>
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-foreground-muted pt-2">
            <PhoneCall className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t('hotline')}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

