'use client';

import React, { use, useState } from 'react';
import { useRoomDetail } from '@/presentation/hooks/useRoomDetail';
import { RoomDetailGallery } from '@/presentation/components/rooms/RoomDetailGallery';
import { RoomBookingModal } from '@/presentation/components/rooms/RoomBookingModal';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { Card } from '@/presentation/components/ui/Card';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Link } from '@/i18n/routing';
import {
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Maximize2,
  Calendar,
  Send,
  Zap,
  Droplets,
  Wifi,
  Sparkles,
  Phone,
} from 'lucide-react';

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const roomId = Number(id);
  const { room, recommendations, reviews, isLoading, error, retry } = useRoomDetail(roomId);
  const [modalType, setModalType] = useState<'appointment' | 'rental' | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <ErrorState title="Không tìm thấy thông tin phòng" message={error || ''} onRetry={retry} />
      </div>
    );
  }

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Tìm phòng', href: '/rooms' },
          { label: room.title },
        ]}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" size="md">
            {room.roomTypeCode === 'MINI_APARTMENT' ? 'Chung cư mini' : 'Phòng trọ'}
          </Badge>
          {room.approved && (
            <Badge variant="success" size="md">
              <ShieldCheck className="w-3.5 h-3.5" /> Xác thực thực tế
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {room.title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
          <span>{room.address}</span>
        </p>
      </div>

      <RoomDetailGallery primaryImage={room.primaryImageUrl} images={room.imageUrls} title={room.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Thông tin tổng quan</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              <div>
                <p className="text-stone-400">Diện tích</p>
                <p className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{room.area} m²</p>
              </div>
              <div>
                <p className="text-stone-400">Sức chứa</p>
                <p className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{room.maxOccupants} người</p>
              </div>
              <div>
                <p className="text-stone-400">Tiền cọc</p>
                <p className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{formatPrice(room.deposit)} đ</p>
              </div>
              <div>
                <p className="text-stone-400">Thú cưng</p>
                <p className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                  {room.allowPets ? 'Cho phép' : 'Không'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Mô tả chi tiết</h2>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-line">
              {room.description}
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Chi phí dịch vụ hàng tháng</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <span className="flex items-center gap-1 text-stone-400"><Zap className="w-3.5 h-3.5 text-amber-500" /> Điện</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-1">{formatPrice(room.electricityCost)} đ/kWh</p>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <span className="flex items-center gap-1 text-stone-400"><Droplets className="w-3.5 h-3.5 text-cyan-500" /> Nước</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-1">{formatPrice(room.waterCost)} đ/khối</p>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <span className="flex items-center gap-1 text-stone-400"><Wifi className="w-3.5 h-3.5 text-teal-500" /> Mạng</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-1">{formatPrice(room.internetCost)} đ/phòng</p>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <span className="flex items-center gap-1 text-stone-400"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Dịch vụ</span>
                <p className="font-bold text-stone-800 dark:text-stone-200 mt-1">{formatPrice(room.serviceCost)} đ/người</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Đánh giá từ khách thuê</h2>
              <div className="flex items-center gap-1.5 font-bold text-amber-500 text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{room.ratingAvg?.toFixed(1) || '5.0'}</span>
                <span className="text-stone-400 font-normal text-xs">({reviews.length} đánh giá)</span>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={rev.tenantName} size="sm" />
                      <span className="text-xs font-semibold">{rev.tenantName}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300">{rev.comment}</p>
                  {rev.landlordReply && (
                    <div className="p-2.5 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 text-[11px] text-teal-900 dark:text-teal-300 mt-2 border-l-2 border-teal-600">
                      <span className="font-bold">Phản hồi của chủ trọ:</span> {rev.landlordReply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 sticky top-24 space-y-5 border-teal-700/20 shadow-md">
            <div>
              <p className="text-xs text-stone-400">Giá thuê niêm yết</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-teal-800 dark:text-teal-400">
                  {formatPrice(room.price)} đ
                </span>
                <span className="text-xs text-stone-400">/tháng</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 flex items-center gap-3">
              <Avatar name={room.landlordName} size="md" />
              <div className="flex-1 min-w-0">
                <Link href={`/hosts/${room.landlordId}`} className="text-xs font-bold text-stone-900 dark:text-stone-100 hover:text-teal-700 block truncate">
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
                leftIcon={<Calendar className="w-4 h-4" />}
                onClick={() => setModalType('appointment')}
              >
                Đặt lịch xem phòng
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => setModalType('rental')}
              >
                Gửi yêu cầu thuê
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Phòng gợi ý cùng khu vực</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <RoomCard key={rec.id} room={rec} />
            ))}
          </div>
        </div>
      )}

      {modalType && (
        <RoomBookingModal
          isOpen={true}
          onClose={() => setModalType(null)}
          roomTitle={room.title}
          type={modalType}
        />
      )}
    </div>
  );
}
