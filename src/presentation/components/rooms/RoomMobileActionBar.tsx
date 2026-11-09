'use client';

import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { RoomDetailDto } from '@/application/dto/listing.dto';
import { useRouter } from '@/i18n/routing';

interface RoomMobileActionBarProps {
  room: RoomDetailDto;
  onOpenAppointment: () => void;
}

export function RoomMobileActionBar({ room, onOpenAppointment }: RoomMobileActionBarProps) {
  const router = useRouter();
  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(Math.round(p || 0));

  const isUnavailable =
    room.status === 'OCCUPIED' ||
    room.status === 'MAINTENANCE' ||
    room.status === 'RENTED' ||
    room.occupancyStatus === 'OCCUPIED' ||
    room.occupancyStatus === 'MAINTENANCE' ||
    room.occupancyStatus === 'RENTED';

  const checkAuthAndExecute = (action: () => void) => {
    if (typeof document !== 'undefined') {
      const hasToken = document.cookie.includes('cozynest_token=');
      if (!hasToken) {
        const returnUrl = encodeURIComponent(window.location.pathname);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }
    }
    action();
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 p-3 px-4 flex items-center justify-between gap-3 shadow-lg md:hidden">
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black text-teal-700 dark:text-teal-400">
            {formatPrice(room.price)}
          </span>
          <span className="text-[11px] text-stone-500">/{room.priceUnit === 'BED' ? 'giường/tháng' : 'tháng'}</span>
        </div>
        <span className="text-[10px] text-stone-500 block truncate">
          Cọc: {formatPrice(room.deposit)} đ
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="md"
          className="h-11 px-4 text-xs font-bold"
          disabled={isUnavailable}
          onClick={() => checkAuthAndExecute(onOpenAppointment)}
          leftIcon={
            isUnavailable ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )
          }
        >
          {isUnavailable ? 'Phòng đã thuê' : 'Đặt lịch hẹn'}
        </Button>
      </div>
    </div>
  );
}
