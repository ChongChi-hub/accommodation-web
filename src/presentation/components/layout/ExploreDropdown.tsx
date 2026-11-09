'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { ChevronDown } from 'lucide-react';
import { NavItemConfig } from '@/shared/navigation';
import { APP_ROUTES } from '@/shared/routes';
import { cn } from '@/lib/cn';

export interface ExploreDropdownProps {
  items: Array<NavItemConfig & { href: string }>;
  onHeroTop: boolean;
}

export function ExploreDropdown({ items, onHeroTop }: ExploreDropdownProps) {
  const tRoot = useTranslations();
  const tNav = useTranslations('header.nav');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAtRef = useRef<number>(0);

  const isAnyActive = items.some((item) => pathname === item.href);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const clearTimers = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleToggleClick = () => {
    clearTimers();
    if (isOpen && Date.now() - hoverOpenedAtRef.current < 350) {
      hoverOpenedAtRef.current = 0;
      return;
    }
    hoverOpenedAtRef.current = 0;
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={() => {
        clearTimers();
        openTimerRef.current = setTimeout(() => {
          hoverOpenedAtRef.current = Date.now();
          setIsOpen(true);
        }, 120);
      }}
      onMouseLeave={() => {
        clearTimers();
        closeTimerRef.current = setTimeout(() => {
          hoverOpenedAtRef.current = 0;
          setIsOpen(false);
        }, 150);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={handleToggleClick}
        className={cn(
          'inline-flex items-center gap-1 py-2 text-[13px] 2xl:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isAnyActive ? 'font-semibold' : '',
          onHeroTop
            ? 'text-nav-on-hero/95 hover:text-white'
            : isAnyActive
            ? 'text-primary dark:text-primary-300'
            : 'text-nav-ink hover:text-primary dark:hover:text-primary-300'
        )}
      >
        <span>{tNav('explore')}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="hdr-popover-panel absolute left-0 top-full mt-2 w-56 rounded-2xl border border-border bg-surface text-foreground shadow-xl p-2 z-50 space-y-0.5"
        >
          {items.map((item) => {
            const active = pathname === APP_ROUTES[item.routeKey];
            return (
              <Link
                key={item.id}
                href={item.href}
                role="menuitem"
                aria-current={active ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                  active
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary dark:text-primary-300 font-semibold'
                    : 'text-foreground hover:bg-surface-muted'
                )}
              >
                {tRoot(item.labelKey as any)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
