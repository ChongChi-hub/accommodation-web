'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { MapPin, Maximize2, Users, Star, BedDouble, Layers } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { RoomDto } from '@/application/dto/listing.dto';
import { BookmarkButton } from './BookmarkButton';
import { RoomCardCarousel } from './RoomCardCarousel';
import { RoomCardBadges } from './RoomCardBadges';
import { cn } from '@/lib/cn';

export interface RoomCardProps {
  room: RoomDto;
  className?: string;
  variant?: 'grid' | 'list' | 'compact';
}

function formatPrice(val: number): string {
  return new Intl.NumberFormat('vi-VN').format(val);
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hôm nay';
  if (days < 7) return `${days} ngày trước`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

export function RoomCard({ room, className, variant = 'grid' }: RoomCardProps) {
  const tAuto = useTranslations('autoI18n');
  const roomLink = room.slug ? `/rooms/${room.slug}` : `/rooms/${room.id}`;
  const images = room.imageUrls && room.imageUrls.length > 0
    ? room.imageUrls
    : [room.primaryImageUrl || '/images/rooms/room-fallback-640.webp'];

  const isShared = room.roomTypeCode === 'o-ghep' || room.roomTypeCode === 'SHARED';
  const priceUnitLabel = room.priceUnit === 'BED' || isShared ? '/giường/tháng' : '/tháng';
  const isList = variant === 'list';

  if (isList) {
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 transition-all duration-300 hover:shadow-xl hover:border-teal-500/40 flex flex-col sm:flex-row sm:items-stretch sm:h-64',
          className
        )}
      >
        <div className="relative w-full sm:w-72 md:w-80 shrink-0 h-56 sm:h-full overflow-hidden">
          <RoomCardCarousel images={images} title={room.title} aspectClassName="h-full w-full" />
          <RoomCardBadges
            roomTypeCode={room.roomTypeCode}
            isLandlordVerified={room.isLandlordVerified}
            createdAt={room.createdAt}
            publishedAt={room.publishedAt}
            availableSpots={room.availableSpots}
          />
          <div className="absolute top-3 right-3 z-20">
            <BookmarkButton roomId={room.id} initialBookmarked={room.isBookmarked} initialCount={room.bookmarkCount} size="sm" />
          </div>
        </div>

        <div className="relative flex-1 p-5 flex flex-col justify-between gap-3">
          <Link href={roomLink} className="absolute inset-0 z-0" aria-label={room.title} />
          <div className="relative z-1 space-y-1.5 pointer-events-none">
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-black text-teal-700 dark:text-teal-400">
                {formatPrice(room.price)} <span className="text-xs font-normal text-stone-500">{tAuto('k0257')}{priceUnitLabel}</span>
              </span>
              {room.ratingAvg !== undefined && room.ratingAvg > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {room.ratingAvg.toFixed(1)} ({room.reviewCount || 0})
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
              {room.title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{room.address}</span>
            </p>
          </div>

          <div className="relative z-1 pointer-events-none flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="flex items-center gap-1 font-medium"><Maximize2 className="w-3.5 h-3.5 text-stone-400" />{room.area}{' '}{tAuto('k0517')}</span>
            <span className="flex items-center gap-1 font-medium"><Users className="w-3.5 h-3.5 text-stone-400" />{room.maxOccupants}{' '}{tAuto('k0565')}</span>
            {room.bedrooms !== undefined && room.bedrooms > 0 && (
              <span className="flex items-center gap-1 font-medium"><BedDouble className="w-3.5 h-3.5 text-stone-400" />{room.bedrooms} PN</span>
            )}
            {room.floor !== undefined && room.floor > 0 && (
              <span className="flex items-center gap-1 font-medium"><Layers className="w-3.5 h-3.5 text-stone-400" />{tAuto('k0566')}{' '}{room.floor}</span>
            )}
          </div>

          <div className="relative z-1 pointer-events-none flex items-center justify-between text-[11px] text-stone-400 pt-1">
            <span>{formatRelativeTime(room.publishedAt || room.createdAt)}</span>
            <span>{room.reviewCount ? `${room.reviewCount} đánh giá` : 'Chưa có đánh giá'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Full-bleed Cover Card (Ảnh phủ trọn vẹn toàn bộ thẻ)
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-stone-900 transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] border border-stone-200/60 dark:border-stone-800 flex flex-col justify-end min-h-[460px] sm:min-h-[490px] select-none',
        className
      )}
    >
      {/* 1. Full-bleed Image Carousel as Card Background */}
      <RoomCardCarousel
        images={images}
        title={room.title}
        aspectClassName="absolute inset-0 h-full w-full pointer-events-none"
        dotsClassName="bottom-auto top-3.5 left-1/2 -translate-x-1/2 pointer-events-none z-20"
      />

      {/* 2. Top Scrim for badge contrast */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

      {/* 3. Deep Bottom Scrim for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-stone-950 via-stone-950/85 via-50% to-transparent pointer-events-none z-10" />

      {/* 4. Stretched Link */}
      <Link href={roomLink} className="absolute inset-0 z-10" aria-label={room.title} />

      {/* 5. Top Bar: Badges + Bookmark Heart */}
      <RoomCardBadges
        roomTypeCode={room.roomTypeCode}
        isLandlordVerified={room.isLandlordVerified}
        createdAt={room.createdAt}
        publishedAt={room.publishedAt}
        availableSpots={room.availableSpots}
      />
      <div className="absolute top-3.5 right-3.5 z-30 pointer-events-auto">
        <BookmarkButton
          roomId={room.id}
          initialBookmarked={room.isBookmarked}
          initialCount={room.bookmarkCount}
          size="sm"
          className="bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 shadow-md"
        />
      </div>

      {/* 6. Bottom Information Panel Overlay */}
      <div className="relative z-20 mt-auto p-4 sm:p-5 flex flex-col justify-end gap-2 text-white pointer-events-none">
        {/* Price & Rating */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
            {formatPrice(room.price)}{' '}
            <span className="text-xs font-normal text-stone-300">{tAuto('k0257')}{priceUnitLabel}</span>
          </div>

          {room.ratingAvg !== undefined && room.ratingAvg > 0 && (
            <div className="inline-flex items-center gap-1 text-xs font-bold bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-amber-300 shadow-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{room.ratingAvg.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-[17px] font-bold text-white line-clamp-2 leading-snug group-hover:text-teal-300 transition-colors drop-shadow-md">
          {room.title}
        </h3>

        {/* Location */}
        <p className="text-xs text-stone-300 flex items-center gap-1.5 drop-shadow-xs font-normal">
          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">{room.address}</span>
        </p>

        {/* Key Specs Capsules */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-medium text-stone-100 border border-white/10">
            <Maximize2 className="w-3 h-3 text-stone-300" />
            {room.area}{' '}{tAuto('k0517')}
          </span>
          <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-medium text-stone-100 border border-white/10">
            <Users className="w-3 h-3 text-stone-300" />
            {room.maxOccupants}{' '}{tAuto('k0565')}
          </span>
          {room.bedrooms !== undefined && room.bedrooms > 0 && (
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-medium text-stone-100 border border-white/10">
              <BedDouble className="w-3 h-3 text-stone-300" />
              {room.bedrooms} PN
            </span>
          )}
          {room.floor !== undefined && room.floor > 0 && (
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-medium text-stone-100 border border-white/10">
              <Layers className="w-3 h-3 text-stone-300" />
              {tAuto('k0566')}{' '}{room.floor}
            </span>
          )}
        </div>

        {/* Amenities Preview */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {room.amenities.slice(0, 3).map((item) => {
              const label = typeof item === 'string' ? item : item.name;
              const key = typeof item === 'string' ? item : item.id || item.code;
              return (
                <span
                  key={key}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-stone-200 border border-white/10 font-normal"
                >
                  {label}
                </span>
              );
            })}
            {room.amenities.length > 3 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-stone-300 border border-white/10 font-medium">
                +{room.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer date & review count */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-white/10">
          <span>{formatRelativeTime(room.publishedAt || room.createdAt)}</span>
          <span>{room.reviewCount ? `${room.reviewCount} đánh giá` : 'Chưa có đánh giá'}</span>
        </div>
      </div>
    </div>
  );
}
