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
      const data = await container.admin.adminRepository.getAuditLogs();
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
    return logs.filter((l) => {
      return (
        l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.ip.includes(searchTerm)
      );
    });
  }, [logs, searchTerm]);

  return {
    logs: filteredLogs,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    retry: fetchLogs,
  };
}

