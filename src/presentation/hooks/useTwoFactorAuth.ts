'use client';

import { useState, useEffect, useCallback } from 'react';
import { container } from '@/infrastructure/di/container';
import { TwoFactorSetupData, TwoFactorStatus } from '@/domain/entities/TwoFactor';

export function useTwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [isSettingUpPending, setIsSettingUpPending] = useState(false);
  const [isVerifyingPending, setIsVerifyingPending] = useState(false);
  const [isDisablingPending, setIsDisablingPending] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await container.twoFactor.twoFactorRepository.getStatus();
      setIsEnabled(res?.isEnabled ?? false);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const setupMutation = {
    data: setupData,
    isPending: isSettingUpPending,
    mutateAsync: async (): Promise<TwoFactorSetupData> => {
      setIsSettingUpPending(true);
      try {
        const data = await container.twoFactor.twoFactorRepository.setup();
        setSetupData(data);
        return data;
      } finally {
        setIsSettingUpPending(false);
      }
    },
  };

  const verifyMutation = {
    isPending: isVerifyingPending,
    mutateAsync: async (code: string): Promise<TwoFactorStatus> => {
      setIsVerifyingPending(true);
      try {
        const res = await container.twoFactor.twoFactorRepository.verify(code);
        setIsEnabled(res.isEnabled);
        return res;
      } finally {
        setIsVerifyingPending(false);
      }
    },
  };

  const disableMutation = {
    isPending: isDisablingPending,
    mutateAsync: async (code: string): Promise<TwoFactorStatus> => {
      setIsDisablingPending(true);
      try {
        const res = await container.twoFactor.twoFactorRepository.disable(code);
        setIsEnabled(res.isEnabled);
        setSetupData(null);
        return res;
      } finally {
        setIsDisablingPending(false);
      }
    },
  };

  return {
    isEnabled,
    isLoading,
    error,
    setupMutation,
    verifyMutation,
    disableMutation,
    refetch: fetchStatus,
  };
}
