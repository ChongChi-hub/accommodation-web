'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { Star, EyeOff, Check, Eye } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      tenantName: 'Nguyễn Văn Thuê',
      roomTitle: 'Chung cư mini ban công rộng tại Dịch Vọng Hậu',
      rating: 5,
      comment: 'Phòng rất đẹp và mới giống y hình ảnh chụp. Anh Tuấn chủ nhà hỗ trợ rất nhiệt tình.',
      status: 'VISIBLE',
    },
    {
      id: 2,
      tenantName: 'Tài khoản ẩn danh',
      roomTitle: 'Studio ngập tràn ánh sáng view công viên Quan Hoa',
      rating: 1,
      comment: 'Có dấu hiệu spam quảng cáo sang số điện thoại khác 09xx...',
      status: 'HIDDEN',
    },
  ]);

  const toggleVisibility = (id: number) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = r.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
          toast.info(`Đánh giá #${id} đã được chuyển sang trạng thái: ${next === 'VISIBLE' ? 'Hiển thị' : 'Đã ẩn'}`);
          return { ...r, status: next };
        }
        return r;
      })
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Quản lý đánh giá & bình luận ({reviews.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Giám sát nội dung bình luận để ngăn chặn từ ngữ thù địch, spam hoặc thông tin sai lệch.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người đánh giá</TableHead>
              <TableHead>Phòng trọ</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-semibold">{r.tenantName}</TableCell>
                <TableCell className="text-xs text-stone-500 max-w-[200px] truncate">{r.roomTitle}</TableCell>
                <TableCell>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {r.rating}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-stone-600 dark:text-stone-400 max-w-[260px]">
                  {r.comment}
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === 'VISIBLE' ? 'success' : 'neutral'} size="sm">
                    {r.status === 'VISIBLE' ? 'Hiển thị' : 'Đã ẩn'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleVisibility(r.id)}
                    leftIcon={r.status === 'VISIBLE' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  >
                    {r.status === 'VISIBLE' ? 'Ẩn review' : 'Hiện review'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
