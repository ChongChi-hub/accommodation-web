'use client';

import React, { use, useState } from 'react';
import { useRoomDetail } from '@/presentation/hooks/useRoomDetail';
import { RoomImageCarousel } from '@/presentation/components/rooms/RoomImageCarousel';
import { RoomMap } from '@/presentation/components/rooms/RoomMap';
import { RoomAmenities } from '@/presentation/components/rooms/RoomAmenities';
import { RoomFeeEstimator } from '@/presentation/components/rooms/RoomFeeEstimator';
import { RoomLandlordCard } from '@/presentation/components/rooms/RoomLandlordCard';
import { RoomReviews } from '@/presentation/components/rooms/RoomReviews';
import { RoomSidebar } from '@/presentation/components/rooms/RoomSidebar';
import { RoomBookingModal } from '@/presentation/components/rooms/RoomBookingModal';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Badge } from '@/presentation/components/ui/Badge';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Link } from '@/i18n/routing';
import {
  MapPin,
  ShieldCheck,
  Maximize2,
  Users,
  Bed,
  Layers,
  Clock,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { room, recommendations, reviews, isLoading, error, retry } = useRoomDetail(id);
  const [modalType, setModalType] = useState<'appointment' | 'rental' | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-6">
        <ErrorState
          title="Không tìm thấy phòng trọ hoặc tin đã gỡ"
          message={error || 'Phòng trọ không tồn tại hoặc đã được chuyển về trạng thái không công khai theo quy định.'}
          onRetry={retry}
        />
        <div>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tìm phòng
          </Link>
        </div>
      </div>
    );
  }

  // JSON-LD schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SingleFamilyResidence',
    name: room.title,
    description: room.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: room.address,
      addressLocality: room.provinceCode,
      addressCountry: 'VN',
    },
    geo: room.latitude && room.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: room.latitude,
      longitude: room.longitude,
    } : undefined,
    numberOfRooms: room.bedrooms || 1,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: room.area,
      unitCode: 'MTK',
    },
    offers: {
      '@type': 'Offer',
      price: room.price,
      priceCurrency: 'VND',
      availability: room.status === 'AVAILABLE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Tìm phòng', href: '/rooms' },
          { label: room.title },
        ]}
      />

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">{room.roomTypeCode}</Badge>
          {room.approved && (
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Xác thực kiểm duyệt 100%
            </Badge>
          )}
          {room.furnishing && (
            <Badge variant="neutral" className="gap-1 text-xs">
              <Sparkles className="w-3 h-3 text-amber-500" /> {room.furnishing === 'FULL' ? 'Đầy đủ nội thất' : 'Nội thất cơ bản'}
            </Badge>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          {room.title}
        </h1>

        <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
          {room.address}
        </p>
      </div>

      {/* Image Carousel */}
      <RoomImageCarousel images={room.images || []} title={room.title} />

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 text-center">
            <div className="p-2 space-y-0.5">
              <span className="text-[11px] text-stone-400 block">Diện tích</span>
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                {room.area} m²
              </span>
            </div>
            <div className="p-2 space-y-0.5 border-l border-stone-200/60 dark:border-stone-800">
              <span className="text-[11px] text-stone-400 block">Sức chứa tối đa</span>
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                {room.maxOccupants} người
              </span>
            </div>
            <div className="p-2 space-y-0.5 border-t sm:border-t-0 sm:border-l border-stone-200/60 dark:border-stone-800">
              <span className="text-[11px] text-stone-400 block">Vị trí tầng</span>
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                Tầng {room.floor || 2}
              </span>
            </div>
            <div className="p-2 space-y-0.5 border-t sm:border-t-0 border-l border-stone-200/60 dark:border-stone-800">
              <span className="text-[11px] text-stone-400 block">Quy mô</span>
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1">
                <Bed className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                {room.bedrooms || 1} PN • {room.bathrooms || 1} WC
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Mô tả chi tiết</h2>
            <div className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
              {room.description}
            </div>
            {room.curfew && (
              <p className="text-xs text-stone-500 flex items-center gap-1.5 pt-2">
                <Clock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                {room.curfew}
              </p>
            )}
          </div>

          {/* Amenities Grouped */}
          <RoomAmenities amenities={room.amenities || []} />

          {/* Utility Fees & Monthly Cost Estimator */}
          <RoomFeeEstimator rentPrice={room.price} fees={room.roomFees || []} />

          {/* Interactive Map */}
          <RoomMap latitude={room.latitude} longitude={room.longitude} address={room.address} />

          {/* Landlord Profile Snapshot */}
          <RoomLandlordCard landlord={room.landlord} />

          {/* Tenant Reviews */}
          <RoomReviews
            ratingAvg={room.ratingAvg}
            reviewCount={room.reviewCount}
            ratingCleanliness={room.ratingCleanliness}
            ratingLocation={room.ratingLocation}
            ratingPriceQuality={room.ratingPriceQuality}
            ratingSecurity={room.ratingSecurity}
            reviews={reviews}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RoomSidebar
            room={room}
            onOpenAppointment={() => setModalType('appointment')}
            onOpenRental={() => setModalType('rental')}
          />
        </div>
      </div>

      {/* Similar Rooms */}
      {recommendations.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Phòng gợi ý tương tự cùng khu vực ({recommendations.length})
            </h2>
            <Link
              href={`/rooms?provinceCode=${room.provinceCode}`}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
            >
              Xem thêm cùng tỉnh/thành →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <RoomCard key={rec.id} room={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Booking Modals */}
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
