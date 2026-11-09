'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import {
  formatShortName,
  getEffectiveRole,
  resolveHome,
} from '@/presentation/utils/user-display';
import { toast } from '@/presentation/stores/toast.store';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { UserMenuPanel } from './UserMenuPanel';
import { cn } from '@/lib/cn';

export interface UserMenuProps {
  onHeroTop?: boolean;
}

export function UserMenu({ onHeroTop = false }: UserMenuProps) {
  const tMenu = useTranslations('userMenu');
  const tAria = useTranslations('header.aria');
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole, isAuthenticated, hasHydrated, switchRole, logout } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSheet, setIsMobileSheet] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalPanelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const effectiveRole = getEffectiveRole(user, activeRole);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsMobileSheet(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen || !hasHydrated || !isAuthenticated) return;
    const repo = container.notification.notificationRepository;
    void repo.getUnreadCount(user?.id).then(setUnreadNotifications).catch(() => {});
    if (effectiveRole === 'TENANT' || effectiveRole === 'LANDLORD') {
      void repo.getUnreadMessageCount?.(user?.id).then(setUnreadMessages).catch(() => {});
    }
  }, [isOpen, hasHydrated, isAuthenticated, user?.id, effectiveRole]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!portalPanelRef.current || !portalPanelRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  if (!hasHydrated) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'h-9 w-36 rounded-full animate-pulse shrink-0',
          onHeroTop ? 'bg-white/20' : 'bg-surface-muted'
        )}
      />
    );
  }

  if (!isAuthenticated || !user || !effectiveRole) {
    return null;
  }

  const { shortName, fullName, isTruncated } = formatShortName(
    user.fullName,
    14,
    tMenu('fallbackName')
  );

  const handleSwitchRole = (nextRole: 'TENANT' | 'LANDLORD') => {
    const ok = switchRole(nextRole);
    if (!ok) return;
    setIsOpen(false);
    const roleLabel = tMenu(`roleBadges.${nextRole}` as any);
    toast.success(tMenu('switchedToast', { role: roleLabel }));
    router.push(resolveHome(user, nextRole) as any);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    toast.success(tMenu('loggedOutToast'));
    if (pathname.startsWith('/dashboard')) {
      router.replace('/');
    }
  };

  const panelNode = (
    <UserMenuPanel
      user={user}
      effectiveRole={effectiveRole}
      unreadNotifications={unreadNotifications}
      unreadMessages={unreadMessages}
      onClose={() => setIsOpen(false)}
      onSwitchRole={handleSwitchRole}
      onLogout={handleLogout}
    />
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        data-testid="user-menu-trigger"
        aria-label={tAria('accountMenu')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={isTruncated ? fullName : undefined}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-2 pl-1 pr-2.5 h-9 rounded-full border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          onHeroTop
            ? 'border-white/30 bg-white/15 text-white hover:bg-white/25'
            : 'border-border bg-surface text-foreground hover:bg-surface-muted'
        )}
      >
        <Avatar size="md" src={user.avatarUrl} name={fullName} />
        <span className="text-xs font-semibold whitespace-nowrap hidden sm:inline">{shortName}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 opacity-80 transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen &&
        (isMobileSheet && typeof document !== 'undefined'
          ? createPortal(
              <div ref={portalPanelRef} className="fixed inset-0 z-50">
                <div
                  className="fixed inset-0 bg-black/45 backdrop-blur-xs"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />
                {panelNode}
              </div>,
              document.body
            )
          : panelNode)}
    </div>
  );
}
