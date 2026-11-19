'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { ArrowLeftRight, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { DashboardBadges } from '@/domain/repositories/BadgeRepository';
import {
  formatShortName,
  getEffectiveRole,
  hasDualRole,
  resolveHome,
} from '@/presentation/utils/user-display';
import { toast } from '@/presentation/stores/toast.store';
import { buildSidebarSections } from './dashboard-sidebar-sections';
import { cn } from '@/lib/cn';

export interface DashboardSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isMobile = false, onClose }: DashboardSidebarProps) {
  const tMenu = useTranslations('userMenu');
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole, logout, switchRole } = useAuthStore();
  const [badges, setBadges] = useState<DashboardBadges | null>(null);
  const [pendingAppointments, setPendingAppointments] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const effectiveRole = getEffectiveRole(user, activeRole);
  const roleKey =
    effectiveRole === 'ADMIN'
      ? 'admin'
      : effectiveRole === 'MODERATOR'
      ? 'moderator'
      : effectiveRole === 'LANDLORD'
      ? 'landlord'
      : 'tenant';

  useEffect(() => {
    let mounted = true;

    const fetchBadges = () => {
      container.badge.badgeRepository
        .getBadges(roleKey, user?.id)
        .then((data) => {
          if (mounted) setBadges(data);
        })
        .catch(() => {});

      if (roleKey === 'landlord') {
        container.landlord.appointmentRepository
          .getSummary()
          .then((s) => {
            if (mounted) setPendingAppointments(s.totalPending);
          })
          .catch(() => {});
      }
    };

    fetchBadges();

    const interval = setInterval(fetchBadges, 15000);

    const handleCustomRefresh = () => fetchBadges();
    if (typeof window !== 'undefined') {
      window.addEventListener('cozynest:refresh-badges', handleCustomRefresh);
      window.addEventListener('focus', handleCustomRefresh);
    }

    return () => {
      mounted = false;
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('cozynest:refresh-badges', handleCustomRefresh);
        window.removeEventListener('focus', handleCustomRefresh);
      }
    };
  }, [roleKey, user?.id, pathname]);

  const sections = buildSidebarSections(roleKey, badges, pendingAppointments);
  const canSwitch = hasDualRole(user);
  const nextSwitchRole: 'TENANT' | 'LANDLORD' = roleKey === 'landlord' ? 'TENANT' : 'LANDLORD';
  const { shortName, fullName, isTruncated } = formatShortName(
    user?.fullName,
    14,
    tMenu('fallbackName')
  );

  const handleLogout = async () => {
    await logout();
    toast.success(tMenu('loggedOutToast'));
    if (isMobile && onClose) onClose();
    router.replace('/');
  };

  const collapsed = !isMobile && isCollapsed;

  const content = (
    <div className="flex flex-col h-full justify-between">
      <div className={cn('space-y-4', collapsed ? 'p-2' : 'p-4')}>
        {isMobile && (
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-sm font-bold text-primary dark:text-primary-300">{tMenu('dashboard')}</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {!isMobile && (
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-end')}>
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              aria-label={collapsed ? tMenu('dashboard') : tMenu('items.logout')}
              title={collapsed ? tMenu('dashboard') : undefined}
              className="p-1.5 rounded-lg border border-border bg-surface-muted text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}

        {!collapsed && (
          <div className="p-3 bg-surface-muted rounded-xl space-y-2 border border-border/60">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                {effectiveRole ? tMenu(`roleBadges.${effectiveRole}` as any) : tMenu('fallbackName')}
              </p>
              <p
                title={isTruncated ? fullName : undefined}
                className="text-xs font-semibold text-primary dark:text-primary-300 truncate mt-0.5"
              >
                {shortName}
              </p>
            </div>

            {canSwitch && (
              <button
                type="button"
                onClick={() => {
                  if (switchRole(nextSwitchRole)) {
                    if (isMobile && onClose) onClose();
                    toast.success(
                      tMenu('switchedToast', { role: tMenu(`roleBadges.${nextSwitchRole}` as any) })
                    );
                    router.push(resolveHome(user, nextSwitchRole) as any);
                  }
                }}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-border text-[11px] font-medium text-foreground hover:border-primary hover:text-primary dark:hover:text-primary-300 transition cursor-pointer"
              >
                <ArrowLeftRight className="w-3 h-3 text-foreground-muted shrink-0" />
                <span className="truncate">
                  {nextSwitchRole === 'LANDLORD' ? tMenu('switchToLandlord') : tMenu('switchToTenant')}
                </span>
              </button>
            )}
          </div>
        )}

        <nav className="space-y-5">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-foreground-muted/80">
                  {section.title}
                </h5>
              )}
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      onClick={isMobile ? onClose : undefined}
                      className={cn(
                        'flex items-center rounded-xl text-xs font-medium transition-all duration-150 group',
                        collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2',
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-950/60 text-primary dark:text-primary-300 font-semibold shadow-xs'
                          : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            'transition-colors shrink-0',
                            isActive
                              ? 'text-primary dark:text-primary-300'
                              : 'text-foreground-muted group-hover:text-foreground'
                          )}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && item.badge !== undefined && Number(item.badge) > 0 && (
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-1 ring-inset shrink-0',
                            item.badgeVariant === 'danger'
                              ? 'bg-danger-surface text-danger ring-danger-border'
                              : item.badgeVariant === 'warning'
                              ? 'bg-accent-50 text-accent-600 ring-accent-200 dark:bg-accent-500/20 dark:text-accent-300 dark:ring-accent-500/40'
                              : 'bg-primary-50 text-primary ring-primary-200 dark:bg-primary-950/60 dark:text-primary-300 dark:ring-primary-800'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className={cn('border-t border-border mt-4', collapsed ? 'p-2' : 'p-4')}>
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? tMenu('items.logout') : undefined}
          className={cn(
            'w-full flex items-center gap-2 rounded-xl text-xs font-medium text-danger hover:bg-danger-surface transition-colors cursor-pointer',
            collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{tMenu('items.logout')}</span>}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex print:hidden shrink-0 border-r border-border bg-surface flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {content}
    </aside>
  );
}
