'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/infrastructure/http/api-client';

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastActiveAt: string | null;
}

export function useUserPresence(userId?: string | null, pollIntervalMs = 5000) {
  const [presence, setPresence] = useState<UserPresence | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPresence = useCallback(async () => {
    if (!userId) {
      setPresence(null);
      return;
    }

    try {
      setIsLoading(true);
      const res = await ApiClient.get<{
        userId: string;
        online: boolean;
        isOnline?: boolean;
        lastActiveAt: string | null;
      }>(`/users/${encodeURIComponent(userId)}/presence`);

      if (res) {
        setPresence({
          userId: res.userId,
          isOnline: res.online ?? res.isOnline ?? false,
          lastActiveAt: res.lastActiveAt ?? null,
        });
      }
    } catch {
      // Keep previous presence or silent fallback
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void fetchPresence();

    const interval = setInterval(() => {
      void fetchPresence();
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [userId, fetchPresence, pollIntervalMs]);

  return { presence, isLoading, refetch: fetchPresence };
}

export function formatPresenceText(presence?: UserPresence | null): {
  isOnline: boolean;
  text: string;
} {
  if (!presence) {
    return { isOnline: false, text: 'Offline' };
  }
  if (presence.isOnline) {
    return { isOnline: true, text: 'Đang hoạt động' };
  }
  if (!presence.lastActiveAt) {
    return { isOnline: false, text: 'Offline' };
  }

  try {
    const diffMs = Math.max(0, Date.now() - new Date(presence.lastActiveAt).getTime());
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return { isOnline: false, text: 'Offline vừa xong' };
    if (diffMins < 60) return { isOnline: false, text: `Offline ${diffMins} phút trước` };
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return { isOnline: false, text: `Offline ${diffHours} giờ trước` };
    const diffDays = Math.floor(diffHours / 24);
    return { isOnline: false, text: `Offline ${diffDays} ngày trước` };
  } catch {
    return { isOnline: false, text: 'Offline' };
  }
}
