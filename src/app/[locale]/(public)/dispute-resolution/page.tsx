'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { Scale, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function DisputeResolutionPage() {
  const t = useTranslations('disputePage');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: t('breadcrumb') }]} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
          <Scale className="w-3.5 h-3.5" />
          <span>{t('badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('title')}
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 space-y-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
            <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <h2>{t('sec1Title')}</h2>
          </div>
          <p>{t('sec1Content')}</p>
        </Card>

        <Card className="p-6 space-y-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
            <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <h2>{t('sec2Title')}</h2>
          </div>
          <p>{t('sec2Content')}</p>
        </Card>

        <Card className="p-6 space-y-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
            <RefreshCw className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <h2>{t('sec3Title')}</h2>
          </div>
          <p>{t('sec3Content')}</p>
        </Card>
      </div>
    </div>
  );
}
