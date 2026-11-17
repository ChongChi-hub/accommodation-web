'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { container } from '@/infrastructure/di/container';
import { AdminStats, ReportItem } from '@/domain/repositories/AdminRepository';

export function useAdminOverview() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Dev preview query overrides
    if (stateParam === 'loading') {
      setIsLoading(true);
      return;
    }
    if (stateParam === 'error') {
      setIsLoading(false);
      setError('SIMULATED_ERROR');
      return;
    }
    if (stateParam === 'empty') {
      setIsLoading(false);
      setStats({
        totalUsers: 0,
        activeRooms: 0,
        pendingApprovals: 0,
        pendingKyc: 0,
        monthlyRevenue: 0,
        servicesHealth: {
          gateway: false,
          identity: false,
          listing: false,
          booking: false,
          billing: false,
        },
      });
      setReports([]);
      return;
    }

    try {
      const [statsData, reportsData] = await Promise.all([
        container.admin.adminRepository.getStats(),
        container.admin.adminRepository.getReports().catch(() => []),
      ]);
      setStats(statsData);
      setReports(reportsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    reports,
    isLoading,
    error,
    retry: fetchStats,
    isEmpty: false,
  };
}

