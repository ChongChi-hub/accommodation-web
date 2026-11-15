'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { TwoFactorSetupData, TwoFactorStatus } from '@/domain/entities/TwoFactor';

export function useTwoFactorAuth() {
  const queryClient = useQueryClient();

  const { data: status, isLoading, error } = useQuery<TwoFactorStatus>({
    queryKey: ['two-factor-status'],
    queryFn: () => container.twoFactor.twoFactorRepository.getStatus(),
    staleTime: 60_000,
  });

  const setupMutation = useMutation<TwoFactorSetupData>({
    mutationFn: () => container.twoFactor.twoFactorRepository.setup(),
  });

  const verifyMutation = useMutation<TwoFactorStatus, Error, string>({
    mutationFn: (code: string) => container.twoFactor.twoFactorRepository.verify(code),
    onSuccess: (newStatus) => {
      queryClient.setQueryData(['two-factor-status'], newStatus);
    },
  });

  const disableMutation = useMutation<TwoFactorStatus, Error, string>({
    mutationFn: (code: string) => container.twoFactor.twoFactorRepository.disable(code),
    onSuccess: (newStatus) => {
      queryClient.setQueryData(['two-factor-status'], newStatus);
    },
  });

  return {
    isEnabled: status?.isEnabled ?? false,
    isLoading,
    error,
    setupMutation,
    verifyMutation,
    disableMutation,
  };
}
