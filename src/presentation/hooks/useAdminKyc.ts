'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { KycReviewItem } from '@/domain/repositories/AdminRepository';
import { toast } from '@/presentation/stores/toast.store';

export function useAdminKyc() {
  const t = useTranslations('admin.kyc');
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [kycList, setKycList] = useState<KycReviewItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<KycReviewItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKyc = useCallback(async () => {
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
      setKycList([]);
      return;
    }

    try {
      const data = await container.admin.adminRepository.getPendingKyc();
      setKycList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

  const handleApprove = useCallback(
    async (id: number) => {
      await container.admin.adminRepository.approveKyc(id);
      setKycList((prev) => prev.filter((k) => k.id !== id));
      setSelectedUser(null);
      toast.success(t('toastApproved'));
    },
    [t]
  );

  const handleReject = useCallback(
    async (id: number) => {
      await container.admin.adminRepository.rejectKyc(id, 'CCCD_BLURRY');
      setKycList((prev) => prev.filter((k) => k.id !== id));
      setSelectedUser(null);
      toast.info(t('toastRejected'));
    },
    [t]
  );

  return {
    kycList,
    selectedUser,
    setSelectedUser,
    isLoading,
    error,
    retry: fetchKyc,
    handleApprove,
    handleReject,
  };
}

