'use client';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import { useRoomDetail } from '@/presentation/hooks/useRoomDetail';
import { RoomInPageNav } from '@/presentation/components/rooms/RoomInPageNav';
import { RoomDetailHeader } from '@/presentation/components/rooms/RoomDetailHeader';
import { RoomHeroGallery } from '@/presentation/components/rooms/RoomHeroGallery';
import { RoomSpecsGrid } from '@/presentation/components/rooms/RoomSpecsGrid';
import { RoomDescriptionAndRules } from '@/presentation/components/rooms/RoomDescriptionAndRules';
import { RoomAmenities } from '@/presentation/components/rooms/RoomAmenities';
import { RoomFeeEstimator } from '@/presentation/components/rooms/RoomFeeEstimator';
import { RoomMap } from '@/presentation/components/rooms/RoomMap';
import { RoomLandlordCard } from '@/presentation/components/rooms/RoomLandlordCard';
import { RoomReviews } from '@/presentation/components/rooms/RoomReviews';
import { RoomSidebar } from '@/presentation/components/rooms/RoomSidebar';
import { RoomMobileActionBar } from '@/presentation/components/rooms/RoomMobileActionBar';
import { RoomBookingModal } from '@/presentation/components/rooms/RoomBookingModal';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface RoomDetailClientViewProps {
  slug: string;
}

export function RoomDetailClientView({ slug }: RoomDetailClientViewProps) {
  const tAuto = useTranslations('autoI18n');
  const { room, recommendations, reviews, isLoading, error, retry } = useRoomDetail(slug);
  const [modalType, setModalType] = useState<'appointment' | 'rental' | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-6 w-56 rounded-lg" />
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <Skeleton className="h-[460px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-6">
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
            <ArrowLeft className="w-4 h-4" />{' '}{tAuto('k0437')}
          </Link>
        </div>
      </div>
    );
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SingleFamilyResidence',
    name: room.title,
    description: room.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: room.address,
      addressLocality: room.provinceName || room.provinceCode,
      addressCountry: 'VN',
    },
    geo:
      room.latitude && room.longitude
        ? {
            '@type': 'GeoCoordinates',
            latitude: room.latitude,
            longitude: room.longitude,
          }
        : undefined,
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
      availability:
        room.status === 'AVAILABLE' || room.occupancyStatus === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky In-Page Sub-Navigation */}
      <RoomInPageNav />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-28 md:pb-16">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Tìm phòng', href: '/rooms' },
            { label: room.provinceName || 'Khu vực', href: `/rooms?provinceCode=${room.provinceCode}` },
            { label: room.title },
          ]}
        />

        {/* 1. Title Header & Badges */}
        <RoomDetailHeader room={room} />

        {/* 2. Marketplace Hero Gallery */}
        <RoomHeroGallery images={room.images || []} title={room.title} />

        {/* 3. Main Grid: Content (2/3) + Sticky Sidebar (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start pt-2">
          {/* Left Column: Details & Blocks */}
          <div className="lg:col-span-2 space-y-10">
            {/* 3.1. Key Specs Grid */}
            <RoomSpecsGrid room={room} />

            {/* 3.2. Description & House Rules */}
            <RoomDescriptionAndRules room={room} />

            {/* 3.3. Amenities Grouped */}
            <RoomAmenities amenities={room.amenities || []} />

            {/* 3.4. Utility Fees & Monthly Cost Estimator */}
            <RoomFeeEstimator rentPrice={room.price} fees={room.roomFees || []} />

            {/* 3.5. Location & Interactive Map */}
            <RoomMap latitude={room.latitude} longitude={room.longitude} address={room.address} />

            {/* 3.6. Landlord Profile Snapshot */}
            <RoomLandlordCard landlord={room.landlord} />

            {/* 3.7. Tenant Reviews */}
            <RoomReviews
              ratingAvg={room.ratingAvg}
              reviewCount={room.reviewCount}
              ratingCleanliness={room.ratingCleanliness}
              ratingLocation={room.ratingLocation}
              ratingPriceQuality={room.ratingPriceQuality}
              ratingSecurity={room.ratingSecurity}
              reviews={reviews}
            />

            {/* 3.8. Similar Rooms Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <section className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    {tAuto('k0438')}
                  </h2>
                  <Link
                    href={`/rooms?provinceCode=${room.provinceCode}`}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    {tAuto('k0439')}
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.slice(0, 2).map((r) => (
                    <RoomCard key={r.id} room={r} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Pricing & Action Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <RoomSidebar
              room={room}
              onOpenAppointment={() => setModalType('appointment')}
              onOpenRental={() => setModalType('rental')}
            />
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <RoomMobileActionBar
        room={room}
        onOpenAppointment={() => setModalType('appointment')}
      />

      {/* Booking / Rental Request Modal */}
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
