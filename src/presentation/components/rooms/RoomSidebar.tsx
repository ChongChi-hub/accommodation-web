'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Link, useRouter } from '@/i18n/routing';
import { ShieldCheck, Calendar, Send, MessageCircle, AlertTriangle, Zap, Droplets, Wifi } from 'lucide-react';
import { RoomDetailDto } from '@/application/dto/listing.dto';
import { BookmarkButton } from './BookmarkButton';
import { RoomShareButton } from './RoomShareButton';

interface RoomSidebarProps {
  room: RoomDetailDto;
  onOpenAppointment: () => void;
  onOpenRental: () => void;
}

export function RoomSidebar({ room, onOpenAppointment, onOpenRental }: RoomSidebarProps) {
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
    <Card className="p-6 sticky top-24 space-y-5">
      {/* Price & Bookmark */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Giá thuê niêm yết</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-teal-700 dark:text-teal-400">
              {formatPrice(room.price)}
            </span>
            <span className="text-xs text-stone-500 font-medium">đ/tháng</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Tiền đặt cọc: <strong className="text-stone-800 dark:text-stone-200">{formatPrice(room.deposit)} đ</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RoomShareButton />
          <BookmarkButton
            roomId={room.id}
            initialBookmarked={room.isBookmarked}
            initialCount={room.bookmarkCount}
            showCount
            size="md"
          />
        </div>
      </div>

      {/* Occupied / Maintenance Banner */}
      {isUnavailable && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/80 text-amber-900 dark:text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            {room.status === 'MAINTENANCE' ? 'Phòng đang bảo trì' : 'Phòng hiện đã có người thuê'}
          </div>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Tin đăng được giữ để tham khảo. Hiện tại chủ trọ tạm khóa nhận lịch hẹn và yêu cầu thuê mới.
          </p>
        </div>
      )}

      {/* Utilities quick summary */}
      <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
        <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Tiền điện</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">{formatPrice(room.electricityCost)} đ/kWh</span>
        </div>
        <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
          <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-500" /> Tiền nước</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">{formatPrice(room.waterCost)} đ/m³</span>
        </div>
        <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
          <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-teal-700" /> Internet</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">{formatPrice(room.internetCost)} đ/tháng</span>
        </div>
      </div>

      {/* Landlord Quick Snapshot */}
      <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 flex items-center gap-3">
        <Avatar name={room.landlord?.name || 'Chủ trọ'} src={room.landlord?.avatarUrl} size="md" />
        <div className="flex-1 min-w-0">
          <Link
            href={`/hosts/${room.landlord?.landlordId || room.id}`}
            className="text-xs font-bold text-stone-900 dark:text-stone-100 hover:text-teal-700 block truncate"
          >
            {room.landlord?.name || 'Trần Thị Chủ Trọ'}
          </Link>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Chủ trọ đã xác thực KYC
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <Button
          variant="primary"
          size="md"
          className="w-full"
          disabled={isUnavailable}
          onClick={() => checkAuthAndExecute(onOpenAppointment)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Đặt lịch xem phòng
        </Button>

        <Button
          variant="outline"
          size="md"
          className="w-full"
          disabled={isUnavailable}
          onClick={() => checkAuthAndExecute(onOpenRental)}
        >
          <Send className="w-4 h-4 mr-2" />
          Gửi yêu cầu thuê
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-stone-500"
          onClick={() => checkAuthAndExecute(() => alert('Khởi tạo cuộc trò chuyện với chủ trọ (DEMO-STATIC).'))}
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
          Nhắn tin cho chủ trọ
        </Button>
      </div>
    </Card>
  );
}
