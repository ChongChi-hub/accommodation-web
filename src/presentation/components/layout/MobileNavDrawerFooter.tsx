'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Globe, LayoutDashboard, LogOut } from 'lucide-react';
import { User, UserRole } from '@/domain/entities/User';
import { resolveHome } from '@/presentation/utils/user-display';
import { toast } from '@/presentation/stores/toast.store';
import { ThemePreferenceControl } from './ThemePreferenceControl';

interface MobileNavDrawerFooterProps {
  user: User | null;
  effectiveRole: UserRole | null;
  isAuthenticated: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
}

export function MobileNavDrawerFooter({
  user,
  effectiveRole,
  isAuthenticated,
  onClose,
  onLogout,
}: MobileNavDrawerFooterProps) {
  const tAuth = useTranslations('nav');
  const tMenu = useTranslations('userMenu');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="p-4 border-t border-border space-y-3 bg-surface-muted/40">
      <ThemePreferenceControl />
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted">
          <Globe className="w-3.5 h-3.5" />
          <span>{tMenu('language.label')}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            router.replace(pathname as any, { locale: locale === 'vi' ? 'en' : 'vi' });
            onClose();
          }}
          className="px-2.5 py-1 rounded-lg border border-border bg-surface text-xs font-semibold uppercase cursor-pointer"
        >
          {locale}
        </button>
      </div>

      {isAuthenticated && user ? (
        <div className="space-y-2 pt-2 border-t border-border">
          <Link
            href={resolveHome(user, effectiveRole)}
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary dark:text-primary-300 text-xs font-semibold"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{tMenu('dashboard')}</span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              onClose();
              await onLogout();
              toast.success(tMenu('loggedOutToast'));
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-danger-surface cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{tMenu('items.logout')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <Link
            href="/login"
            onClick={onClose}
            className="text-center py-2 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-surface-muted"
          >
            {tAuth('login')}
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className="text-center py-2 px-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-800"
          >
            {tAuth('register')}
          </Link>
        </div>
      )}
    </div>
  );
}

