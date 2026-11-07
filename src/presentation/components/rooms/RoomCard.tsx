'use client';

import React from 'react';
import { MapPin, Maximize2, Users, Star, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { RoomDto } from '@/application/dto/listing.dto';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { cn } from '@/lib/cn';

export interface RoomCardProps {
  room: RoomDto;
  className?: string;
}

export function RoomCard({ room, className }: RoomCardProps) {
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <Link href={`/rooms/${room.id}`}>
      <Card
        interactive
        className={cn(
          'p-0 overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 group flex flex-col justify-between h-full',
          className
        )}
      >
        <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={room.primaryImageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'}
            alt={room.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge variant="primary" size="sm" className="bg-white/95 dark:bg-stone-900/90 backdrop-blur-xs font-semibold">
              {room.roomTypeCode === 'MINI_APARTMENT'
                ? 'Chung cư mini'
                : room.roomTypeCode === 'STUDIO'
                ? 'Studio'
                : room.roomTypeCode === 'APARTMENT'
                ? 'Căn hộ'
                : 'Phòng trọ'}
            </Badge>
            {room.approved && (
              <Badge variant="success" size="sm" className="bg-emerald-500 text-white border-transparent">
                <ShieldCheck className="w-3 h-3" />
                <span>Đã xác thực</span>
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {formatPrice(room.price)} đ<span className="font-normal text-[10px] text-stone-300">/tháng</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
              {room.title}
            </h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{room.address}</span>
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-stone-400" />
                {room.area} m²
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-stone-400" />
                {room.maxOccupants} người
              </span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{room.ratingAvg?.toFixed(1) || '5.0'}</span>
              <span className="text-stone-400 text-[10px]">({room.reviewCount || 0})</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
