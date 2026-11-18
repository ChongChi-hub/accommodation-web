'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { container } from '@/infrastructure/di/container';
import { AuditLogItem } from '@/domain/repositories/AdminRepository';

export function useAdminAuditLogs() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
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
      setLogs([]);
      return;
    }

    try {
      const data = await container.admin.adminRepository.getAuditLogs({ limit: 200 });
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return logs.filter((l) => {
      if (sourceFilter !== 'ALL' && (l.source || 'ADMIN').toUpperCase() !== sourceFilter) {
        return false;
      }
      if (!q) return true;
      return (
        l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        (l.details || '').toLowerCase().includes(q) ||
        l.ip.includes(q)
      );
    });
  }, [logs, searchTerm, sourceFilter]);

  return {
    logs: filteredLogs,
    totalCount: logs.length,
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    isLoading,
    error,
    retry: fetchLogs,
  };
}
