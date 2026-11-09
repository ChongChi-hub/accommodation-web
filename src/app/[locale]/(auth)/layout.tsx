import React from 'react';
import { AuthPanelProvider } from '@/presentation/components/auth/AuthPanelContext';
import { AuthShell } from '@/presentation/components/auth/AuthShell';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthPanelProvider>
      <AuthShell>{children}</AuthShell>
    </AuthPanelProvider>
  );
}

