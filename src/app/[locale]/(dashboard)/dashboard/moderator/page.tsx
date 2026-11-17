'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminOverview } from '@/presentation/hooks/useAdminOverview';
import { Card } from '@/presentation/components/ui/Card';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

function ModeratorDashboardContent() {
  const tAuto = useTranslations('autoI18n');
  const { stats, reports, isLoading, error, retry } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-12">
        <ErrorState
          title="Không thể tải bảng điều khiển kiểm duyệt"
          message={error || 'Đã xảy ra lỗi khi lấy dữ liệu'}
          onRetry={retry}
        />
      </div>
    );
  }

  const pendingRooms = stats.pendingApprovals ?? 0;
  const pendingKyc = stats.pendingKyc ?? 0;
  const pendingReports = reports?.length ?? 0;

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
        <Link href="/dashboard/admin/rooms" className="group">
          <Card className="p-5 space-y-2 hover:border-teal-500/50 transition-colors cursor-pointer h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">{tAuto('k0260')}</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
                {pendingRooms}
              </p>
              <p className="text-xs text-stone-400 mt-1">{tAuto('k0261')}</p>
            </div>
            <div className="pt-2 text-xs font-medium text-teal-600 dark:text-teal-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Xem danh sách</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/kyc" className="group">
          <Card className="p-5 space-y-2 hover:border-teal-500/50 transition-colors cursor-pointer h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">{tAuto('k0262')}</span>
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
                {pendingKyc}
              </p>
              <p className="text-xs text-stone-400 mt-1">{tAuto('k0263')}</p>
            </div>
            <div className="pt-2 text-xs font-medium text-teal-600 dark:text-teal-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Xem danh sách</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/reports" className="group">
          <Card className="p-5 space-y-2 hover:border-teal-500/50 transition-colors cursor-pointer h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">{tAuto('k0264')}</span>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
                {pendingReports}
              </p>
              <p className="text-xs text-stone-400 mt-1">{tAuto('k0265')}</p>
            </div>
            <div className="pt-2 text-xs font-medium text-teal-600 dark:text-teal-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Xem danh sách</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function ModeratorDashboardPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
      <ModeratorDashboardContent />
    </Suspense>
  );
}
