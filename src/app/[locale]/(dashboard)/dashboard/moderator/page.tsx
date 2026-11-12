'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function ModeratorDashboardPage() {
  const tAuto = useTranslations('autoI18n');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-teal-700 dark:text-teal-400" />
          {tAuto('k0258')}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          {tAuto('k0259')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">{tAuto('k0260')}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">8</p>
          <p className="text-xs text-stone-400">{tAuto('k0261')}</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">{tAuto('k0262')}</span>
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">5</p>
          <p className="text-xs text-stone-400">{tAuto('k0263')}</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">{tAuto('k0264')}</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">2</p>
          <p className="text-xs text-stone-400">{tAuto('k0265')}</p>
        </Card>
      </div>
    </div>
  );
}

