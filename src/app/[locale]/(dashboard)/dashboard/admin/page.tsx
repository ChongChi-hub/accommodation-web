'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminOverview } from '@/presentation/hooks/useAdminOverview';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Card } from '@/presentation/components/ui/Card';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Link } from '@/i18n/routing';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

function AdminOverviewContent() {
  const t = useTranslations('admin.overview');
  const { user } = useAuthStore();
  const { stats, isLoading, error, retry, isEmpty } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="admin-overview-loading">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-12" data-testid="admin-overview-error">
        <ErrorState
          title={t('errorTitle')}
          message={t('errorSubtitle')}
          onRetry={retry}
        />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-12" data-testid="admin-overview-empty">
        <EmptyState
          title={t('emptyState')}
          actionLabel={t('systemHealthTitle')}
          onAction={retry}
        />
      </div>
    );
  }

  const isSeniorAdmin = user?.roles?.includes('ADMIN');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
        <Badge variant="primary" size="md">
          {isSeniorAdmin ? t('seniorAdmin') : t('moderator')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartCard
          title={t('totalUsersTitle')}
          value={new Intl.NumberFormat('vi-VN').format(stats.totalUsers)}
          change="+15.2%"
          isPositive={true}
          description={t('totalUsersDesc')}
          dataPoints={[800, 950, 1100, 1220, 1310, 1380, stats.totalUsers]}
        />

        <ChartCard
          title={t('activeRoomsTitle')}
          value={new Intl.NumberFormat('vi-VN').format(stats.activeRooms)}
          change="+8.4%"
          isPositive={true}
          description={t('activeRoomsDesc')}
          dataPoints={[320, 410, 490, 560, 610, 650, stats.activeRooms]}
        />

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('pendingRoomsTitle')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {stats.pendingApprovals}
              </span>
              <Badge variant="warning" size="sm">
                {t('handleReport')}
              </Badge>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">{t('pendingRoomsDesc')}</p>
          </div>
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              href="/dashboard/admin/rooms"
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              {t('pendingRoomsAction')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('pendingKycTitle')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                5
              </span>
              <Badge variant="warning" size="sm">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {t('ekycBadge')}
              </Badge>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">{t('pendingKycDesc')}</p>
          </div>
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              href="/dashboard/admin/kyc"
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              {t('pendingKycAction')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {t('recentReportsTitle')}
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl flex items-center justify-between border border-neutral-200 dark:border-neutral-800">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{t('recentReportsDesc')}</p>
                <p className="text-neutral-500 text-[11px] mt-0.5">{t('recentReportsReporter')}</p>
              </div>
              <Link href="/dashboard/admin/reports">
                <Button variant="outline" size="sm">
                  {t('handleReport')}
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {t('systemHealthTitle')}
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-600 dark:text-neutral-400">{t('svcGateway')}</span>
              <Badge variant={stats.servicesHealth.gateway ? 'success' : 'danger'} size="sm">
                {stats.servicesHealth.gateway ? t('serviceNormal') : t('serviceDegraded')}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-600 dark:text-neutral-400">{t('svcIdentity')}</span>
              <Badge variant={stats.servicesHealth.identity ? 'success' : 'danger'} size="sm">
                {stats.servicesHealth.identity ? t('serviceNormal') : t('serviceDegraded')}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-600 dark:text-neutral-400">{t('svcListing')}</span>
              <Badge variant={stats.servicesHealth.listing ? 'success' : 'danger'} size="sm">
                {stats.servicesHealth.listing ? t('serviceNormal') : t('serviceDegraded')}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-neutral-600 dark:text-neutral-400">{t('svcBookingBilling')}</span>
              <Badge variant={stats.servicesHealth.booking ? 'success' : 'danger'} size="sm">
                {stats.servicesHealth.booking ? t('serviceNormal') : t('serviceDegraded')}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminOverviewContent />
    </Suspense>
  );
}
