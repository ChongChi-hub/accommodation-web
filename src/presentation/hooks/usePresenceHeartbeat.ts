'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { ApiClient } from '@/infrastructure/http/api-client';

export function usePresenceHeartbeat() {
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const sendHeartbeat = async () => {
      try {
        await ApiClient.post('/users/heartbeat', { userId });
      } catch {
        // Best effort
      }
    };

    // Send immediately on mount / authentication
    void sendHeartbeat();

    // Periodic heartbeat every 20s
    timerRef.current = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void sendHeartbeat();
      }
    }, 20000);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void sendHeartbeat();
      }
    };

    const handleBeforeUnload = () => {
      try {
        const payload = JSON.stringify({ userId });
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon('/api/v1/users/offline', new Blob([payload], { type: 'application/json' }));
        } else {
          void fetch('/api/v1/users/offline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          });
        }
      } catch {
        // Best effort
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };
  }, [isAuthenticated, userId]);
}
