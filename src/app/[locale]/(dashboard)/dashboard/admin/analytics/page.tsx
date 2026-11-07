'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminAnalytics } from '@/presentation/hooks/useAdminAnalytics';
import { Card } from '@/presentation/components/ui/Card';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { BarChart3, TrendingUp, MapPin } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <Card className="p-6 space-y-5">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-600" />
          {t('topAreasTitle')}
        </h2>
        <div className="space-y-4 text-xs">
          {data.topAreas.map((area, idx) => (
            <div key={area.id} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {idx + 1}. {t(area.key)}
                </span>
                <span className="font-bold text-primary-600 dark:text-primary-400">
                  {t('areaPercent', { percent: area.percent })}
                </span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary-600 dark:bg-primary-500 h-full rounded-full transition-all duration-500"
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
