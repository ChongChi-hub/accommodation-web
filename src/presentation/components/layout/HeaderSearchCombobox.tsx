'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Search, X } from 'lucide-react';
import { useSearchSuggestions } from '@/presentation/hooks/useSearchSuggestions';
import { HeaderSearchResultsList, SearchOption } from './HeaderSearchResultsList';
import { cn } from '@/lib/cn';

interface HeaderSearchComboboxProps {
  onHeroTop?: boolean;
  autoFocus?: boolean;
  wideDesktop?: boolean;
  onAfterNavigate?: () => void;
  className?: string;
}

export function HeaderSearchCombobox({
  onHeroTop = false,
  autoFocus = false,
  wideDesktop = true,
  onAfterNavigate,
  className,
}: HeaderSearchComboboxProps) {
  const tSearch = useTranslations('search');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    recentSearches,
    popularAreas,
    rooms,
    isLoading,
    error,
    recordSearch,
    clearHistory,
    retry,
  } = useSearchSuggestions(query, isOpen);

  const trimmed = query.trim();
  const isLiveMode = trimmed.length >= 2;

  const options = useMemo<SearchOption[]>(() => {
    if (!isLiveMode) {
      return [
        ...recentSearches.map((q, idx) => ({ id: `${baseId}-rec-${idx}`, kind: 'recent' as const, query: q })),
        ...popularAreas.map((a) => ({
          id: `${baseId}-area-${a.code}`,
          kind: 'area' as const,
          code: a.code,
          name: a.name,
        })),
      ];
    }
    const items: SearchOption[] = rooms.map((r) => ({
      id: `${baseId}-room-${r.id}`,
      kind: 'room' as const,
      href: r.slug ? `/rooms/${r.slug}` : `/rooms/${r.id}`,
      title: r.title,
      price: r.price,
      subtitle: r.provinceName || r.address || '',
      image: r.primaryImageUrl,
    }));
    items.push({ id: `${baseId}-all`, kind: 'viewAll', query: trimmed });
    return items;
  }, [baseId, isLiveMode, popularAreas, recentSearches, rooms, trimmed]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmed, isOpen, rooms.length]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      const el = inputRef.current;
      if (!el || el.closest('[aria-hidden="true"]') || el.getBoundingClientRect().width < 20) {
        return;
      }
      e.preventDefault();
      el.focus();
      setIsOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navigateSearch = (q: string) => {
    const clean = q.trim();
    if (clean) recordSearch(clean);
    setIsOpen(false);
    router.push(clean ? `/rooms?q=${encodeURIComponent(clean)}` : '/rooms');
    onAfterNavigate?.();
  };

  const selectOption = (opt: SearchOption) => {
    if (opt.kind === 'recent') navigateSearch(opt.query);
    else if (opt.kind === 'area') {
      setIsOpen(false);
      router.push(`/rooms?provinceCode=${encodeURIComponent(opt.code)}`);
      onAfterNavigate?.();
    } else if (opt.kind === 'room') {
      if (trimmed) recordSearch(trimmed);
      setIsOpen(false);
      router.push(opt.href);
      onAfterNavigate?.();
    } else {
      navigateSearch(opt.query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown' && options.length > 0) {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp' && options.length > 0) {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && options[activeIndex]) selectOption(options[activeIndex]);
      else navigateSearch(query);
    }
  };

  const activeId = activeIndex >= 0 && options[activeIndex] ? options[activeIndex].id : undefined;

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border px-3.5 h-10 text-xs transition-colors',
          onHeroTop
            ? 'bg-white/15 border-white/30 text-white placeholder:text-white/75 focus-within:bg-surface focus-within:text-foreground focus-within:border-primary'
            : 'bg-surface-muted/80 border-border text-foreground focus-within:bg-surface focus-within:border-primary'
        )}
      >
        <Search className="w-4 h-4 shrink-0 text-current opacity-70" />
        <input
          ref={inputRef}
          type="text"
          data-testid="header-search-input"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-label={tSearch('placeholder')}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={tSearch('placeholder')}
          className="w-full bg-transparent text-xs outline-none placeholder:text-current/60 min-w-0"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
            aria-label={tCommon('close')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd
            title={tSearch('shortcutHint')}
            className={cn(
              'hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono rounded border shrink-0',
              onHeroTop
                ? 'border-white/35 text-white/90 bg-white/10'
                : 'border-border text-foreground-muted bg-surface'
            )}
          >
            /
          </kbd>
        )}
      </div>

      {isOpen && (
        <HeaderSearchResultsList
          listboxId={listboxId}
          isLiveMode={isLiveMode}
          trimmed={trimmed}
          options={options}
          activeId={activeId}
          isLoading={isLoading}
          error={error}
          wideDesktop={wideDesktop}
          onSelect={selectOption}
          onClearHistory={clearHistory}
          onRetry={retry}
        />
      )}
    </div>
  );
}
