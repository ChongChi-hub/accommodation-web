'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { toast } from '@/presentation/stores/toast.store';
import { Star, MessageSquare, Reply, EyeOff, ShieldAlert } from 'lucide-react';
import { container } from '@/infrastructure/di/container';
import { ReviewDto } from '@/application/dto/listing.dto';
import { formatIsoDate } from '@/shared/utils/format-vnd';

export default function LandlordReviewsPage() {
  const tAuto = useTranslations('autoI18n');
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyInput, setReplyInput] = useState<{ [key: number]: string }>({});
  const [isReplying, setIsReplying] = useState<{ [key: number]: boolean }>({});

  const stats = React.useMemo(() => {
    const total = reviews.length;
    const visibleReviews = reviews.filter((r) => !r.status || r.status.toUpperCase() === 'VISIBLE');
    const hiddenCount = reviews.filter((r) => r.status && r.status.toUpperCase() === 'HIDDEN').length;
    const avg = visibleReviews.length > 0
      ? Math.round((visibleReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / visibleReviews.length) * 10) / 10
      : 0;
    return {
      total,
      visibleCount: visibleReviews.length,
      hiddenCount,
      avg,
    };
  }, [reviews]);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      if (container.listing.listingRepository.getLandlordReviews) {
        const data = await container.listing.listingRepository.getLandlordReviews();
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

  const handleSendReply = async (id: number) => {
    const text = replyInput[id]?.trim();
    if (!text) return;
    setIsReplying((p) => ({ ...p, [id]: true }));
    try {
      if (container.listing.listingRepository.replyReview) {
        const updated = await container.listing.listingRepository.replyReview(id, text);
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, landlordReply: updated.landlordReply || text } : r))
        );
      } else {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, landlordReply: text } : r))
        );
      }
      setReplyInput((prev) => ({ ...prev, [id]: '' }));
      toast.success('Đã gửi phản hồi đánh giá cho khách thuê!');
    } catch {
      toast.error('Lỗi khi gửi phản hồi đánh giá');
    } finally {
      setIsReplying((p) => ({ ...p, [id]: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0222')}{reviews.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {tAuto('k0223')}
        </p>
      </div>

      {/* Overview Stats Cards */}
      {!isLoading && reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted font-medium">Điểm đánh giá trung bình</p>
              <p className="text-lg font-black text-foreground">
                {stats.avg > 0 ? `${stats.avg.toFixed(1)} / 5.0` : 'Chưa có'}
              </p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted font-medium">Tổng số đánh giá</p>
              <p className="text-lg font-black text-foreground">{stats.total}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted font-medium">Trạng thái hiển thị</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                <span className="text-emerald-600 font-bold">{stats.visibleCount} hiển thị</span>
                {stats.hiddenCount > 0 && (
                  <span className="text-amber-600 font-bold ml-1">({stats.hiddenCount} bị ẩn)</span>
                )}
              </p>
            </div>
          </Card>
        </div>
      )}

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
          <h3 className="text-sm font-semibold text-foreground">Chưa có đánh giá nào</h3>
          <p className="text-xs text-foreground-muted max-w-sm">
            Khi khách thuê hoàn tất kỳ thuê và để lại đánh giá cho phòng trọ của bạn, các đánh giá sẽ hiển thị tại đây.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.tenantName || 'Tenant'} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{r.tenantName}</p>
                    <p className="text-[10px] text-stone-400">{r.roomTitle || `Phòng trọ #${r.roomId}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === 'HIDDEN' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/60 px-2 py-0.5 rounded-full">
                      <EyeOff className="w-3 h-3" /> Đã bị ẩn
                    </span>
                  )}
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
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{r.comment}</p>

              {r.landlordReply ? (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-xs text-teal-900 dark:text-teal-300 border-l-2 border-teal-700">
                  <span className="font-bold">{tAuto('k0224')}{' '}</span>
                  <span>{r.landlordReply}</span>
                </div>
              ) : (
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Viết câu trả lời cảm ơn hoặc giải đáp..."
                    value={replyInput[r.id] || ''}
                    onChange={(e) => setReplyInput({ ...replyInput, [r.id]: e.target.value })}
                    className="flex-1 bg-stone-50 dark:bg-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isReplying[r.id]}
                    onClick={() => handleSendReply(r.id)}
                    leftIcon={<Reply className="w-3.5 h-3.5" />}
                  >
                    {tAuto('k0225')}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
