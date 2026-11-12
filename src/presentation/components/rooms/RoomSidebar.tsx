'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Link, useRouter } from '@/i18n/routing';
import {
  ShieldCheck,
  Calendar,
  Send,
  MessageCircle,
  AlertTriangle,
  Zap,
  Droplets,
  Wifi,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { RoomDetailDto } from '@/application/dto/listing.dto';
import { BookmarkButton } from './BookmarkButton';
import { RoomShareButton } from './RoomShareButton';

interface RoomSidebarProps {
  room: RoomDetailDto;
  onOpenAppointment: () => void;
  onOpenRental: () => void;
}

export function RoomSidebar({ room, onOpenAppointment, onOpenRental }: RoomSidebarProps) {
  const tAuto = useTranslations('autoI18n');
  const router = useRouter();
  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(Math.round(p || 0));

  const isUnavailable =
    room.status === 'OCCUPIED' ||
    room.status === 'MAINTENANCE' ||
    room.status === 'RENTED' ||
    room.occupancyStatus === 'OCCUPIED' ||
    room.occupancyStatus === 'MAINTENANCE' ||
    room.occupancyStatus === 'RENTED';

  const unavailableReason =
    room.status === 'MAINTENANCE' || room.occupancyStatus === 'MAINTENANCE'
      ? 'Phòng đang bảo trì & sửa chữa'
      : 'Phòng hiện đã có người thuê';

  const checkAuthAndExecute = (action: () => void) => {
    if (typeof document !== 'undefined') {
      const hasSession = document.cookie.includes('cozynest_role=');
      if (!hasSession) {
        const returnUrl = encodeURIComponent(window.location.pathname);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }
    }
    action();
  };

  const handleMessage = () => {
    checkAuthAndExecute(() => {
      router.push('/dashboard/tenant/messages');
    });
  };

  return (
    <Card className="p-6 sticky top-24 space-y-5 border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
      {/* Price Header */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
            {tAuto('k0620')}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-teal-700 dark:text-teal-400">
              {formatPrice(room.price)}
            </span>
            <span className="text-xs text-stone-500 font-medium">/{room.priceUnit === 'BED' ? 'giường/tháng' : 'tháng'}</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {tAuto('k0621')}{' '}<strong className="text-stone-800 dark:text-stone-200">{formatPrice(room.deposit)}{' '}{tAuto('k0257')}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <RoomShareButton />
          <BookmarkButton
            roomId={room.id}
            initialBookmarked={room.isBookmarked}
            initialCount={room.bookmarkCount}
            size="sm"
          />
        </div>
      </div>

      {/* Occupied / Maintenance Banner */}
      {isUnavailable && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            {unavailableReason}
          </div>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            {tAuto('k0622')}
          </p>
        </div>
      )}

      {/* Utilities quick summary */}
      <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
        <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />{' '}{tAuto('k0319')}
          </span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {formatPrice(room.electricityCost)}{' '}{tAuto('k0623')}
          </span>
        </div>
        <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />{' '}{tAuto('k0322')}
          </span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {formatPrice(room.waterCost)}{' '}{tAuto('k0624')}
          </span>
        </div>
        <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />{' '}{tAuto('k0625')}
          </span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {formatPrice(room.internetCost)}{' '}{tAuto('k0626')}
          </span>
        </div>
      </div>

      {/* Landlord Quick Snapshot */}
      <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex items-center gap-3">
        <Avatar name={room.landlord?.name || 'Chủ trọ'} src={room.landlord?.avatarUrl} size="md" />
        <div className="flex-1 min-w-0">
          <Link
            href={`/hosts/${room.landlord?.landlordId || room.id}`}
            className="text-xs font-bold text-stone-900 dark:text-stone-100 hover:text-teal-700 dark:hover:text-teal-400 truncate flex items-center gap-1"
          >
            {room.landlord?.name || 'Trần Thị Chủ Trọ'}
            <ArrowUpRight className="w-3 h-3 text-stone-400" />
          </Link>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />{' '}{tAuto('k0585')}
          </p>
        </div>
      </div>

      {/* 3 Hierarchical Action Buttons (Height 44px, full-width, icon on same line) */}
      <div className="space-y-3 pt-2">
        {/* 1. Primary: Đặt lịch xem phòng */}
        <Button
          variant="primary"
          size="lg"
          className="w-full h-11"
          disabled={isUnavailable}
          onClick={() => checkAuthAndExecute(onOpenAppointment)}
          leftIcon={<Calendar className="w-4 h-4" />}
        >
          {isUnavailable ? 'Phòng không khả dụng' : 'Đặt lịch xem phòng'}
        </Button>

        {/* 2. Secondary: Gửi yêu cầu thuê */}
        <Button
          variant="secondary"
          size="lg"
          className="w-full h-11"
          disabled={isUnavailable}
          onClick={() => checkAuthAndExecute(onOpenRental)}
          leftIcon={<Send className="w-4 h-4" />}
        >
          {tAuto('k0627')}
        </Button>

        {/* 3. Outline: Nhắn tin cho chủ trọ */}
        <Button
          variant="outline"
          size="lg"
          className="w-full h-11"
          onClick={handleMessage}
          leftIcon={<MessageCircle className="w-4 h-4" />}
        >
          {tAuto('k0628')}
        </Button>
      </div>
    </Card>
  );
}
