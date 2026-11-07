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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Activity className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div>
          <Badge variant="primary" size="md">
            {isSeniorAdmin ? t('seniorAdmin') : t('moderator')}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              {t('pendingRoomsTitle')}
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.pendingApprovals}
              </span>
              <Badge variant="warning" size="sm">
                {t('handleReport')}
              </Badge>
            </div>
            <p className="text-[11px] text-foreground-muted mt-1">{t('pendingRoomsDesc')}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              href="/dashboard/admin/rooms"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1.5"
            >
              <span>{t('pendingRoomsAction')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              {t('pendingKycTitle')}
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                5
              </span>
              <Badge variant="warning" size="sm">
                <ShieldCheck className="w-3 h-3 mr-1" />
                <span>{t('ekycBadge')}</span>
              </Badge>
            </div>
            <p className="text-[11px] text-foreground-muted mt-1">{t('pendingKycDesc')}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              href="/dashboard/admin/kyc"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1.5"
            >
              <span>{t('pendingKycAction')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Detail Section: Reports & Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-foreground">
              {t('recentReportsTitle')}
            </h2>
          </div>
          <div className="p-4 bg-surface-muted rounded-xl flex items-center justify-between border border-border">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">{t('recentReportsDesc')}</p>
              <p className="text-[11px] text-foreground-muted">{t('recentReportsReporter')}</p>
            </div>
            <Link href="/dashboard/admin/reports">
              <Button variant="outline" size="sm">
                {t('handleReport')}
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-foreground">
              {t('systemHealthTitle')}
            </h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-border/60">
              <span className="font-medium text-foreground">{t('svcGateway')}</span>
              <Badge variant={stats.servicesHealth.gateway ? 'success' : 'danger'} size="sm">
                {stats.servicesHealth.gateway ? t('serviceNormal') : t('serviceDegraded')}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/60">
              <span className="font-medium text-foreground">{t('svcIdentity')}</span>
              <Badge variant={stats.servicesHealth.identity ? 'success' : 'danger'} size="sm">
                {stats.servicesHealth.identity ? t('serviceNormal') : t('serviceDegraded')}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/60">
              <span className="font-medium text-foreground">{t('svcListing')}</span>
              <Badge variant={stats.servicesHealth.listing ? 'success' : 'danger'} size="sm">
                {stats.servicesHealth.listing ? t('serviceNormal') : t('serviceDegraded')}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-medium text-foreground">{t('svcBookingBilling')}</span>
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
