'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import {
  useAdminAnalytics,
  StatsRangePreset,
  StatsMetricKey,
} from '@/presentation/hooks/useAdminAnalytics';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { BarChart3, MapPin, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

const fmtNum = (val: number | null | undefined, fallback: string) =>
  val === null || val === undefined ? fallback : new Intl.NumberFormat('vi-VN').format(val);

const fmtVnd = (val: number | null | undefined, fallback: string) =>
  val === null || val === undefined
    ? fallback
    : `${new Intl.NumberFormat('vi-VN').format(val)} đ`;

function AdminAnalyticsContent() {
  const t = useTranslations('admin.analytics');
  const {
    overview,
    timeseries,
    preset,
    selectPreset,
    from,
    to,
    setFrom,
    setTo,
    metric,
    setMetric,
    granularity,
    setGranularity,
    isLoading,
    error,
    retry,
    exportCsv,
  } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
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

  if (!overview) {
    return (
      <div className="py-12">
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      </div>
    );
  }

  const kpis = overview.kpis;
  const unavail = t('unavailable');
  const topAreas = overview.listing?.topAreas ?? [];
  const points = timeseries?.points ?? [];
  const maxPointVal = Math.max(1, ...points.map((p) => p.value));

  const metricTabs: { key: StatsMetricKey; label: string }[] = [
    { key: 'appointments', label: t('metricAppointments') },
    { key: 'users', label: t('metricUsers') },
    { key: 'rooms', label: t('metricRooms') },
    { key: 'contracts', label: t('metricContracts') },
    { key: 'revenue', label: t('metricRevenue') },
  ];

  const rangePresets: { key: StatsRangePreset; label: string }[] = [
    { key: '7', label: t('range7d') },
    { key: '30', label: t('range30d') },
    { key: '90', label: t('range90d') },
    { key: 'custom', label: t('rangeCustom') },
  ];

  const kpiCards = [
    { label: t('kpiTotalUsers'), value: fmtNum(kpis.totalUsers, unavail), sub: `KYC: ${fmtNum(kpis.pendingKyc, unavail)}` },
    { label: t('kpiActiveRooms'), value: fmtNum(kpis.activeRooms, unavail), sub: `${t('kpiPendingRooms')}: ${fmtNum(kpis.pendingRooms, unavail)}` },
    { label: t('kpiAppointments'), value: fmtNum(kpis.totalAppointments, unavail), sub: `${t('kpiCompletedAppointments')}: ${fmtNum(kpis.completedAppointments, unavail)}` },
    { label: t('kpiRentalRequests'), value: fmtNum(kpis.totalRentalRequests, unavail), sub: `${t('kpiActiveContracts')}: ${fmtNum(kpis.activeContracts, unavail)}` },
    { label: t('metricSuccessRate'), value: kpis.successRate === null ? unavail : `${kpis.successRate}%`, sub: t('metricSuccessRateDesc') },
    { label: t('metricAvgTimeToFill'), value: kpis.avgTimeToFillDays === null ? unavail : t('metricDays', { days: kpis.avgTimeToFillDays }), sub: t('metricAvgTimeToFillDesc') },
    { label: t('kpiTotalViews'), value: fmtNum(kpis.totalViews, unavail), sub: `${overview.from} - ${overview.to}` },
    { label: t('kpiPaidRevenue'), value: fmtVnd(kpis.paidRevenue, unavail), sub: kpis.fintechMode === 'SANDBOX_ONLY' ? t('sandboxBadge') : undefined, isSandbox: kpis.fintechMode === 'SANDBOX_ONLY' },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">{t('subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-border bg-surface p-1 gap-1">
            {rangePresets.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => selectPreset(p.key)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                  preset === p.key
                    ? 'bg-teal-700 text-white'
                    : 'text-foreground-muted hover:text-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs">
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-2 py-1 rounded-lg border border-border bg-surface text-foreground" />
              <span>-</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-2 py-1 rounded-lg border border-border bg-surface text-foreground" />
            </div>
          )}
          <Button variant="outline" size="sm" onClick={retry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={exportCsv} leftIcon={<Download className="w-3.5 h-3.5" />}>
            {t('exportCsv')}
          </Button>
        </div>
      </div>

      {overview.degraded && overview.failedSources.length > 0 && (
        <div role="alert" className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{t('degradedWarning', { sources: overview.failedSources.join(', ') })}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((c) => (
          <Card key={c.label} className="p-4 space-y-1.5">
            <p className="text-xs font-medium text-foreground-muted">{c.label}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{c.value}</p>
            {c.sub && (
              <p className={cn('text-[11px]', c.isSandbox ? 'inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold' : 'text-foreground-muted')}>
                {c.sub}
              </p>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">{t('timeseriesTitle')}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5 gap-0.5">
              {metricTabs.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMetric(m.key)}
                  className={cn(
                    'px-2 py-1 rounded-md text-[11px] font-semibold transition-colors',
                    metric === m.key ? 'bg-teal-700 text-white' : 'text-foreground-muted hover:text-foreground',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <select
              aria-label="Granularity"
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as 'day' | 'week' | 'month')}
              className="text-xs rounded-lg border border-border bg-surface px-2 py-1 text-foreground"
            >
              <option value="day">{t('granularityDay')}</option>
              <option value="week">{t('granularityWeek')}</option>
              <option value="month">{t('granularityMonth')}</option>
            </select>
          </div>
        </div>

        {points.length === 0 ? (
          <p className="text-xs text-foreground-muted py-8 text-center">{t('timeseriesEmpty')}</p>
        ) : (
          <div className="flex items-end gap-2 h-44 pt-4 overflow-x-auto">
            {points.map((pt) => {
              const pct = Math.max(6, Math.round((pt.value / maxPointVal) * 100));
              return (
                <div key={pt.bucket} className="flex-1 min-w-[36px] flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-foreground-muted">{new Intl.NumberFormat('vi-VN').format(pt.value)}</span>
                  <div className="w-full max-w-[36px] rounded-t-md bg-teal-700 dark:bg-teal-500 transition-all" style={{ height: `${pct}%` }} />
                  <span className="text-[10px] text-foreground-muted truncate max-w-[64px]">{pt.bucket.slice(5)}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <h2 className="text-sm font-bold text-foreground">{t('topAreasTitle')}</h2>
        </div>
        {topAreas.length === 0 ? (
          <p className="text-xs text-foreground-muted">{t('emptyTitle')}</p>
        ) : (
          <div className="space-y-3 text-xs">
            {topAreas.map((area, idx) => (
              <div key={area.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">
                    {idx + 1}. {area.key.startsWith('area') ? t(area.key as 'areaCauGiay' | 'areaDongDa' | 'areaBinhThanh') : area.districtCode || area.key}
                  </span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">
                    {area.count !== undefined ? `${area.count} (${area.percent}%)` : t('areaPercent', { percent: area.percent })}
                  </span>
                </div>
                <div className="w-full bg-surface-muted h-2.5 rounded-full overflow-hidden border border-border/50">
                  <div className="bg-teal-700 dark:bg-teal-500 h-full rounded-full" style={{ width: `${area.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
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
