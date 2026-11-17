'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Star, MessageSquare } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { ReviewDto } from '@/application/dto/listing.dto';
import { formatIsoDate } from '@/shared/utils/format-vnd';

export default function TenantReviewsPage() {
  const tAuto = useTranslations('autoI18n');
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      if (container.listing.listingRepository.getTenantReviews) {
        const data = await container.listing.listingRepository.getTenantReviews();
        setReviews(data);
      }
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0392')}{reviews.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {tAuto('k0393')}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-10 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Bạn chưa có đánh giá nào</h3>
          <p className="text-xs text-foreground-muted max-w-sm">
            Sau khi thuê phòng và hoàn tất hợp đồng, bạn có thể để lại đánh giá cho phòng trọ tại đây.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <Link href={`/rooms/${r.roomId}`} className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-teal-700">
                  {r.roomTitle || `Phòng trọ #${r.roomId}`}
                </Link>
                <div className="flex items-center gap-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-1">{r.rating}.0</span>
                  {r.createdAt && (
                    <span className="text-[11px] text-stone-400 ml-2">({formatIsoDate(r.createdAt)})</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{r.comment}</p>

              {r.landlordReply && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-xs text-teal-900 dark:text-teal-300 border-l-2 border-teal-700">
                  <span className="font-bold">{tAuto('k0394')}{' '}</span>
                  <span>{r.landlordReply}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
