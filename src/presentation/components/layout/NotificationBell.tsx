'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { AlertCircle, Bell, Building2, Calendar, CheckCheck, CreditCard, FileText, ShieldCheck, Trash2 } from 'lucide-react';
import { Notification } from '@/domain/entities/Notification';
import { UserRole } from '@/domain/entities/User';
import { container } from '@/infrastructure/di/container';
import {
  cleanNotificationText,
  formatNotificationTime,
  getNotificationCategory,
  getNotificationsRoute,
  resolveNotificationLink,
  type NotificationCategory,
} from '@/presentation/utils/user-display';
import { toast } from '@/presentation/stores/toast.store';
import { cn } from '@/lib/cn';

export interface NotificationBellProps {
  userId?: string;
  effectiveRole: UserRole | null;
  hasHydrated: boolean;
  isAuthenticated: boolean;
  onHeroTop?: boolean;
}

function getNotifIcon(category: NotificationCategory, isRead: boolean) {
  const cls = cn('w-4 h-4 shrink-0 mt-0.5', isRead ? 'text-foreground-muted' : 'text-primary dark:text-primary-300');
  switch (category) {
    case 'APPOINTMENT': return <Calendar className={cls} />;
    case 'RENTAL_REQUEST': return <Building2 className={cls} />;
    case 'CONTRACT': return <FileText className={cls} />;
    case 'INVOICE': return <CreditCard className={cls} />;
    case 'KYC': return <ShieldCheck className={cls} />;
    default: return <Bell className={cls} />;
  }
}

export function NotificationBell({ userId, effectiveRole, hasHydrated, isAuthenticated, onHeroTop = false }: NotificationBellProps) {
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
        container.notification.notificationRepository.getNotifications(userId, 6),
        container.notification.notificationRepository.getUnreadCount(userId),
      ]);
      setItems(list.slice(0, 6));
      setUnreadCount(count);
    } catch {
      setHasError(true);
    }
  }, [hasHydrated, isAuthenticated, userId]);

  useEffect(() => {
    void loadNotifications();
    const handleBadgeRefresh = () => void loadNotifications();
    if (typeof window !== 'undefined') window.addEventListener('cozynest:refresh-badges', handleBadgeRefresh);
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) void loadNotifications();
    }, 15000);
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') window.removeEventListener('cozynest:refresh-badges', handleBadgeRefresh);
    };
  }, [loadNotifications]);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
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
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cozynest:refresh-badges'));
    } catch {
      toast.error(tNotif('errorTitle'));
    }
  };

  const handleDeleteItem = async (notif: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((n) => n.id !== notif.id));
    if (!notif.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await container.notification.notificationRepository.deleteNotification?.(notif.id);
      toast.success(tNotif('deleteSuccess'));
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cozynest:refresh-badges'));
    } catch {
      toast.error(tNotif('errorTitle'));
      void loadNotifications();
    }
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.isRead) {
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await container.notification.notificationRepository.markAsRead(notif.id);
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cozynest:refresh-badges'));
      } catch { /* Non-blocking */ }
    }
    setIsOpen(false);
    const targetLink = resolveNotificationLink(notif.link, effectiveRole);
    if (targetLink) router.push(targetLink as any);
  };

  if (!hasHydrated || !isAuthenticated) return null;

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
        className={cn('relative p-2 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', onHeroTop ? 'text-nav-on-hero hover:bg-white/15' : 'text-nav-muted hover:text-nav-ink hover:bg-surface-muted')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span data-testid="notif-unread-badge" className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div role="dialog" aria-label={tNotif('title')} className="hdr-popover-panel absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-surface text-foreground shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{tNotif('title')}</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/70 text-primary dark:text-primary-300">
                  {tNotif('newCount', { count: unreadCount })}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-primary-300 hover:underline cursor-pointer">
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{tNotif('markAllRead')}</span>
              </button>
            )}
          </div>

          <div className="py-2 max-h-80 overflow-y-auto divide-y divide-border/60">
            {hasError ? (
              <div className="flex items-center gap-2 py-6 px-2 text-xs text-danger"><AlertCircle className="w-4 h-4 shrink-0" /><span>{tNotif('errorTitle')}</span></div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center space-y-1"><p className="text-xs font-semibold text-foreground">{tNotif('emptyTitle')}</p><p className="text-[11px] text-foreground-muted">{tNotif('emptyDesc')}</p></div>
            ) : (
              items.map((n) => {
                const { title, message } = cleanNotificationText(n.title, n.message);
                const timeAgo = formatNotificationTime(n.createdAt);
                const category = getNotificationCategory({ title, message, link: n.link, type: n.type });
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); void handleItemClick(n); } }}
                    className={cn('group w-full text-left py-2.5 px-2.5 flex items-start gap-3 rounded-xl transition-colors cursor-pointer', n.isRead ? 'hover:bg-surface-muted/60 opacity-85' : 'bg-primary-50/60 dark:bg-primary-950/30 hover:bg-primary-50 dark:hover:bg-primary-950/50')}
                  >
                    <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center shrink-0 mt-0.5 border border-border/70 shadow-2xs">
                      {getNotifIcon(category, n.isRead)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug flex-1">{title}</h4>
                        {timeAgo && <span className="text-[10px] text-foreground-muted shrink-0 whitespace-nowrap pt-0.5">{timeAgo}</span>}
                      </div>
                      <p className="text-[11px] text-foreground-muted line-clamp-2 mt-1 leading-relaxed">{message}</p>
                    </div>
                    <button
                      type="button"
                      title={tNotif('btnDelete')}
                      aria-label={tNotif('btnDelete')}
                      onClick={(e) => void handleDeleteItem(n, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-foreground-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer shrink-0 mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-border text-center">
            <Link href={getNotificationsRoute(effectiveRole)} onClick={() => setIsOpen(false)} className="block py-1 text-[11px] font-semibold text-primary dark:text-primary-300 hover:underline">
              {tNotif('viewAll')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
