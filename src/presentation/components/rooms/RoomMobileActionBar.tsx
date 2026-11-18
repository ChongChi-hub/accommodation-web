'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Calendar, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { RoomDetailDto } from '@/application/dto/listing.dto';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { toast } from '@/presentation/stores/toast.store';
import { useRouter } from '@/i18n/routing';

interface RoomMobileActionBarProps {
  room: RoomDetailDto;
  onOpenAppointment: () => void;
  onOpenRental?: () => void;
}

export function RoomMobileActionBar({ room, onOpenAppointment, onOpenRental }: RoomMobileActionBarProps) {
  const tAuto = useTranslations('autoI18n');
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
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
      const hasSession = document.cookie.includes('cozynest_role=');
      if (!hasSession && !user) {
        const returnUrl = encodeURIComponent(window.location.pathname);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }
    }
    if (user) {
      const roleUpper = (user.role || '').toUpperCase();
      const rolesUpper = (user.roles || []).map((r) => r.toUpperCase());
      const canBook =
        roleUpper === 'TENANT' ||
        roleUpper === 'ADMIN' ||
        rolesUpper.includes('TENANT') ||
        rolesUpper.includes('ADMIN');
      if (!canBook) {
        toast.error('Chỉ tài khoản Khách thuê mới có thể đặt lịch xem phòng hoặc gửi yêu cầu thuê.');
        return;
      }
      if (room.landlord?.email && user.email && room.landlord.email.toLowerCase() === user.email.toLowerCase()) {
        toast.error('Chủ trọ không thể tự đặt lịch hoặc gửi yêu cầu thuê phòng của chính mình.');
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
          {tAuto('k0521')}{' '}{formatPrice(room.deposit)}{' '}{tAuto('k0257')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onOpenRental && !isUnavailable && (
          <Button
            variant="secondary"
            size="md"
            className="h-11 px-3 text-xs font-bold"
            onClick={() => checkAuthAndExecute(onOpenRental)}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Thuê ngay
          </Button>
        )}
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
