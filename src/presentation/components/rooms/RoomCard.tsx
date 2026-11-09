'use client';

import React from 'react';
import { MapPin, Maximize2, Users, Star, BedDouble, Layers } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { RoomDto } from '@/application/dto/listing.dto';
import { Card } from '@/presentation/components/ui/Card';
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
  const roomLink = room.slug ? `/rooms/${room.slug}` : `/rooms/${room.id}`;
  const images = (room.imageUrls && room.imageUrls.length > 0)
    ? room.imageUrls
    : [room.primaryImageUrl || '/images/rooms/room-fallback-640.webp'];

  const isShared = room.roomTypeCode === 'o-ghep' || room.roomTypeCode === 'SHARED';
  const priceUnitLabel = room.priceUnit === 'BED' || isShared ? '/giường/tháng' : '/tháng';
  const isList = variant === 'list';
  const isCompact = variant === 'compact';

  return (
    <Card
      interactive
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 transition-all duration-300 hover:shadow-lg hover:border-stone-300 dark:hover:border-stone-700 flex flex-col',
        isList && 'sm:flex-row sm:items-stretch',
        className
      )}
    >
      {/* Edge-to-edge Photo Carousel with Badges & Price Overlay */}
      <div className={cn('relative w-full shrink-0', isList ? 'sm:w-72 md:w-80' : '')}>
        <RoomCardCarousel
          images={images}
          title={room.title}
          aspectClassName={isList ? 'aspect-4/3 sm:aspect-auto sm:h-full' : 'aspect-4/3'}
        />

        <RoomCardBadges
          roomTypeCode={room.roomTypeCode}
          isLandlordVerified={room.isLandlordVerified}
          createdAt={room.createdAt}
          publishedAt={room.publishedAt}
          availableSpots={room.availableSpots}
        />

        <div className="absolute top-3 right-3 z-20">
          <BookmarkButton
            roomId={room.id}
            initialBookmarked={room.isBookmarked}
            initialCount={room.bookmarkCount}
            size="sm"
          />
        </div>

        {/* Price Tag with Gradient Contrast Scrim */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10 flex items-end justify-between px-3.5 pb-2.5 text-white">
          <div className="font-bold text-base tracking-tight drop-shadow-xs">
            {formatPrice(room.price)} <span className="text-xs font-normal text-stone-200">đ{priceUnitLabel}</span>
          </div>
          {room.ratingAvg !== undefined && room.ratingAvg > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{room.ratingAvg.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content with Stretched Link */}
      <div className={cn('relative flex-1 p-4 flex flex-col justify-between gap-3', isCompact && 'p-3 gap-2')}>
        <Link href={roomLink} className="absolute inset-0 z-0" aria-label={room.title} />

        <div className="relative z-1 space-y-1.5 pointer-events-none">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
            {room.title}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{room.address}</span>
          </p>
        </div>

        {/* Stats Row */}
        <div className="relative z-1 pointer-events-none flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="flex items-center gap-1 font-medium">
            <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
            {room.area} m²
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            {room.maxOccupants} người
          </span>
          {room.bedrooms !== undefined && room.bedrooms > 0 && (
            <span className="flex items-center gap-1 font-medium">
              <BedDouble className="w-3.5 h-3.5 text-stone-400" />
              {room.bedrooms} PN
            </span>
          )}
          {room.floor !== undefined && room.floor > 0 && (
            <span className="flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              Tầng {room.floor}
            </span>
          )}
        </div>

        {/* Amenities Preview */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="relative z-1 pointer-events-none flex flex-wrap gap-1.5 pt-0.5">
            {room.amenities.slice(0, 3).map((item) => {
              const label = typeof item === 'string' ? item : item.name;
              const key = typeof item === 'string' ? item : item.id || item.code;
              return (
                <span
                  key={key}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-normal"
                >
                  {label}
                </span>
              );
            })}
            {room.amenities.length > 3 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 font-medium">
                +{room.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer info: post date & reviews */}
        <div className="relative z-1 pointer-events-none flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 pt-1">
          <span>{formatRelativeTime(room.publishedAt || room.createdAt)}</span>
          {room.reviewCount !== undefined && room.reviewCount > 0 ? (
            <span>{room.reviewCount} đánh giá</span>
          ) : (
            <span>Chưa có đánh giá</span>
          )}
        </div>
      </div>
    </Card>
  );
}
