'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import {
  FileText,
  CreditCard,
  Calendar,
  Search,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';

export default function TenantOverviewPage() {
  const tAuto = useTranslations('autoI18n');
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0357')}{' '}{user?.fullName || 'Bạn'}!
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0358')}
          </p>
        </div>
        <Link href="/rooms">
          <Button variant="primary" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
            {tAuto('k0359')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2 border-teal-700/20 bg-teal-50/40 dark:bg-teal-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">{tAuto('k0360')}</span>
            <Badge variant="success" size="sm">{tAuto('k0361')}</Badge>
          </div>
          <p className="text-base font-bold text-stone-900 dark:text-stone-100">
            {tAuto('k0362')}
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {tAuto('k0363')}
          </p>
          <div className="pt-2">
            <Link href="/dashboard/tenant/contracts/1" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              {tAuto('k0303')}{' '}<ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">{tAuto('k0364')}</span>
            <Badge variant="warning" size="sm">{tAuto('k0365')}</Badge>
          </div>
          <p className="text-base font-bold text-stone-900 dark:text-stone-100">
            {tAuto('k0330')}
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {tAuto('k0366')}
          </p>
          <div className="pt-2">
            <Link href="/dashboard/tenant/invoices/1" className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1">
              {tAuto('k0367')}{' '}<ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">{tAuto('k0368')}</span>
            <Badge variant="primary" size="sm">{tAuto('k0369')}</Badge>
          </div>
          <p className="text-base font-bold text-stone-900 dark:text-stone-100">
            {tAuto('k0370')}
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
            {tAuto('k0371')}
          </p>
          <div className="pt-2">
            <Link href="/dashboard/tenant/appointments" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              {tAuto('k0372')}{' '}<ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">{tAuto('k0373')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{tAuto('k0374')}</p>
              <p className="text-stone-500 text-[11px]">{tAuto('k0375')}</p>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{tAuto('k0376')}</p>
              <p className="text-stone-500 text-[11px]">{tAuto('k0377')}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

