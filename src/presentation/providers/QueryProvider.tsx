'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePresenceHeartbeat } from '@/presentation/hooks/usePresenceHeartbeat';

function PresenceHeartbeatRunner() {
  usePresenceHeartbeat();
  return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PresenceHeartbeatRunner />
      {children}
    </QueryClientProvider>
  );
}
