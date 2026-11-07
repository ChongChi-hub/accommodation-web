'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export interface AdminAnalyticsData {
  successRate: number;
  avgTimeToFillDays: number;
  totalSearches: number;
  topAreas: Array<{
    id: string;
    key: 'areaCauGiay' | 'areaDongDa' | 'areaBinhThanh';
    percent: number;
  }>;
}

export function useAdminAnalytics() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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
      setData(null);
      return;
    }

    try {
      setData({
        successRate: 74.5,
        avgTimeToFillDays: 4.2,
        totalSearches: 128000,
        topAreas: [
          { id: '1', key: 'areaCauGiay', percent: 38 },
          { id: '2', key: 'areaDongDa', percent: 24 },
          { id: '3', key: 'areaBinhThanh', percent: 19 },
        ],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    retry: fetchData,
  };
}

