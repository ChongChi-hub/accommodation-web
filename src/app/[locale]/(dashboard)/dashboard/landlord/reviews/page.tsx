'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { toast } from '@/presentation/stores/toast.store';
import { Star, MessageSquare, Reply } from 'lucide-react';

export default function LandlordReviewsPage() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      tenantName: 'Nguyễn Văn Thuê',
      roomTitle: 'Phòng 302 (Dịch Vọng Hậu)',
      rating: 5,
      date: '10/10/2026',
      comment: 'Phòng rất đẹp và mới giống y hình ảnh chụp. Anh Tuấn chủ nhà hỗ trợ rất nhiệt tình, thủ tục hợp đồng minh bạch.',
      reply: 'Cảm ơn em đã tin tưởng và thuê phòng tại Tổ Ấm, có cần hỗ trợ gì cứ nhắn anh nhé!',
    },
    {
      id: 2,
      tenantName: 'Lê Thị Mai',
      roomTitle: 'Studio Quan Hoa view công viên',
      rating: 4,
      date: '15/09/2026',
      comment: 'Phòng thoáng mát nhiều ánh sáng, ban công ngắm hoàng hôn rất chill. Chỉ có ngõ vào hơi nhỏ một chút.',
      reply: '',
    },
  ]);

  const [replyInput, setReplyInput] = useState<{ [key: number]: string }>({});

  const handleSendReply = (id: number) => {
    const text = replyInput[id];
    if (!text) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reply: text } : r))
    );
    setReplyInput((prev) => ({ ...prev, [id]: '' }));
    toast.success('Đã gửi phản hồi đánh giá cho khách thuê!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Đánh giá nhận được ({reviews.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Phản hồi của khách thuê giúp nâng cao điểm uy tín và thu hút người thuê mới.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <Card key={r.id} className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <Avatar name={r.tenantName} size="sm" />
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{r.tenantName}</p>
                  <p className="text-[10px] text-stone-400">{r.roomTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-amber-600 ml-1">{r.rating}.0</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{r.comment}</p>

            {r.reply ? (
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-xs text-teal-900 dark:text-teal-300 border-l-2 border-teal-700">
                <span className="font-bold">Phản hồi của bạn: </span>
                <span>{r.reply}</span>
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
                  onClick={() => handleSendReply(r.id)}
                  leftIcon={<Reply className="w-3.5 h-3.5" />}
                >
                  Trả lời
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
