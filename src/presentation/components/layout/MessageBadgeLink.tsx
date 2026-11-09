'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MessageSquare } from 'lucide-react';
import { UserRole } from '@/domain/entities/User';
import { container } from '@/infrastructure/di/container';
import { getMessagesRoute } from '@/presentation/utils/user-display';
import { cn } from '@/lib/cn';

export interface MessageBadgeLinkProps {
  userId?: string;
  effectiveRole: UserRole | null;
  hasHydrated: boolean;
  isAuthenticated: boolean;
  onHeroTop?: boolean;
}

export function MessageBadgeLink({
  userId,
  effectiveRole,
  hasHydrated,
  isAuthenticated,
  onHeroTop = false,
}: MessageBadgeLinkProps) {
  const tAria = useTranslations('header.aria');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const href = getMessagesRoute(effectiveRole);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !href) return;
    let active = true;
    const repo = container.notification.notificationRepository;
    if (!repo.getUnreadMessageCount) return;
    repo
      .getUnreadMessageCount(userId)
      .then((count) => {
        if (active) setUnreadMessages(count);
      })
      .catch(() => {
        // Ignore silent badge error
      });
    return () => {
      active = false;
    };
  }, [hasHydrated, isAuthenticated, href, userId]);

  if (!hasHydrated || !isAuthenticated || !href) {
    return null;
  }

  return (
    <Link
      href={href}
      aria-label={tAria('messages')}
      className={cn(
        'relative p-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        onHeroTop
          ? 'text-nav-on-hero hover:bg-white/15'
          : 'text-nav-muted hover:text-nav-ink hover:bg-surface-muted'
      )}
    >
      <MessageSquare className="w-5 h-5" />
      {unreadMessages > 0 && (
        <span
          data-testid="msg-unread-badge"
          className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface"
        >
          {unreadMessages > 99 ? '99+' : unreadMessages}
        </span>
      )}
    </Link>
  );
}

