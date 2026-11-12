'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';

export default function TermsPage() {
  const tAuto = useTranslations('autoI18n');
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Điều khoản dịch vụ' }]} />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0444')}
        </h1>
        <p className="text-xs text-stone-400">{tAuto('k0428')}</p>
      </div>

      <Card className="p-8 space-y-6 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">{tAuto('k0445')}</h2>
          <p>
            {tAuto('k0446')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">{tAuto('k0447')}</h2>
          <p>
            {tAuto('k0448')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">{tAuto('k0449')}</h2>
          <p>
            {tAuto('k0450')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">{tAuto('k0451')}</h2>
          <p>
            {tAuto('k0452')}
          </p>
        </section>
      </Card>
    </div>
  );
}

