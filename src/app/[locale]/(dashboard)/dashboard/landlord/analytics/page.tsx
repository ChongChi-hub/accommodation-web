'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { LandlordAnalyticsResponse } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatVnd } from '@/shared/utils/format-vnd';
import { BarChart3 } from 'lucide-react';

export default function LandlordAnalyticsPage() {
  const t = useTranslations('sprint3.analytics');
  const tc = useTranslations('sprint3.common');
  const [analytics, setAnalytics] = useState<LandlordAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await container.billing.billingRepository.getLandlordAnalytics();
      setAnalytics(data);
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-12 w-72 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const summary = analytics?.summary;
  const series = analytics?.revenueSeries ?? [];
  const collectedPoints = series.length > 0 ? series.map((p) => p.collectedAmount) : [0];
  const invoicedPoints = series.length > 0 ? series.map((p) => p.invoicedAmount) : [0];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          {t('title')}
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ChartCard
          title={t('totalRevenue')}
          value={formatVnd(summary?.totalRevenue ?? 0)}
          change={`${summary?.paidInvoicesCount ?? 0}/${summary?.totalInvoicesCount ?? 0}`}
          isPositive={true}
          description={t('collectedCol')}
          dataPoints={collectedPoints}
        />
        <ChartCard
          title={t('occupancyRate')}
          value={`${(analytics?.occupancyRatePercent ?? 0).toFixed(1)}%`}
          change={`${summary?.overdueInvoicesCount ?? 0} ${t('overdueCount')}`}
          isPositive={(summary?.overdueInvoicesCount ?? 0) === 0}
          description={t('unpaidInvoices') + ': ' + formatVnd(summary?.unpaidInvoicesTotal ?? 0)}
          dataPoints={invoicedPoints}
        />
        <ChartCard
          title={t('pendingEscrow')}
          value={formatVnd(summary?.pendingEscrowBalance ?? 0)}
          change={formatVnd(summary?.availableBalance ?? 0)}
          isPositive={true}
          description={t('unpaidInvoices')}
          dataPoints={collectedPoints}
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 text-sm font-bold">
          {t('monthlySeries')}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('periodCol')}</TableHead>
              <TableHead>{t('invoicedCol')}</TableHead>
              <TableHead>{t('collectedCol')}</TableHead>
              <TableHead>{t('overdueCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {series.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-xs py-6 text-stone-500">
                  {t('emptySeries')}
                </TableCell>
              </TableRow>
            ) : (
              series.map((row) => (
                <TableRow key={row.period}>
                  <TableCell className="font-mono text-xs font-semibold">{row.period}</TableCell>
                  <TableCell className="text-xs">{formatVnd(row.invoicedAmount)}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(row.collectedAmount)}</TableCell>
                  <TableCell className="text-xs text-rose-600">{formatVnd(row.overdueAmount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
