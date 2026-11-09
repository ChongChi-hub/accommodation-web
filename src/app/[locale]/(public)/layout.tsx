'use client';

import React from 'react';
import { Header } from '@/presentation/components/layout/Header';
import { Footer } from '@/presentation/components/layout/Footer';
import { HeaderHeroProvider, useHeaderHero } from '@/presentation/contexts/HeaderHeroContext';

function PublicShell({ children }: { children: React.ReactNode }) {
  const { hasHero } = useHeaderHero();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {!hasHero && <div aria-hidden="true" className="h-16 lg:h-[72px] shrink-0" />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <HeaderHeroProvider>
      <PublicShell>{children}</PublicShell>
    </HeaderHeroProvider>
  );
}
