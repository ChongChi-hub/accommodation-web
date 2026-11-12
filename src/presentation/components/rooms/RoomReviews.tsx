'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Star, ShieldCheck, MessageSquare } from 'lucide-react';
import { ReviewDto } from '@/application/dto/listing.dto';
import { Avatar } from '@/presentation/components/ui/Avatar';

interface RoomReviewsProps {
  ratingAvg: number;
  reviewCount: number;
  ratingCleanliness?: number;
  ratingLocation?: number;
  ratingPriceQuality?: number;
  ratingSecurity?: number;
  reviews: ReviewDto[];
}

export function RoomReviews({
  ratingAvg,
  reviewCount,
  ratingCleanliness = 4.9,
  ratingLocation = 4.8,
  ratingPriceQuality = 4.7,
  ratingSecurity = 5.0,
  reviews,
}: RoomReviewsProps) {
  const tAuto = useTranslations('autoI18n');
  const criteria = [
    { label: 'Vệ sinh & Sạch sẽ', score: ratingCleanliness },
    { label: 'Vị trí & Tiện ích xung quanh', score: ratingLocation },
    { label: 'Giá trị tương xứng', score: ratingPriceQuality },
    { label: 'An ninh & Trật tự', score: ratingSecurity },
  ];

  return (
    <div id="reviews" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            {tAuto('k0613')}{reviewCount})
          </h2>
          <p className="text-xs text-stone-500">
            {tAuto('k0614')}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 px-4 py-2 rounded-2xl">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          <div>
            <span className="text-2xl font-black text-amber-950 dark:text-amber-200">
              {(ratingAvg || 5.0).toFixed(1)}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 block font-medium">
              {tAuto('k0615')}
            </span>
          </div>
        </div>
      </div>

      {/* Criteria breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {criteria.map((c, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 text-xs"
          >
            <span className="text-stone-600 dark:text-stone-400 font-medium">{c.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-700 dark:text-teal-400 h-full rounded-full"
                  style={{ width: `${(c.score / 5) * 100}%` }}
                />
              </div>
              <span className="font-bold text-stone-900 dark:text-stone-100">{c.score.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="p-6 text-center rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-500">
          {tAuto('k0616')}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={rev.tenantName} src={rev.tenantAvatar} size="sm" />
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      {rev.tenantName}
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                        <ShieldCheck className="w-3 h-3" />{' '}{tAuto('k0617')}
                      </span>
                    </h4>
                    <span className="text-[11px] text-stone-400">{rev.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {rev.rating}
                </div>
              </div>

              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {rev.comment}
              </p>

              {rev.landlordReply && (
                <div className="mt-2 ml-4 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border-l-2 border-teal-700 text-xs space-y-1">
                  <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1 text-[11px]">
                    <MessageSquare className="w-3 h-3 text-teal-700 dark:text-teal-400" />{' '}{tAuto('k0618')}
                  </span>
                  <p className="text-stone-600 dark:text-stone-400">{rev.landlordReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

