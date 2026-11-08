'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Link } from '@/i18n/routing';
import { ShieldCheck, Calendar, Send, Zap, Droplets, Wifi } from 'lucide-react';
import { RoomDto } from '@/application/dto/listing.dto';
import { BookmarkButton } from './BookmarkButton';

interface RoomSidebarProps {
  room: RoomDto;
  onOpenAppointment: () => void;
  onOpenRental: () => void;
}

export function RoomSidebar({ room, onOpenAppointment, onOpenRental }: RoomSidebarProps) {
  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p);

  return (
    <Card className="p-6 sticky top-24 space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Giá niêm yết</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
              {formatPrice(room.price)}
            </span>
            <span className="text-xs text-neutral-500">đ/tháng</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Cọc: <strong className="text-neutral-700 dark:text-neutral-300">{formatPrice(room.deposit)} đ</strong>
          </p>
        </div>
        <BookmarkButton
          roomId={room.id}
          initialBookmarked={room.isBookmarked}
          initialCount={room.bookmarkCount}
          showCount
          size="md"
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
        <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Tiền điện</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">{formatPrice(room.electricityCost)} đ/kWh</span>
        </div>
        <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-500" /> Tiền nước</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">{formatPrice(room.waterCost)} đ/khối</span>
        </div>
        <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-primary-600" /> Internet</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">{formatPrice(room.internetCost)} đ/tháng</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 flex items-center gap-3">
        <Avatar name={room.landlordName} size="md" />
        <div className="flex-1 min-w-0">
          <Link
            href={`/hosts/${room.landlordId}`}
            className="text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 block truncate"
          >
            {room.landlordName}
          </Link>
          <p className="text-[11px] text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Chủ trọ uy tín
          </p>
        </div>
      </div>

      <div className="space-y-2.5 pt-2">
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={onOpenAppointment}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Đặt lịch xem phòng
        </Button>
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={onOpenRental}
        >
          <Send className="w-4 h-4 mr-2" />
          Gửi yêu cầu thuê
        </Button>
      </div>
    </Card>
  );
}
