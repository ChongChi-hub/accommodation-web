'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import {
  ArrowLeftRight,
  ChevronRight,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import { User, UserRole } from '@/domain/entities/User';
import { getNavItemsByGroup, NavVisibilityRole } from '@/shared/navigation';
import { handleMenuKeyDown } from '@/presentation/utils/menu-keyboard';
import { getProfileRoute, hasDualRole, resolveHome } from '@/presentation/utils/user-display';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Badge } from '@/presentation/components/ui/Badge';
import { ThemePreferenceControl } from './ThemePreferenceControl';
import { cn } from '@/lib/cn';

interface UserMenuPanelProps {
  user: User;
  effectiveRole: UserRole;
  unreadNotifications: number;
  unreadMessages: number;
  onClose: () => void;
  onSwitchRole: (nextRole: 'TENANT' | 'LANDLORD') => void;
  onLogout: () => void;
}

export function UserMenuPanel({
  user,
  effectiveRole,
  unreadNotifications,
  unreadMessages,
  onClose,
  onSwitchRole,
  onLogout,
}: UserMenuPanelProps) {
  const tRoot = useTranslations();
  const tMenu = useTranslations('userMenu');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const navRole = effectiveRole as NavVisibilityRole;
  const roleActions = getNavItemsByGroup('userRoleActions', navRole).slice(0, 5);
  const accountActions = getNavItemsByGroup('userAccountActions', navRole);
  const dashboardHref = resolveHome(user, effectiveRole);
  const profileHref = getProfileRoute(effectiveRole);
  const canSwitch = hasDualRole(user);
  const nextSwitchRole: 'TENANT' | 'LANDLORD' = effectiveRole === 'LANDLORD' ? 'TENANT' : 'LANDLORD';

  const getBadgeCount = (badgeType?: string) => {
    if (badgeType === 'notifications' && unreadNotifications > 0) return unreadNotifications;
    if (badgeType === 'messages' && unreadMessages > 0) return unreadMessages;
    return 0;
  };

  const switchLocale = (targetLocale: 'vi' | 'en') => {
    if (targetLocale === locale) return;
    router.replace(pathname as any, { locale: targetLocale });
    onClose();
  };

  return (
    <div
      role="menu"
      aria-label={user.fullName}
      onKeyDown={handleMenuKeyDown}
      data-testid="user-menu-panel"
      className={cn(
        'hdr-popover-panel fixed inset-x-0 bottom-0 sm:inset-auto sm:absolute sm:right-0 sm:mt-2 sm:w-[320px] max-h-[85vh] overflow-y-auto',
        'rounded-t-3xl sm:rounded-2xl border border-border bg-surface text-foreground shadow-2xl p-3 z-50 space-y-2.5'
      )}
    >
      <div className="flex items-start gap-3 p-2 rounded-xl bg-surface-muted/70 border border-border/60">
        <Avatar size="lg" src={user.avatarUrl} name={user.fullName} />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-xs font-bold text-foreground truncate">{user.fullName}</p>
          <p className="text-[11px] text-foreground-muted truncate">{user.email}</p>
          <div className="flex items-center justify-between gap-2 pt-1">
            <Badge variant="primary" size="sm">
              {tMenu(`roleBadges.${effectiveRole}` as any)}
            </Badge>
            <Link
              href={profileHref}
              role="menuitem"
              onClick={onClose}
              className="text-[11px] font-semibold text-primary dark:text-primary-300 hover:underline rounded"
            >
              {tMenu('viewProfile')}
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
          {tMenu('groups.workspace')}
        </p>
        <Link
          href={dashboardHref}
          role="menuitem"
          onClick={onClose}
          className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors"
        >
          <span className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-primary dark:text-primary-300" />
            <span>{tMenu('dashboard')}</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-foreground-muted" />
        </Link>

        {canSwitch && (
          <button
            type="button"
            role="menuitem"
            data-testid="user-menu-switch-role"
            onClick={() => onSwitchRole(nextSwitchRole)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-primary dark:text-primary-300 bg-primary-50/70 dark:bg-primary-950/50 hover:bg-primary-100/80 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <ArrowLeftRight className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {nextSwitchRole === 'LANDLORD' ? tMenu('switchToLandlord') : tMenu('switchToTenant')}
              </span>
            </span>
          </button>
        )}
      </div>

      {roleActions.length > 0 && (
        <div className="space-y-0.5 pt-1 border-t border-border/70">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
            {tMenu('groups.roleActions')}
          </p>
          {roleActions.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              role="menuitem"
              onClick={onClose}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-foreground hover:bg-surface-muted transition-colors"
            >
              <span className="truncate">{tRoot(item.labelKey as any)}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-0.5 pt-1 border-t border-border/70">
        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
          {tMenu('groups.account')}
        </p>
        {accountActions.map((item) => {
          const count = getBadgeCount(item.badgeType);
          return (
            <Link
              key={item.id}
              href={item.href}
              role="menuitem"
              onClick={onClose}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-foreground hover:bg-surface-muted transition-colors"
            >
              <span className="truncate">{tRoot(item.labelKey as any)}</span>
              {count > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger-surface text-danger">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="space-y-2.5 pt-2 px-1 border-t border-border/70">
        <ThemePreferenceControl />
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground-muted">
            <Globe className="w-3.5 h-3.5" />
            <span>{tMenu('language.label')}</span>
          </span>
          <div className="inline-flex p-0.5 rounded-lg bg-surface-muted border border-border/80">
            {(['vi', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => switchLocale(lang)}
                className={cn(
                  'px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer',
                  locale === lang
                    ? 'bg-surface text-primary dark:text-primary-300 shadow-xs'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                {tMenu(`language.${lang}` as any)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border space-y-1">
        <Link
          href="/support"
          role="menuitem"
          onClick={onClose}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
        >
          <LifeBuoy className="w-4 h-4 shrink-0" />
          <span>{tMenu('items.help')}</span>
        </Link>
        <button
          type="button"
          role="menuitem"
          data-testid="user-menu-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-danger-surface border border-transparent hover:border-danger-border transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{tMenu('items.logout')}</span>
        </button>
      </div>
    </div>
  );
}
