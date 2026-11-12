'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Star, MessageSquare } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function TenantReviewsPage() {
  const tAuto = useTranslations('autoI18n');
  const reviews = [
    {
      id: 1,
      roomId: 1,
      roomTitle: 'Chung cư mini ban công rộng tại Dịch Vọng Hậu',
      rating: 5,
      date: '10/10/2026',
      comment: 'Phòng rất đẹp và mới giống y hình ảnh chụp. Anh Tuấn chủ nhà hỗ trợ rất nhiệt tình, thủ tục hợp đồng minh bạch.',
      landlordReply: 'Cảm ơn em đã tin tưởng và thuê phòng tại Tổ Ấm, có cần hỗ trợ gì cứ nhắn anh nhé!',
    },
    {
      id: 2,
      roomId: 2,
      roomTitle: 'Studio ngập tràn ánh sáng view công viên Quan Hoa',
      rating: 4,
      date: '15/09/2026',
      comment: 'Phòng thoáng mát nhiều ánh sáng, ban công ngắm hoàng hôn rất chill. Chỉ có ngõ vào hơi nhỏ một chút.',
      landlordReply: 'Cảm ơn em đã đóng góp ý kiến, bên anh đã lắp thêm đèn chiếu sáng ngõ để đi lại an toàn hơn rồi nhé.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0392')}{reviews.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {tAuto('k0393')}
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <Card key={r.id} className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <Link href={`/rooms/${r.roomId}`} className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-teal-700">
                {r.roomTitle}
              </Link>
              <div className="flex items-center gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-amber-600 ml-1">{r.rating}.0</span>
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
    </div>
  );
}

