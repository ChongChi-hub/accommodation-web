'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import {
  Building,
  PlusCircle,
  Calendar,
  CreditCard,
  Users,
  Gauge,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function LandlordOverviewPage() {
  const tAuto = useTranslations('autoI18n');
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0189')}{' '}{user?.fullName || 'Trần Minh Tuấn'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0190')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/landlord/rooms/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              {tAuto('k0191')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartCard
          title="Doanh thu tháng 11/2026"
          value="24.500.000 đ"
          change="+12.5%"
          isPositive={true}
          description="Đã thu 85% tổng công nợ"
          dataPoints={[18, 20, 22, 21, 24, 23, 25]}
        />

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">{tAuto('k0192')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">{tAuto('k0193')}</span>
              <Badge variant="success" size="sm">83.3%</Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">{tAuto('k0194')}</p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link href="/dashboard/landlord/rooms" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              {tAuto('k0195')}{' '}<ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">{tAuto('k0196')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">{tAuto('k0197')}</span>
              <Badge variant="warning" size="sm">{tAuto('k0033')}</Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">{tAuto('k0198')}</p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link href="/dashboard/landlord/appointments" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              {tAuto('k0199')}{' '}<ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">{tAuto('k0200')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">{tAuto('k0201')}</span>
              <Badge variant="primary" size="sm">{tAuto('k0202')}</Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">{tAuto('k0203')}</p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link href="/dashboard/landlord/utilities" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              {tAuto('k0204')}{' '}<ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />{' '}{tAuto('k0205')}
        </h2>
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                {tAuto('k0206')}
              </p>
              <p className="text-stone-400 text-[11px] mt-0.5">{tAuto('k0207')}</p>
            </div>
            <Link href="/dashboard/landlord/appointments">
              <Button variant="outline" size="sm">{tAuto('k0208')}</Button>
            </Link>
          </div>

          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                {tAuto('k0209')}
              </p>
              <p className="text-stone-400 text-[11px] mt-0.5">{tAuto('k0210')}</p>
            </div>
            <Link href="/dashboard/landlord/invoices">
              <Button variant="primary" size="sm">{tAuto('k0211')}</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

