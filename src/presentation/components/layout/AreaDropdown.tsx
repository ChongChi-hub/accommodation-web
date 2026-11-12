'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { ChevronDown, MapPin, ArrowRight, Search, RotateCcw } from 'lucide-react';
import { HotAreaDto, ProvinceDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';
import { matchesSearchQuery, getProvinceAliases } from '@/presentation/utils/search-normalization';
import { cn } from '@/lib/cn';

export interface AreaDropdownProps {
  onHeroTop: boolean;
}

export function AreaDropdown({ onHeroTop }: AreaDropdownProps) {
  const tAuto = useTranslations('autoI18n');
  const tNav = useTranslations('header.nav');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState<HotAreaDto[]>([]);
  const [allProvinces, setAllProvinces] = useState<ProvinceDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetBase = useMemo(() => {
    const validBases = ['/phong-tro', '/nha-nguyen-can', '/can-ho', '/o-ghep'];
    return validBases.some((b) => pathname.startsWith(b)) ? pathname : '/rooms';
  }, [pathname]);

  const loadData = () => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      container.listing.listingRepository.getHotAreas(8, false),
      container.listing.getLocationsUseCase.getProvinces(),
    ])
      .then(([hotList, provs]) => {
        setAreas(hotList.slice(0, 8));
        setAllProvinces(provs);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Không thể tải khu vực');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
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
      setIsOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }, 120);
  };

  const handleMouseLeave = () => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const filteredProvinces = useMemo(() => {
    if (!searchQuery.trim()) return allProvinces;
    return allProvinces.filter((p) =>
      matchesSearchQuery(p.name, searchQuery, getProvinceAliases(p.code))
    );
  }, [allProvinces, searchQuery]);

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
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-1 py-2 text-[13px] 2xl:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
          onHeroTop ? 'text-nav-on-hero/95 hover:text-white' : 'text-stone-700 dark:text-stone-300 hover:text-teal-600'
        )}
      >
        <span>{tNav('areas')}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={tNav('areas')}
          className="absolute left-0 top-full mt-2 w-[720px] max-w-[90vw] rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xl p-5 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 py-8 text-center text-xs text-stone-400">
              {tAuto('k0524')}
            </div>
          ) : error ? (
            <div className="py-6 text-center text-xs space-y-2">
              <p className="text-rose-500">{error}</p>
              <button type="button" onClick={loadData} className="inline-flex items-center gap-1 text-teal-600 text-xs font-semibold">
                <RotateCcw className="w-3 h-3" />{' '}{tAuto('k0525')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column: 6-8 Hot Area Image Tiles */}
              <div className="col-span-7 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {tAuto('k0526')}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {areas.map((area) => (
                    <Link
                      key={area.code}
                      href={`${targetBase}?provinceCode=${area.code}`}
                      role="menuitem"
                      onClick={() => setIsOpen(false)}
                      className="group relative h-20 rounded-xl overflow-hidden border border-stone-200/60 dark:border-stone-800 flex flex-col justify-end p-2.5 transition-transform hover:scale-[1.02]"
                    >
                      <Image
                        src={area.imageUrl || '/images/areas/ha-noi-640.webp'}
                        alt={area.name}
                        fill
                        sizes="180px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="relative z-1 text-white">
                        <p className="text-xs font-bold leading-tight drop-shadow-xs">{area.name}</p>
                        <p className="text-[10px] text-stone-200 drop-shadow-xs">{area.roomCount}{' '}{tAuto('k0527')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right Column: Search Combobox + A-Z List */}
              <div className="col-span-5 border-l border-stone-100 dark:border-stone-800 pl-5 space-y-3 flex flex-col">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {tAuto('k0528')}
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Gõ tên tỉnh (Hà Nội, Huế...)"
                    className="w-full h-8.5 pl-8 pr-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex-1 max-h-48 overflow-y-auto space-y-1 pr-1 text-xs">
                  {filteredProvinces.map((prov) => (
                    <Link
                      key={prov.code}
                      href={`${targetBase}?provinceCode=${prov.code}`}
                      role="menuitem"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      <span className="truncate">{prov.name}</span>
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">{tAuto('k0529')}</span>
            <Link
              href="/khu-vuc"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors"
            >
              <span>{tAuto('k0530')}{areas.length}{' '}{tAuto('k0531')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
