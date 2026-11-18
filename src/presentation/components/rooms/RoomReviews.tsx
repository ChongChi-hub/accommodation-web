'use client';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import { Star, ShieldCheck, MessageSquare, PenSquare } from 'lucide-react';
import { ReviewDto } from '@/application/dto/listing.dto';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Rating } from '@/presentation/components/ui/Rating';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';

interface RoomReviewsProps {
  roomId?: number | string;
  ratingAvg: number;
  reviewCount: number;
  ratingCleanliness?: number;
  ratingLocation?: number;
  ratingPriceQuality?: number;
  ratingSecurity?: number;
  reviews: ReviewDto[];
  onReviewSubmitted?: () => void;
}

export function RoomReviews({
  roomId,
  ratingAvg,
  reviewCount,
  ratingCleanliness = 5.0,
  ratingLocation = 5.0,
  ratingPriceQuality = 5.0,
  ratingSecurity = 5.0,
  reviews,
  onReviewSubmitted,
}: RoomReviewsProps) {
  const tAuto = useTranslations('autoI18n');
  const { isAuthenticated } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [location, setLocation] = useState(5);
  const [priceQuality, setPriceQuality] = useState(5);
  const [security, setSecurity] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const visibleReviews = React.useMemo(
    () => reviews.filter((r) => !r.status || r.status.toUpperCase() === 'VISIBLE'),
    [reviews]
  );

  const visibleCount = visibleReviews.length;
  const computedAvg = React.useMemo(() => {
    if (visibleCount > 0) {
      const sum = visibleReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      return Math.round((sum / visibleCount) * 10) / 10;
    }
    return ratingAvg || 0;
  }, [visibleReviews, visibleCount, ratingAvg]);

  const effectiveReviewCount = visibleCount > 0 ? visibleCount : (reviewCount || 0);

  const criteria = [
    { label: 'Vệ sinh & Sạch sẽ', score: ratingCleanliness ?? 5.0 },
    { label: 'Vị trí & Tiện ích xung quanh', score: ratingLocation ?? 5.0 },
    { label: 'Giá trị tương xứng', score: ratingPriceQuality ?? 5.0 },
    { label: 'An ninh & Trật tự', score: ratingSecurity ?? 5.0 },
  ];

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để viết đánh giá cho căn phòng này.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return;
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }
    setSubmitting(true);
    try {
      await container.listing.listingRepository.createReview?.({
        roomId: Number(roomId),
        rating,
        comment: comment.trim(),
        ratingCleanliness: cleanliness,
        ratingLocation: location,
        ratingPriceQuality: priceQuality,
        ratingSecurity: security,
      });
      toast.success('Đánh giá của bạn đã được gửi thành công! Cảm ơn bạn đã đóng góp.');
      setIsModalOpen(false);
      setComment('');
      onReviewSubmitted?.();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cozynest:refresh-badges'));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi đánh giá lúc này.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="reviews" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            {tAuto('k0613')}{effectiveReviewCount})
          </h2>
          <p className="text-xs text-stone-500">
            {tAuto('k0614')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {roomId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenModal}
              leftIcon={<PenSquare className="w-4 h-4 text-teal-700 dark:text-teal-400" />}
              className="rounded-xl shadow-xs"
            >
              Viết đánh giá
            </Button>
          )}

          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 px-4 py-2 rounded-2xl">
            <Star className={`w-6 h-6 ${effectiveReviewCount > 0 ? 'text-amber-500 fill-amber-500' : 'text-stone-300 dark:text-stone-600'}`} />
            <div>
              <span className="text-2xl font-black text-amber-950 dark:text-amber-200">
                {effectiveReviewCount > 0 ? (computedAvg || 5.0).toFixed(1) : '—'}
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400 block font-medium">
                {effectiveReviewCount > 0 ? tAuto('k0615') : 'Chưa có đánh giá'}
              </span>
            </div>
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
                  style={{ width: `${effectiveReviewCount > 0 ? (c.score / 5) * 100 : 0}%` }}
                />
              </div>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {effectiveReviewCount > 0 ? c.score.toFixed(1) : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews List */}
      {visibleReviews.length === 0 ? (
        <div className="p-6 text-center rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-500">
          {tAuto('k0616')}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleReviews.map((rev) => (
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

      {/* Review Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Viết đánh giá phòng trọ"
        description="Đánh giá của bạn sẽ giúp cộng đồng người thuê có góc nhìn chân thực nhất."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Overall Rating */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-amber-950 dark:text-amber-200 block">
                Đánh giá chung
              </label>
              <span className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                Mức độ hài lòng tổng quan
              </span>
            </div>
            <Rating
              value={rating}
              max={5}
              size="lg"
              interactive
              onChange={(val) => setRating(val)}
            />
          </div>

          {/* Criteria Ratings */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-foreground block">
              Chi tiết các tiêu chí (1 - 5 sao)
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-border/50 text-xs">
                <span className="text-foreground-muted font-medium">Vệ sinh & Sạch sẽ</span>
                <Rating value={cleanliness} max={5} size="sm" interactive onChange={setCleanliness} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-border/50 text-xs">
                <span className="text-foreground-muted font-medium">Vị trí & Tiện ích</span>
                <Rating value={location} max={5} size="sm" interactive onChange={setLocation} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-border/50 text-xs">
                <span className="text-foreground-muted font-medium">Giá trị tương xứng</span>
                <Rating value={priceQuality} max={5} size="sm" interactive onChange={setPriceQuality} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-border/50 text-xs">
                <span className="text-foreground-muted font-medium">An ninh & Trật tự</span>
                <Rating value={security} max={5} size="sm" interactive onChange={setSecurity} />
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Nội dung đánh giá & nhận xét <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về phòng ốc, tiện ích, thái độ của chủ trọ..."
              className="w-full text-xs rounded-xl border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
