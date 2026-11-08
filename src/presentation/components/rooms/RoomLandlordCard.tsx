'use client';

import React from 'react';
import { ShieldCheck, Star, Clock, Home, ArrowUpRight } from 'lucide-react';
import { LandlordSnapshotDto } from '@/application/dto/listing.dto';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Link } from '@/i18n/routing';

interface RoomLandlordCardProps {
  landlord: LandlordSnapshotDto;
}

export function RoomLandlordCard({ landlord }: RoomLandlordCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <Avatar name={landlord.name} src={landlord.avatarUrl} size="lg" />
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              {landlord.name}
              {landlord.verified && (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </h3>
            <span className="text-xs text-stone-500">Chủ trọ đã xác minh CCCD & quyền sở hữu</span>
          </div>
        </div>

        <Link
          href={`/hosts/${landlord.landlordId}`}
          className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-0.5"
        >
          Hồ sơ <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-100 dark:border-stone-800/80 text-center text-xs">
        <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40">
          <span className="text-stone-400 block text-[11px]">Đánh giá</span>
          <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {(landlord.ratingAvg || 5.0).toFixed(1)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40">
          <span className="text-stone-400 block text-[11px]">Phản hồi</span>
          <span className="font-bold text-stone-900 dark:text-stone-100 block mt-0.5">
            {landlord.responseRatePercent || 99}%
          </span>
        </div>

        <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40">
          <span className="text-stone-400 block text-[11px]">Tin đăng</span>
          <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1 mt-0.5">
            <Home className="w-3.5 h-3.5 text-teal-600" />
            {landlord.roomCount || 1} phòng
          </span>
        </div>
      </div>
    </div>
  );
}

