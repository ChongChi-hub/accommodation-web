'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import { Search, MapPin, Tag, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from '@/presentation/stores/toast.store';

export default function TenantSavedSearchesPage() {
  const savedSearches = [
    {
      id: 1,
      title: 'Chung cư mini Cầu Giấy dưới 5 triệu',
      location: 'Cầu Giấy, Hà Nội',
      priceRange: '3 - 5 triệu',
      roomType: 'Chung cư mini',
      notifications: true,
      lastUpdated: 'Hôm nay',
    },
    {
      id: 2,
      title: 'Studio Quận 1 có ban công & nuôi mèo',
      location: 'Quận 1, TP.HCM',
      priceRange: '6 - 9 triệu',
      roomType: 'Căn hộ Studio',
      notifications: false,
      lastUpdated: '3 ngày trước',
    },
  ];

  const handleDelete = (id: number) => {
    toast.success('Đã xóa bộ lọc tìm kiếm đã lưu!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Tìm kiếm đã lưu
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Nhận thông báo tự động ngay khi có phòng mới đúng tiêu chí của bạn.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {savedSearches.map((s) => (
          <Card key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{s.title}</h3>
                <Badge variant="primary" size="sm">{s.roomType}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" /> {s.location}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400" /> {s.priceRange}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/rooms">
                <Button variant="outline" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
                  Xem kết quả
                </Button>
              </Link>
              <button
                onClick={() => handleDelete(s.id)}
                className="p-2 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                aria-label="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
