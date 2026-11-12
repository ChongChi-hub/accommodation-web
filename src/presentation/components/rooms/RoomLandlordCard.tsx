'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { ShieldCheck, Star, Clock, Home, ArrowUpRight } from 'lucide-react';
import { LandlordSnapshotDto } from '@/application/dto/listing.dto';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Link } from '@/i18n/routing';

interface RoomLandlordCardProps {
  landlord?: LandlordSnapshotDto | null;
}

export function RoomLandlordCard({ landlord }: RoomLandlordCardProps) {
  const tAuto = useTranslations('autoI18n');
  if (!landlord) return null;

  const landlordId = landlord.landlordId || landlord.id || 1;
  const name = landlord.name || 'Trần Thị Chủ Trọ';
  const responseRate = landlord.responseRatePercent || 99;
  const responseTime = landlord.responseTimeMinutes ? `${landlord.responseTimeMinutes} phút` : '15 phút';

  return (
    <div
      id="landlord"
      className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-5 space-y-4 shadow-2xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar name={name} src={landlord.avatarUrl} size="lg" className="shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 truncate">
              <span className="truncate">{name}</span>
              {landlord.verified && (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400 block truncate mt-0.5">
              {landlord.verified
                ? 'Chủ trọ đã xác minh danh tính & CCCD'
                : 'Chủ trọ liên kết nền tảng'}
            </span>
          </div>
        </div>

        <Link
          href={`/hosts/${landlordId}`}
          className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-0.5 shrink-0 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60"
        >
          {tAuto('k0604')}{' '}<ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800/80 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50">
          <span className="text-stone-400 block text-[11px] font-medium">{tAuto('k0605')}</span>
          <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {(landlord.ratingAvg || 5.0).toFixed(1)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50">
          <span className="text-stone-400 block text-[11px] font-medium">{tAuto('k0606')}</span>
          <span className="font-bold text-stone-900 dark:text-stone-100 block mt-0.5">
            {responseRate}%
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50">
          <span className="text-stone-400 block text-[11px] font-medium">{tAuto('k0607')}</span>
          <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            ~{responseTime}
          </span>
        </div>
      </div>
    </div>
  );
}
