'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { AdminReviewItem } from '@/domain/repositories/AdminRepository';
import { toast } from '@/presentation/stores/toast.store';

export function useAdminReviews() {
  const t = useTranslations('admin.reviews');
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
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
      setReviews([]);
      return;
    }

    try {
      const data = await container.admin.adminRepository.getReviews();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toggleVisibility = useCallback(
    async (id: number) => {
      await container.admin.adminRepository.toggleReviewVisibility(id);
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            const next = r.status === 'VISIBLE' ? ('HIDDEN' as const) : ('VISIBLE' as const);
            toast.info(
              t('toastStatus', {
                id,
                status: next === 'VISIBLE' ? t('statusVisible') : t('statusHidden'),
              })
            );
            return { ...r, status: next };
          }
          return r;
        })
      );
    },
    [t]
  );

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        r.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTab = activeTab === 'ALL' || r.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [reviews, searchTerm, activeTab]);

  return {
    reviews: filteredReviews,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    retry: fetchReviews,
    toggleVisibility,
  };
}

