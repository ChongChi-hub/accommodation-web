'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Menu, Search } from 'lucide-react';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { getEffectiveRole } from '@/presentation/utils/user-display';
import { applyThemePreference, getStoredThemePreference } from '@/presentation/utils/theme-preference';
import { Logo } from './Logo';
import { CommandPalette } from './CommandPalette';
import { NotificationBell } from './NotificationBell';
import { MessageBadgeLink } from './MessageBadgeLink';
import { UserMenu } from './UserMenu';

export interface DashboardHeaderProps {
  onToggleMobileSidebar: () => void;
}

export function DashboardHeader({ onToggleMobileSidebar }: DashboardHeaderProps) {
  const tAuto = useTranslations('autoI18n');
  const tNav = useTranslations('header.nav');
  const tSearch = useTranslations('search');
  const { user, activeRole, isAuthenticated, hasHydrated } = useAuthStore();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const effectiveRole = getEffectiveRole(user, activeRole);

  useEffect(() => {
    applyThemePreference(getStoredThemePreference());
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border header-frosted">
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-nav-muted hover:text-nav-ink hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label={tNav('openMenu')}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Logo variant="full" size="sm" />
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-full border border-border bg-surface-muted/60 hover:bg-surface-muted text-foreground-muted hover:text-foreground text-xs transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tSearch('placeholder')}</span>
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-surface border border-border text-foreground-muted">
                {tAuto('k0533')}
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              className="md:hidden p-2 rounded-xl text-nav-muted hover:text-nav-ink hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label={tSearch('mobileTitle')}
            >
              <Search className="w-5 h-5" />
            </button>

            <MessageBadgeLink
              userId={user?.id}
              effectiveRole={effectiveRole}
              hasHydrated={hasHydrated}
              isAuthenticated={isAuthenticated}
            />
            <NotificationBell
              userId={user?.id}
              effectiveRole={effectiveRole}
              hasHydrated={hasHydrated}
              isAuthenticated={isAuthenticated}
            />
            <UserMenu />
          </div>
        </div>
      </header>

      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
    </>
  );
}
