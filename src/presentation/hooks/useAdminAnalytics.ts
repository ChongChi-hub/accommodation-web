'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { container } from '@/infrastructure/di/container';
import {
  AdminPlatformStatsOverview,
  AdminPlatformStatsTimeseries,
} from '@/domain/repositories/AdminRepository';

export type StatsRangePreset = '7' | '30' | '90' | 'custom';
export type StatsMetricKey = 'users' | 'rooms' | 'appointments' | 'contracts' | 'revenue';

function formatIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function presetToDates(preset: Exclude<StatsRangePreset, 'custom'>): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - (Number(preset) - 1));
  return { from: formatIsoDate(from), to: formatIsoDate(to) };
}

export function useAdminAnalytics() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const initialDates = presetToDates('30');
  const [preset, setPreset] = useState<StatsRangePreset>('30');
  const [from, setFrom] = useState<string>(initialDates.from);
  const [to, setTo] = useState<string>(initialDates.to);
  const [metric, setMetric] = useState<StatsMetricKey>('appointments');
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  const [overview, setOverview] = useState<AdminPlatformStatsOverview | null>(null);
  const [timeseries, setTimeseries] = useState<AdminPlatformStatsTimeseries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectPreset = useCallback((next: StatsRangePreset) => {
    setPreset(next);
    if (next !== 'custom') {
      const range = presetToDates(next);
      setFrom(range.from);
      setTo(range.to);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (stateParam === 'loading') {
      return;
    }
    if (stateParam === 'error') {
      setIsLoading(false);
      setError('SIMULATED_ERROR');
      return;
    }
    if (stateParam === 'empty') {
      setIsLoading(false);
      setOverview(null);
      setTimeseries(null);
      return;
    }

    try {
      const [ov, ts] = await Promise.all([
        container.admin.adminRepository.getPlatformStatsOverview(from, to),
        container.admin.adminRepository.getPlatformStatsTimeseries({ metric, from, to, granularity }),
      ]);
      setOverview(ov);
      setTimeseries(ts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam, from, to, metric, granularity]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const exportCsv = useCallback(() => {
    if (!overview) return;
    const rows: string[][] = [
      ['Metric', 'Value', 'From', 'To', 'FintechMode'],
      ['totalUsers', String(overview.kpis.totalUsers ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['pendingKyc', String(overview.kpis.pendingKyc ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['totalRooms', String(overview.kpis.totalRooms ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['activeRooms', String(overview.kpis.activeRooms ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['pendingRooms', String(overview.kpis.pendingRooms ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['totalViews', String(overview.kpis.totalViews ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['totalAppointments', String(overview.kpis.totalAppointments ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['completedAppointments', String(overview.kpis.completedAppointments ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['totalRentalRequests', String(overview.kpis.totalRentalRequests ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['totalContracts', String(overview.kpis.totalContracts ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['activeContracts', String(overview.kpis.activeContracts ?? 'UNAVAILABLE'), overview.from, overview.to, ''],
      ['paidInvoices', String(overview.kpis.paidInvoices ?? 'UNAVAILABLE'), overview.from, overview.to, overview.kpis.fintechMode ?? ''],
      ['paidRevenue', String(overview.kpis.paidRevenue ?? 'UNAVAILABLE'), overview.from, overview.to, overview.kpis.fintechMode ?? ''],
    ];
    const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cozynest-platform-stats-${overview.from}_${overview.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [overview]);

  return {
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
    retry: fetchData,
    exportCsv,
  };
}
