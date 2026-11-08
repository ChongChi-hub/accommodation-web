'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { RoomDetailDto } from '@/application/dto/listing.dto';
import { Badge } from '@/presentation/components/ui/Badge';
import { RoomShareButton } from './RoomShareButton';
import { BookmarkButton } from './BookmarkButton';
import { formatRoomType } from '@/presentation/utils/room-type';

interface RoomDetailHeaderProps {
  room: RoomDetailDto;
}

export function RoomDetailHeader({ room }: RoomDetailHeaderProps) {
  const t = useTranslations();

  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('reviews');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isVerifiedHost = room.landlord?.verified === true || room.approved === true;

  return (
    <div className="space-y-3.5">
      {/* Top row: Badges + Action Buttons */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Room Type translated badge */}
          <Badge
            variant="primary"
            size="md"
            className="font-bold bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
          >
            {formatRoomType(room.roomTypeCode, t)}
          </Badge>

          {/* 2. Truthful Verified Host badge */}
          {isVerifiedHost && (
            <Badge
              variant="success"
              size="md"
              className="gap-1.5 font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Chủ trọ đã xác minh danh tính</span>
            </Badge>
          )}
        </div>

        {/* Share & Bookmark buttons always on the SAME ROW */}
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          <RoomShareButton />
          <BookmarkButton
            roomId={room.id}
            initialBookmarked={room.isBookmarked}
            initialCount={room.bookmarkCount}
            size="sm"
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
        {room.title}
      </h1>

      {/* Sub-meta: Address & Reviews link */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-600 dark:text-stone-400">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
          <span>{room.address}</span>
        </span>

        <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>

        <a
          href="#reviews"
          onClick={scrollToReviews}
          className="inline-flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200 hover:text-teal-700 dark:hover:text-teal-400 hover:underline cursor-pointer select-none"
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
          <span>{(room.ratingAvg || 5.0).toFixed(1)}</span>
          <span className="text-stone-500 dark:text-stone-400 font-normal">
            ({room.reviewCount || 0} đánh giá)
          </span>
        </a>
      </div>
    </div>
  );
}
