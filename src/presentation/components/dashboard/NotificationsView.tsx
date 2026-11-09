'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Bell, Calendar, CheckCheck, CreditCard, FileCheck } from 'lucide-react';
import { Notification } from '@/domain/entities/Notification';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { toast } from '@/presentation/stores/toast.store';
import { cn } from '@/lib/cn';

export function NotificationsView() {
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { user, hasHydrated, isAuthenticated } = useAuthStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!hasHydrated || !isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await container.notification.notificationRepository.getNotifications(user?.id, 50);
      setNotifications(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setIsLoading(false);
    }
  }, [hasHydrated, isAuthenticated, user?.id, tCommon]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await container.notification.notificationRepository.markAllAsRead(user?.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(tNotif('markAllSuccess'));
    } catch {
      toast.error(tNotif('errorTitle'));
    }
  };

  const handleOpen = async (item: Notification) => {
    if (!item.isRead) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      try {
        await container.notification.notificationRepository.markAsRead(item.id);
      } catch {
        // Non-blocking
      }
    }
    if (item.link) {
      router.push(item.link as any);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: Notification['type']) => {
    if (type === 'WARNING') return <CreditCard className="w-4 h-4 text-accent-600" />;
    if (type === 'ALERT') return <Bell className="w-4 h-4 text-danger" />;
    if (type === 'SUCCESS') return <FileCheck className="w-4 h-4 text-success" />;
    return <Calendar className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {tNotif('title')} {unreadCount > 0 ? `(${tNotif('newCount', { count: unreadCount })})` : ''}
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">{tNotif('pageSubtitle')}</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            onClick={handleMarkAllRead}
          >
            {tNotif('markAllRead')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title={tNotif('errorTitle')} message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState title={tNotif('emptyTitle')} description={tNotif('emptyDesc')} />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              interactive={Boolean(n.link)}
              onClick={() => void handleOpen(n)}
              className={cn(
                'p-4 flex items-start gap-3.5 transition-colors cursor-pointer',
                !n.isRead ? 'bg-primary-50/40 dark:bg-primary-950/25 border-primary/30' : 'bg-surface'
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-foreground">{n.title}</h3>
                  <span className="text-[11px] text-foreground-muted shrink-0">
                    {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed">{n.message}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

