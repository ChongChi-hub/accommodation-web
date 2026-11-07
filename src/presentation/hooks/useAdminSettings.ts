'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from '@/presentation/stores/toast.store';

export function useAdminSettings() {
  const t = useTranslations('admin.settings');
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [vietQrActive, setVietQrActive] = useState(true);
  const [autoApproveRooms, setAutoApproveRooms] = useState(false);
  const [require2FAStaff, setRequire2FAStaff] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('60');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [supportHotline, setSupportHotline] = useState('1900 6868');
  const [commissionRate, setCommissionRate] = useState('1.5');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
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

    try {
      // Simulate reading config
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(t('toastSaved'));
    }, 600);
  };

  const handleClearCache = () => {
    toast.info(t('toastClearingCache'));
    setTimeout(() => {
      toast.success(t('toastCacheCleared'));
    }, 800);
  };

  return {
    maintenanceMode,
    setMaintenanceMode,
    vietQrActive,
    setVietQrActive,
    autoApproveRooms,
    setAutoApproveRooms,
    require2FAStaff,
    setRequire2FAStaff,
    sessionTimeoutMinutes,
    setSessionTimeoutMinutes,
    maxLoginAttempts,
    setMaxLoginAttempts,
    supportHotline,
    setSupportHotline,
    commissionRate,
    setCommissionRate,
    isSaving,
    isLoading,
    error,
    retry: fetchSettings,
    handleSave,
    handleClearCache,
  };
}

