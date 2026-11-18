'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from '@/presentation/stores/toast.store';
import { ApiClient } from '@/infrastructure/http/api-client';

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
      const data = await ApiClient.get<Record<string, any>>('/admin/settings');
      if (data) {
        if (data.maintenanceMode !== undefined) setMaintenanceMode(Boolean(data.maintenanceMode));
        if (data.vietQrActive !== undefined) setVietQrActive(Boolean(data.vietQrActive));
        if (data.autoApproveRooms !== undefined) setAutoApproveRooms(Boolean(data.autoApproveRooms));
        if (data.require2FAStaff !== undefined) setRequire2FAStaff(Boolean(data.require2FAStaff));
        if (data.sessionTimeoutMinutes) setSessionTimeoutMinutes(String(data.sessionTimeoutMinutes));
        if (data.maxLoginAttempts) setMaxLoginAttempts(String(data.maxLoginAttempts));
        if (data.supportHotline) setSupportHotline(String(data.supportHotline));
        if (data.commissionRate) setCommissionRate(String(data.commissionRate));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await ApiClient.put<void>('/admin/settings', {
        maintenanceMode,
        vietQrActive,
        autoApproveRooms,
        require2FAStaff,
        sessionTimeoutMinutes,
        maxLoginAttempts,
        supportHotline,
        commissionRate,
      });
      toast.success(t('toastSaved'));
    } catch {
      toast.error('Lỗi lưu cấu hình hệ thống');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await ApiClient.post<void>('/admin/clear-cache', {});
      toast.success(t('toastCacheCleared'));
    } catch {
      toast.error('Lỗi khi xóa bộ nhớ đệm hệ thống');
    }
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
