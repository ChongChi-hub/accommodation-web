'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import {
  KycModerationListItem,
  KycModerationDetail,
  KycStatus,
} from '@/domain/entities/LandlordKyc';
import { toast } from '@/presentation/stores/toast.store';

export function useAdminKyc() {
  const t = useTranslations('kyc');
  const [kycList, setKycList] = useState<KycModerationListItem[]>([]);
  const [selectedKyc, setSelectedKyc] = useState<KycModerationDetail | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKycList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await container.kyc.kycModerationUseCases.getModerationList({
        status: statusFilter,
        page: 0,
        size: 50,
      });
      setKycList(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching KYC requests');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchKycList();
  }, [fetchKycList]);

  const selectKyc = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const detail = await container.kyc.kycModerationUseCases.getModerationDetail(id);
      setSelectedKyc(detail);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error loading KYC details');
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const handleApprove = useCallback(
    async (id: string, version: number) => {
      try {
        await container.kyc.kycModerationUseCases.approve(id, version);
        setKycList((prev) => prev.filter((k) => k.id !== id));
        setSelectedKyc(null);
        toast.success(t('moderationApproveSuccess'));
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error approving KYC');
      }
    },
    [t]
  );

  const handleReject = useCallback(
    async (id: string, reasonCode: string, reasonNote: string, version: number) => {
      try {
        await container.kyc.kycModerationUseCases.reject(id, reasonCode, reasonNote, version);
        setKycList((prev) => prev.filter((k) => k.id !== id));
        setSelectedKyc(null);
        toast.info(t('moderationRejectSuccess'));
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error rejecting KYC');
      }
    },
    [t]
  );

  return {
    kycList,
    selectedKyc,
    setSelectedKyc,
    selectKyc,
    statusFilter,
    setStatusFilter,
    isLoading,
    isLoadingDetail,
    error,
    retry: fetchKycList,
    handleApprove,
    handleReject,
  };
}
