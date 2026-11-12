'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LandlordRoomItem } from '@/domain/entities/LandlordRoom';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { LandlordRoomStatusBadge } from './LandlordRoomStatusBadge';
import { Edit, Eye, EyeOff, Trash2, ExternalLink, ImageIcon } from 'lucide-react';

interface Props {
  room: LandlordRoomItem;
  onToggleVisibility: (roomId: number, currentHidden: boolean) => Promise<boolean>;
  onOpenDelete: (room: LandlordRoomItem) => void;
  isTogglingId?: number | null;
}

export function LandlordRoomCard({
  room,
  onToggleVisibility,
  onOpenDelete,
  isTogglingId,
}: Props) {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('landlord.rooms');

  const formatPrice = (val: number) => {
    return `${val.toLocaleString('vi-VN')} đ`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const isModHidden = room.status === 'HIDDEN' && (room.hiddenBy === 'MODERATOR' || room.hiddenBy === 'ADMIN');
  const isHidden = room.status === 'HIDDEN';

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
          {room.coverThumbUrl ? (
            <Image
              src={room.coverThumbUrl}
              alt={room.title}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
              {room.title}
            </h3>
            <LandlordRoomStatusBadge
              status={room.status}
              hiddenBy={room.hiddenBy}
              hiddenReason={room.hiddenReason}
              rejectedReason={room.rejectedReason}
            />
          </div>
          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
            {room.shortAddress || room.address}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <span className="font-bold text-teal-800 dark:text-teal-400">
              {formatPrice(room.price)}{tAuto('k0516')}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-600 dark:text-stone-400">
              {room.area}{' '}{tAuto('k0517')}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">
              {room.viewCount}{' '}{tAuto('k0518')}
            </span>
          </div>
        </div>
      </div>

      {room.rejectedReason && (
        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300">
          {tAuto('k0501')}{' '}{room.rejectedReason}
        </div>
      )}

      {isModHidden && room.hiddenReason && (
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-700 dark:text-amber-300">
          {tAuto('k0519')}{' '}{room.hiddenReason}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
        <span className="text-[11px] text-stone-400">
          {tAuto('k0520')}{' '}{formatDate(room.publishedAt || room.createdAt)}
        </span>
        <div className="flex items-center gap-1">
          <Link href={`/rooms/${room.id}`}>
            <Button variant="ghost" size="sm" aria-label={t('actions.preview')}>
              <ExternalLink className="w-4 h-4 text-stone-500" />
            </Button>
          </Link>
          <Link href={`/dashboard/landlord/rooms/${room.id}/edit`}>
            <Button variant="ghost" size="sm" aria-label={t('actions.edit')}>
              <Edit className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            disabled={isModHidden || isTogglingId === room.id}
            onClick={() => onToggleVisibility(room.id, isHidden)}
            aria-label={isHidden ? t('actions.show') : t('actions.hide')}
            title={isModHidden ? t('modHiddenTooltip') : undefined}
          >
            {isHidden ? (
              <EyeOff className={`w-4 h-4 ${isModHidden ? 'text-stone-300 dark:text-stone-600' : 'text-amber-600'}`} />
            ) : (
              <Eye className="w-4 h-4 text-emerald-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenDelete(room)}
            aria-label={t('actions.delete')}
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
