'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { getNavItemsByGroup, NavVisibilityRole } from '@/shared/navigation';
import { AreaDropdown } from './AreaDropdown';
import { ExploreDropdown } from './ExploreDropdown';
import { cn } from '@/lib/cn';

export interface HeaderNavProps {
  role: NavVisibilityRole;
  onHeroTop: boolean;
}

export function HeaderNav({ role, onHeroTop }: HeaderNavProps) {
  const tRoot = useTranslations();
  const tAria = useTranslations('header.aria');
  const pathname = usePathname();
  const categories = useMemo(() => getNavItemsByGroup('topCategories', role), [role]);
  const primaries = useMemo(() => getNavItemsByGroup('topPrimary', role), [role]);

  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  });

  useEffect(() => {
    const activeItem = [...categories, ...primaries].find((item) => pathname === item.href);
    const activeEl = activeItem ? linkRefs.current[activeItem.id] : null;
    const containerEl = navRef.current;
    if (activeEl && containerEl && activeEl.offsetWidth > 0) {
      const elRect = activeEl.getBoundingClientRect();
      const parentRect = containerEl.getBoundingClientRect();
      setIndicator({
        left: elRect.left - parentRect.left,
        width: elRect.width,
        visible: true,
      });
    } else {
      setIndicator((prev) => ({ ...prev, visible: false }));
    }
  }, [pathname, categories, primaries]);

  const linkClass = (active: boolean) =>
    cn(
      'relative py-2 text-[13px] 2xl:text-sm font-medium whitespace-nowrap transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      onHeroTop
        ? active
          ? 'text-white font-semibold'
          : 'text-nav-on-hero/90 hover:text-white'
        : active
        ? 'text-primary dark:text-primary-300 font-semibold'
        : 'text-nav-ink hover:text-primary dark:hover:text-primary-300'
    );

  return (
    <nav aria-label={tAria('mainNav')} ref={navRef} className="relative hidden lg:flex items-center gap-3.5 2xl:gap-5">
      {/* >= 1280: show all 4 categories inline without icons */}
      <div className="hidden xl:flex items-center gap-3.5 2xl:gap-5">
        {categories.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              ref={(el) => {
                linkRefs.current[item.id] = el;
              }}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={linkClass(active)}
            >
              {tRoot(item.labelKey as any)}
            </Link>
          );
        })}
      </div>

      {/* 1024 - 1279: collapse 4 categories into "Khám phá" */}
      <div className="flex xl:hidden">
        <ExploreDropdown items={categories} onHeroTop={onHeroTop} />
      </div>

      <AreaDropdown onHeroTop={onHeroTop} />

      {primaries.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.id}
            ref={(el) => {
              linkRefs.current[item.id] = el;
            }}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={linkClass(active)}
          >
            {tRoot(item.labelKey as any)}
          </Link>
        );
      })}

      {/* Animated sliding active underline */}
      <span
        aria-hidden="true"
        data-testid="nav-active-indicator"
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: `${indicator.width}px`,
        }}
        className={cn(
          'hdr-animated pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-200',
          onHeroTop ? 'bg-white' : 'bg-primary dark:bg-primary-300',
          indicator.visible ? 'opacity-100' : 'opacity-0'
        )}
      />
    </nav>
  );
}
