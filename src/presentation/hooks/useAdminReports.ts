'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { ReportItem } from '@/domain/repositories/AdminRepository';
import { toast } from '@/presentation/stores/toast.store';

export function useAdminReports() {
  const t = useTranslations('admin.reports');
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

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
      setReports([]);
      return;
    }

    try {
      const data = await container.admin.adminRepository.getReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = useCallback(
    async (id: number) => {
      await container.admin.adminRepository.resolveReport(id);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'RESOLVED' as const } : r))
      );
      toast.success(t('toastResolved'));
    },
    [t]
  );

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.targetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTab = activeTab === 'ALL' || r.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [reports, searchTerm, activeTab]);

  return {
    reports: filteredReports,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    retry: fetchReports,
    handleResolve,
  };
}

