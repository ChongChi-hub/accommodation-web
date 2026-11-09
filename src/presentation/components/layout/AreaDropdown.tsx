'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { ChevronDown, MapPin } from 'lucide-react';
import { HotAreaDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';
import { cn } from '@/lib/cn';

export interface AreaDropdownProps {
  onHeroTop: boolean;
}

export function AreaDropdown({ onHeroTop }: AreaDropdownProps) {
  const tNav = useTranslations('header.nav');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState<HotAreaDto[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAtRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    container.listing.listingRepository
      .getHotAreas(8, false)
      .then((res) => {
        if (active) setAreas(res.slice(0, 8));
      })
      .catch(() => {
        // Fallback silently; trigger still links to /rooms
      });
    return () => {
      active = false;
    };
  }, []);

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

  const handleMouseEnter = () => {
    clearTimers();
    openTimerRef.current = setTimeout(() => {
      hoverOpenedAtRef.current = Date.now();
      setIsOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => {
      hoverOpenedAtRef.current = 0;
      setIsOpen(false);
    }, 150);
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

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={handleToggleClick}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
            setTimeout(() => {
              const first = containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
              first?.focus();
            }, 20);
          }
        }}
        className={cn(
          'inline-flex items-center gap-1 py-2 text-[13px] 2xl:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          onHeroTop
            ? 'text-nav-on-hero/95 hover:text-white'
            : 'text-nav-ink hover:text-primary dark:hover:text-primary-300'
        )}
      >
        <span>{tNav('areas')}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={tNav('areas')}
          onKeyDown={handleMenuKeyDown}
          className="hdr-popover-panel absolute left-0 top-full mt-2 w-80 rounded-2xl border border-border bg-surface text-foreground shadow-xl p-3 z-50"
        >
          <div className="grid grid-cols-2 gap-1.5">
            {areas.map((area) => (
              <Link
                key={area.code}
                href={`/rooms?provinceCode=${area.code}`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-2 rounded-xl px-2.5 py-2 hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <MapPin className="w-3.5 h-3.5 text-primary dark:text-primary-300 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{area.name}</p>
                  <p className="text-[11px] text-foreground-muted">
                    {tNav('roomsCount', { count: area.roomCount })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <Link
              href="/rooms"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-1.5 rounded-xl text-xs font-semibold text-primary dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {tNav('allAreas')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
