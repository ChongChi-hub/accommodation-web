'use client';

import React, { use, useState } from 'react';
import { useRoomDetail } from '@/presentation/hooks/useRoomDetail';
import { RoomDetailGallery } from '@/presentation/components/rooms/RoomDetailGallery';
import { RoomBookingModal } from '@/presentation/components/rooms/RoomBookingModal';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomSidebar } from '@/presentation/components/rooms/RoomSidebar';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Badge } from '@/presentation/components/ui/Badge';
import { Card } from '@/presentation/components/ui/Card';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { MapPin, ShieldCheck, Star, Users, Maximize2, Sparkles } from 'lucide-react';

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
          <Badge variant="primary">{room.roomTypeCode}</Badge>
          {room.approved && (
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã xác thực
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
          {room.title}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
          {room.address}
        </p>
      </div>

      <RoomDetailGallery
        primaryImage={room.primaryImageUrl}
        images={room.imageUrls}
        title={room.title}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
            <div className="text-center">
              <span className="text-xs text-neutral-500 block">Diện tích</span>
              <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-center gap-1 mt-0.5">
                <Maximize2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                {room.area} m²
              </span>
            </div>
            <div className="text-center border-x border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 block">Sức chứa</span>
              <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-center gap-1 mt-0.5">
                <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                {room.maxOccupants} người
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs text-neutral-500 block">Đánh giá</span>
              <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {(room.ratingAvg || 5.0).toFixed(1)} ({room.reviewCount})
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Mô tả chi tiết</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
              {room.description}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Tiện nghi có sẵn</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-center gap-2.5 text-xs font-medium text-neutral-800 dark:text-neutral-200"
                >
                  <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              Đánh giá từ người thuê ({room.reviewCount})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-500">Chưa có đánh giá nào cho phòng này.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <Card key={rev.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={rev.tenantName} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{rev.tenantName}</p>
                          <span className="text-[10px] text-neutral-400">{rev.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {rev.rating}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">{rev.comment}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <RoomSidebar
            room={room}
            onOpenAppointment={() => setModalType('appointment')}
            onOpenRental={() => setModalType('rental')}
          />
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Phòng gợi ý cùng khu vực</h2>
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
