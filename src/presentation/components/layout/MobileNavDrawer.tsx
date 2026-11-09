'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { ChevronDown, Search, X } from 'lucide-react';
import { HotAreaDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';
import { getNavItemsByGroup, NavVisibilityRole } from '@/shared/navigation';
import { getEffectiveRole, getHeaderCtaState } from '@/presentation/utils/user-display';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Logo } from './Logo';
import { MobileNavDrawerFooter } from './MobileNavDrawerFooter';
import { cn } from '@/lib/cn';

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function MobileNavDrawer({ isOpen, onClose, onOpenSearch }: MobileNavDrawerProps) {
  const tRoot = useTranslations();
  const tNav = useTranslations('header.nav');
  const tSearch = useTranslations('search');
  const tCta = useTranslations('header.cta');
  const pathname = usePathname();
  const { user, activeRole, isAuthenticated, logout } = useAuthStore();

  const [areasExpanded, setAreasExpanded] = useState(false);
  const [areas, setAreas] = useState<HotAreaDto[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const effectiveRole = getEffectiveRole(user, activeRole);
  const visRole: NavVisibilityRole = (effectiveRole || 'GUEST') as NavVisibilityRole;
  const categories = getNavItemsByGroup('topCategories', visRole);
  const primaries = getNavItemsByGroup('topPrimary', visRole);
  const ctaState = getHeaderCtaState(isAuthenticated ? user : null);

  useEffect(() => {
    if (!isOpen) return;
    container.listing.listingRepository
      .getHotAreas(8, false)
      .then((res) => setAreas(res.slice(0, 8)))
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const timer = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('button')?.focus();
    }, 20);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ctaLabel =
    ctaState.visible && ctaState.mode === 'applicant'
      ? tCta('landlordAppStatus', {
          status: tCta.has(`kycStatus.${ctaState.status}` as any)
            ? tCta(`kycStatus.${ctaState.status}` as any)
            : ctaState.status,
        })
      : ctaState.visible
      ? tRoot(ctaState.labelKey as any)
      : null;

  return (
    <div role="dialog" aria-modal="true" aria-label={tNav('openMenu')} className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current !== null && (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current < -60) {
            onClose();
          }
          touchStartX.current = null;
        }}
        className="relative z-10 w-80 max-w-[88vw] h-full bg-surface text-foreground border-r border-border flex flex-col justify-between overflow-y-auto"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <Logo variant="full" size="sm" />
            <button
              type="button"
              onClick={onClose}
              aria-label={tNav('closeMenu')}
              className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full border border-border bg-surface-muted text-xs text-foreground-muted hover:border-primary transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{tSearch('placeholder')}</span>
          </button>

          <nav className="space-y-1">
            {categories.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={cn(
                  'block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary dark:text-primary-300 font-semibold'
                    : 'text-foreground hover:bg-surface-muted'
                )}
              >
                {tRoot(item.labelKey as any)}
              </Link>
            ))}

            <div>
              <button
                type="button"
                aria-expanded={areasExpanded}
                onClick={() => setAreasExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-surface-muted cursor-pointer"
              >
                <span>{tNav('areas')}</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', areasExpanded && 'rotate-180')} />
              </button>
              {areasExpanded && (
                <div className="pl-3 pr-1 py-1 space-y-1">
                  {areas.map((a) => (
                    <Link
                      key={a.code}
                      href={`/rooms?provinceCode=${a.code}`}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-foreground-muted hover:text-foreground hover:bg-surface-muted"
                    >
                      <span>{a.name}</span>
                      <span className="text-[11px]">{a.roomCount}</span>
                    </Link>
                  ))}
                  <Link href="/rooms" onClick={onClose} className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-primary dark:text-primary-300">
                    {tNav('allAreas')}
                  </Link>
                </div>
              )}
            </div>

            {primaries.map((item) => (
              <Link key={item.id} href={item.href} onClick={onClose} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-surface-muted">
                {tRoot(item.labelKey as any)}
              </Link>
            ))}
          </nav>

          {ctaState.visible && ctaLabel && (
            <Link href={ctaState.href} onClick={onClose} className="block w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-800 transition-colors">
              {ctaLabel}
            </Link>
          )}
        </div>

        <MobileNavDrawerFooter
          user={user}
          effectiveRole={effectiveRole}
          isAuthenticated={isAuthenticated}
          onClose={onClose}
          onLogout={logout}
        />
      </div>
    </div>
  );
}
