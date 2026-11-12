'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Construction } from 'lucide-react';

export default function Page() {
  const tAuto = useTranslations('autoI18n');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{tAuto('k0005')}</h1>
        <p className="text-xs text-foreground-muted mt-0.5">{tAuto('k0006')}</p>
      </div>
      <Card className="p-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600">
          <Construction className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{tAuto('k0003')}</h2>
        <p className="text-xs text-foreground-muted max-w-md mx-auto">
          {tAuto('k0004')}
        </p>
      </Card>
    </div>
  );
}
