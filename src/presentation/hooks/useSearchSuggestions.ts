'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HotAreaDto, RoomDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
} from '@/presentation/utils/recent-searches';

export function useSearchSuggestions(query: string, isOpen: boolean) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularAreas, setPopularAreas] = useState<HotAreaDto[]>([]);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || popularAreas.length > 0) return;
    let active = true;
    container.listing.listingRepository
      .getHotAreas(8, false)
      .then((res) => {
        if (active) setPopularAreas(res.slice(0, 6));
      })
      .catch(() => {
        // Silent for area chips when offline
      });
    return () => {
      active = false;
    };
  }, [isOpen, popularAreas.length]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!isOpen || trimmed.length < 2) {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      setRooms([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await container.listing.listingRepository.getRooms(
          { q: trimmed, size: 5 },
          controller.signal
        );
        if (!controller.signal.aborted) {
          setRooms(res.slice(0, 5));
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setRooms([]);
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'Network error');
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [query, isOpen, retryTick]);

  const recordSearch = useCallback((value: string) => {
    setRecentSearches(addRecentSearch(value));
  }, []);

  const clearHistory = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const retry = useCallback(() => {
    setRetryTick((n) => n + 1);
  }, []);

  return {
    recentSearches,
    popularAreas,
    rooms,
    isLoading,
    error,
    recordSearch,
    clearHistory,
    retry,
  };
}

