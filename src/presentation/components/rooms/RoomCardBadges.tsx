'use client';

import React from 'react';
import { ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';
import { formatRoomType } from '@/presentation/utils/room-type';
import { useTranslations } from 'next-intl';

interface RoomCardBadgesProps {
  roomTypeCode: string;
  isLandlordVerified?: boolean;
  createdAt?: string;
  publishedAt?: string;
  availableSpots?: number;
}

export function RoomCardBadges({
  roomTypeCode,
  isLandlordVerified,
  createdAt,
  publishedAt,
  availableSpots,
}: RoomCardBadgesProps) {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations();
  const dateStr = publishedAt || createdAt;
  const isNew = Boolean(
    dateStr && (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24) <= 7
  );

  return (
    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none z-20">
      <Badge
        variant="primary"
        size="sm"
        className="bg-white/95 dark:bg-stone-900/90 text-stone-800 dark:text-stone-100 backdrop-blur-xs font-semibold shadow-xs"
      >
        {formatRoomType(roomTypeCode, t)}
      </Badge>

      {isLandlordVerified && (
        <Badge
          variant="success"
          size="sm"
          className="bg-emerald-600 text-white border-transparent backdrop-blur-xs flex items-center gap-1 shadow-xs font-medium"
        >
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span>{tAuto('k0567')}</span>
        </Badge>
      )}

      {isNew && (
        <Badge
          variant="warning"
          size="sm"
          className="bg-amber-500/95 text-white border-transparent backdrop-blur-xs flex items-center gap-1 shadow-xs font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{tAuto('k0568')}</span>
        </Badge>
      )}

      {availableSpots !== undefined && availableSpots > 0 && (
        <Badge
          variant="info"
          size="sm"
          className="bg-sky-600 text-white border-transparent backdrop-blur-xs flex items-center gap-1 shadow-xs font-medium"
        >
          <UserCheck className="w-3 h-3 shrink-0" />
          <span>{tAuto('k0569')}{' '}{availableSpots}{' '}{tAuto('k0570')}</span>
        </Badge>
      )}
    </div>
  );
}
