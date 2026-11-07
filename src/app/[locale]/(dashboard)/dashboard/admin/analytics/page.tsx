'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminAnalytics } from '@/presentation/hooks/useAdminAnalytics';
import { Card } from '@/presentation/components/ui/Card';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { BarChart3, TrendingUp, MapPin, Compass } from 'lucide-react';

function AdminAnalyticsContent() {
  const t = useTranslations('admin.analytics');
  const { data, isLoading, error, retry } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState title={t('errorTitle')} message={t('errorDesc')} onRetry={retry} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12">
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <ChartCard
          title={t('metricSuccessRate')}
          value={`${data.successRate}%`}
          change="+6.2%"
          isPositive={true}
          description={t('metricSuccessRateDesc')}
          dataPoints={[60, 65, 68, 70, 71, 73, 75]}
        />
        <ChartCard
          title={t('metricAvgTimeToFill')}
          value={t('metricDays', { days: data.avgTimeToFillDays })}
          change="-1.5"
          isPositive={true}
          description={t('metricAvgTimeToFillDesc')}
          dataPoints={[9, 8, 7, 6, 5, 5, 4]}
        />
        <ChartCard
          title={t('metricSearches')}
          value={new Intl.NumberFormat('vi-VN').format(data.totalSearches)}
          change="+24.8%"
          isPositive={true}
          description={t('metricSearchesDesc')}
          dataPoints={[80, 88, 95, 102, 110, 120, 128]}
        />
      </div>

      {/* Top Search Areas Breakdown */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
            <MapPin className="w-4 h-4" />
          </span>
          <h2 className="text-sm font-bold text-foreground">
            {t('topAreasTitle')}
          </h2>
        </div>
        <div className="space-y-4 text-xs">
          {data.topAreas.map((area, idx) => (
            <div key={area.id} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">
                  {idx + 1}. {t(area.key)}
                </span>
                <span className="font-bold text-teal-700 dark:text-teal-400">
                  {t('areaPercent', { percent: area.percent })}
                </span>
              </div>
              <div className="w-full bg-surface-muted h-3 rounded-full overflow-hidden border border-border/50">
                <div
                  className="bg-teal-700 dark:bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${area.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminAnalyticsContent />
    </Suspense>
  );
}
