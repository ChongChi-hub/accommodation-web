'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { AlertCircle, Bell, CheckCheck, CheckCircle2 } from 'lucide-react';
import { Notification } from '@/domain/entities/Notification';
import { UserRole } from '@/domain/entities/User';
import { container } from '@/infrastructure/di/container';
import { getNotificationsRoute } from '@/presentation/utils/user-display';
import { toast } from '@/presentation/stores/toast.store';
import { cn } from '@/lib/cn';

export interface NotificationBellProps {
  userId?: string;
  effectiveRole: UserRole | null;
  hasHydrated: boolean;
  isAuthenticated: boolean;
  onHeroTop?: boolean;
}

export function NotificationBell({
  userId,
  effectiveRole,
  hasHydrated,
  isAuthenticated,
  onHeroTop = false,
}: NotificationBellProps) {
  const tNotif = useTranslations('notifications');
  const tAria = useTranslations('header.aria');
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!hasHydrated || !isAuthenticated) return;
    setHasError(false);
    try {
      const [list, count] = await Promise.all([
        container.notification.notificationRepository.getNotifications(userId, 5),
        container.notification.notificationRepository.getUnreadCount(userId),
      ]);
      setItems(list.slice(0, 5));
      setUnreadCount(count);
    } catch {
      setHasError(true);
    }
  }, [hasHydrated, isAuthenticated, userId]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
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

  const handleMarkAllRead = async () => {
    try {
      await container.notification.notificationRepository.markAllAsRead(userId);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success(tNotif('markAllSuccess'));
    } catch {
      toast.error(tNotif('errorTitle'));
    }
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.isRead) {
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await container.notification.notificationRepository.markAsRead(notif.id);
      } catch {
        // Non-blocking
      }
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link as any);
    }
  };

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={tAria('notifications')}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) void loadNotifications();
        }}
        className={cn(
          'relative p-2 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          onHeroTop
            ? 'text-nav-on-hero hover:bg-white/15'
            : 'text-nav-muted hover:text-nav-ink hover:bg-surface-muted'
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            data-testid="notif-unread-badge"
            className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={tNotif('title')}
          className="hdr-popover-panel absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-surface text-foreground shadow-2xl p-4 z-50"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {tNotif('title')}
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/70 text-primary dark:text-primary-300">
                  {tNotif('newCount', { count: unreadCount })}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-primary-300 hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{tNotif('markAllRead')}</span>
              </button>
            )}
          </div>

          <div className="py-2 max-h-72 overflow-y-auto divide-y divide-border/60">
            {hasError ? (
              <div className="flex items-center gap-2 py-6 px-2 text-xs text-danger">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{tNotif('errorTitle')}</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs font-semibold text-foreground">{tNotif('emptyTitle')}</p>
                <p className="text-[11px] text-foreground-muted">{tNotif('emptyDesc')}</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className={cn(
                    'w-full text-left py-2.5 px-2 flex items-start gap-2.5 rounded-xl transition-colors cursor-pointer',
                    n.isRead
                      ? 'hover:bg-surface-muted/60 opacity-85'
                      : 'bg-primary-50/60 dark:bg-primary-950/30 hover:bg-primary-50 dark:hover:bg-primary-950/50'
                  )}
                >
                  <CheckCircle2
                    className={cn(
                      'w-4 h-4 shrink-0 mt-0.5',
                      n.isRead ? 'text-foreground-muted' : 'text-primary dark:text-primary-300'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                    <p className="text-[11px] text-foreground-muted line-clamp-2 mt-0.5">{n.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-border text-center">
            <Link
              href={getNotificationsRoute(effectiveRole)}
              onClick={() => setIsOpen(false)}
              className="block py-1 text-[11px] font-semibold text-primary dark:text-primary-300 hover:underline"
            >
              {tNotif('viewAll')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

