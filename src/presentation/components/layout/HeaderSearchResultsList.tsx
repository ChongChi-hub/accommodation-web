'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, Clock, MapPin, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SearchOption =
  | { id: string; kind: 'recent'; query: string }
  | { id: string; kind: 'area'; code: string; name: string }
  | { id: string; kind: 'room'; href: string; title: string; price: number; subtitle: string; image?: string }
  | { id: string; kind: 'viewAll'; query: string };

interface HeaderSearchResultsListProps {
  listboxId: string;
  isLiveMode: boolean;
  trimmed: string;
  options: SearchOption[];
  activeId?: string;
  isLoading: boolean;
  error: string | null;
  wideDesktop?: boolean;
  onSelect: (opt: SearchOption) => void;
  onClearHistory: () => void;
  onRetry: () => void;
}

export function HeaderSearchResultsList({
  listboxId,
  isLiveMode,
  trimmed,
  options,
  activeId,
  isLoading,
  error,
  wideDesktop = false,
  onSelect,
  onClearHistory,
  onRetry,
}: HeaderSearchResultsListProps) {
  const tSearch = useTranslations('search');
  const tCommon = useTranslations('common');

  const recentOptions = options.filter((o): o is Extract<SearchOption, { kind: 'recent' }> => o.kind === 'recent');
  const areaOptions = options.filter((o): o is Extract<SearchOption, { kind: 'area' }> => o.kind === 'area');
  const roomOptions = options.filter((o): o is Extract<SearchOption, { kind: 'room' }> => o.kind === 'room');
  const viewAllOptions = options.filter((o): o is Extract<SearchOption, { kind: 'viewAll' }> => o.kind === 'viewAll');

  return (
    <div
      id={listboxId}
      role="listbox"
      className={cn(
        'hdr-popover-panel absolute mt-2 rounded-2xl border border-border bg-surface text-foreground shadow-2xl p-2 z-50 max-h-[70vh] overflow-y-auto',
        wideDesktop ? 'left-0 right-0 lg:left-0 lg:right-auto lg:w-[400px]' : 'left-0 right-0'
      )}
    >
      {!isLiveMode ? (
        <div className="space-y-3 p-1">
          {recentOptions.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                  {tSearch('recent')}
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onClearHistory}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground-muted hover:text-danger cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{tSearch('clearRecent')}</span>
                </button>
              </div>
              {recentOptions.map((opt) => (
                <button
                  key={opt.id}
                  id={opt.id}
                  role="option"
                  type="button"
                  aria-selected={activeId === opt.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(opt)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer',
                    activeId === opt.id ? 'bg-primary-50 dark:bg-primary-950/60 text-primary' : 'hover:bg-surface-muted'
                  )}
                >
                  <Clock className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
                  <span className="truncate">{opt.query}</span>
                </button>
              ))}
            </div>
          )}

          {areaOptions.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                {tSearch('popularAreas')}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {areaOptions.map((opt) => (
                  <button
                    key={opt.id}
                    id={opt.id}
                    role="option"
                    type="button"
                    aria-selected={activeId === opt.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSelect(opt)}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer',
                      activeId === opt.id
                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary'
                        : 'hover:bg-surface-muted'
                    )}
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : error ? (
        <div role="alert" className="p-3 rounded-xl bg-danger-surface border border-danger-border space-y-2">
          <div className="flex items-start gap-2 text-xs text-danger">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{tSearch('networkError')}</span>
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{tSearch('retry')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-1 p-1">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
            {tSearch('liveSuggestions')}
          </p>
          {isLoading ? (
            <div className="px-2.5 py-3 text-xs text-foreground-muted">{tSearch('loading')}</div>
          ) : roomOptions.length === 0 ? (
            <div className="px-2.5 py-2 text-xs text-foreground-muted">{tSearch('noSuggestions')}</div>
          ) : (
            roomOptions.map((opt) => (
              <button
                key={opt.id}
                id={opt.id}
                role="option"
                data-testid="search-room-option"
                type="button"
                aria-selected={activeId === opt.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(opt)}
                className={cn(
                  'w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer',
                  activeId === opt.id ? 'bg-primary-50 dark:bg-primary-950/60' : 'hover:bg-surface-muted'
                )}
              >
                <img
                  src={opt.image || '/uploads/rooms/r101_1.webp'}
                  alt={opt.title}
                  className="w-10 h-10 rounded-lg object-cover bg-surface-muted shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{opt.title}</p>
                  <p className="text-[11px] text-foreground-muted truncate">
                    {new Intl.NumberFormat('vi-VN').format(opt.price)} {tCommon('currency')}
                    {tCommon('pricePerMonth')}
                    {opt.subtitle ? ` - ${opt.subtitle}` : ''}
                  </p>
                </div>
              </button>
            ))
          )}
          {viewAllOptions.map((opt) => (
            <button
              key={opt.id}
              id={opt.id}
              role="option"
              type="button"
              aria-selected={activeId === opt.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(opt)}
              className={cn(
                'w-full flex items-center justify-center py-2 px-3 mt-1 rounded-xl text-xs font-semibold text-primary dark:text-primary-300 border-t border-border cursor-pointer',
                activeId === opt.id ? 'bg-primary-50 dark:bg-primary-950/60' : 'hover:bg-surface-muted'
              )}
            >
              {tSearch('viewAll', { query: trimmed })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
