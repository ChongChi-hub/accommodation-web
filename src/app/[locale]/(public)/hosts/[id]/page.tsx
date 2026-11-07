'use client';

import React, { use } from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Badge } from '@/presentation/components/ui/Badge';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { useRooms } from '@/presentation/hooks/useRooms';
import { ShieldCheck, Star, Calendar, MessageSquare, Phone } from 'lucide-react';

export default function HostProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { rooms, isLoading } = useRooms();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Tìm phòng', href: '/rooms' },
          { label: 'Hồ sơ chủ trọ' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 text-center space-y-4 h-fit">
          <Avatar name="Trần Minh Tuấn" size="xl" className="mx-auto" />
          <div>
            <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">Trần Minh Tuấn</h1>
            <p className="text-xs text-stone-400 mt-0.5">Chủ nhà trọ chuyên nghiệp</p>
          </div>

          <div className="flex justify-center gap-2">
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã xác minh CCCD
            </Badge>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-300">
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <p className="text-stone-400 text-[10px]">Đánh giá</p>
              <p className="font-bold flex items-center justify-center gap-1 mt-0.5 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9
              </p>
            </div>
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <p className="text-stone-400 text-[10px]">Tỉ lệ phản hồi</p>
              <p className="font-bold text-teal-700 dark:text-teal-400 mt-0.5">98%</p>
            </div>
          </div>

          <div className="space-y-2 text-left text-xs text-stone-500 pt-2">
            <p className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Tham gia Tổ Ấm từ năm 2024</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>Số điện thoại đã xác thực</span>
            </p>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Phòng đang cho thuê của chủ nhà ({rooms.length})
            </h2>
            <p className="text-xs text-stone-400">
              Mọi phòng đều được kiểm định trực tiếp về nội thất, diện tích và tính pháp lý.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rooms.slice(0, 4).map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

