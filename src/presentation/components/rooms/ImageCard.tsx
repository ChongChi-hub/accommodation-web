'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Star, ArrowLeft, ArrowRight, Trash2, AlertCircle } from 'lucide-react';

export interface ManagedImage {
  id: string | number;
  url: string;
  isCover: boolean;
  sortOrder: number;
  name?: string;
  sizeBytes?: number;
  file?: File;
  error?: string;
}

interface Props {
  image: ManagedImage;
  index: number;
  total: number;
  onSetCover: (id: string | number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDelete: (id: string | number) => void;
  disabled?: boolean;
}

export function ImageCard({
  image,
  index,
  total,
  onSetCover,
  onMove,
  onDelete,
  disabled,
}: Props) {
  const t = useTranslations('landlord.images');

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all ${
        image.isCover
          ? 'border-teal-600 dark:border-teal-500 shadow-md ring-2 ring-teal-600/20'
          : 'border-stone-200 dark:border-stone-800 bg-surface'
      } ${image.error ? 'border-rose-500 bg-rose-50/20' : ''}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-4/3 w-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
        <Image
          src={image.url}
          alt={image.name || 'Ảnh phòng'}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-102"
          unoptimized
        />

        {/* Cover badge overlay */}
        {image.isCover && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="primary" size="sm" className="shadow-xs font-semibold">
              <Star className="w-3 h-3 fill-teal-600 text-teal-600 mr-1" />
              {t('coverBadge')}
            </Badge>
          </div>
        )}

        {/* Error overlay */}
        {image.error && (
          <div className="absolute inset-0 bg-rose-950/70 p-3 flex flex-col items-center justify-center text-center text-white text-xs">
            <AlertCircle className="w-5 h-5 text-rose-300 mb-1" />
            <p className="line-clamp-2">{image.error}</p>
          </div>
        )}
      </div>

      {/* Meta & Controls */}
      <div className="p-3 space-y-2 text-xs bg-surface flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 text-[11px]">
          <span className="truncate max-w-[120px]" title={image.name}>
            {image.name || `#${index + 1}`}
          </span>
          {image.sizeBytes && <span>{formatSize(image.sizeBytes)}</span>}
        </div>

        <div className="flex items-center justify-between gap-1 pt-1 border-t border-stone-100 dark:border-stone-800">
          {/* Cover button */}
          {!image.isCover ? (
            <button
              type="button"
              disabled={disabled || !!image.error}
              onClick={() => onSetCover(image.id)}
              className="text-[11px] font-medium text-teal-700 dark:text-teal-400 hover:underline cursor-pointer disabled:opacity-40"
            >
              {t('setCoverBtn')}
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-teal-800 dark:text-teal-300">
              {t('coverBadge')}
            </span>
          )}

          {/* Action buttons: Move, Delete */}
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || index === 0}
              onClick={() => onMove(index, index - 1)}
              aria-label={t('moveUp')}
              title={t('moveUp')}
              className="p-1 h-7 w-7"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || index === total - 1}
              onClick={() => onMove(index, index + 1)}
              aria-label={t('moveDown')}
              title={t('moveDown')}
              className="p-1 h-7 w-7"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onDelete(image.id)}
              aria-label={t('deleteBtn')}
              title={t('deleteBtn')}
              className="p-1 h-7 w-7 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
