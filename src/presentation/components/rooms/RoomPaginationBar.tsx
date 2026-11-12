'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RoomPaginationMeta } from '@/application/dto/listing.dto';
import { cn } from '@/lib/cn';

interface RoomPaginationBarProps {
  pagination: RoomPaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function RoomPaginationBar({
  pagination,
  onPageChange,
  isLoading = false,
  className,
}: RoomPaginationBarProps) {
  const t = useTranslations('rooms.pagination');
  const { page, totalPages, total, hasNext, hasPrev } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <nav
      aria-label={t('ariaLabel')}
      className={cn(
        'mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4',
        className
      )}
    >
      <p className="text-xs text-foreground-muted font-medium">
        {t('pageOf', { page, totalPages, total })}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev || isLoading}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:border-primary disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{t('previous')}</span>
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            disabled={isLoading || p === page}
            aria-label={t('goToPage', { page: p })}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'min-w-8 h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
              p === page
                ? 'bg-primary text-white shadow-xs'
                : 'border border-border bg-surface text-foreground hover:border-primary'
            )}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext || isLoading}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:border-primary disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
        >
          <span>{t('next')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
}

