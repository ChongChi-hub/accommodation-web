'use client';

import React, { use, useMemo } from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Badge } from '@/presentation/components/ui/Badge';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { useRooms } from '@/presentation/hooks/useRooms';
import { ShieldCheck, Star, Home, MapPin } from 'lucide-react';

export default function HostProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { rooms, isLoading } = useRooms({ page: 1, size: 100 });

  const hostRooms = useMemo(() => {
    const matched = rooms.filter((r) => String(r.landlordId) === id);
    return matched;
  }, [rooms, id]);

  const primaryRoom = hostRooms[0];
  const hostName = primaryRoom?.landlordName || `Chủ trọ #${id}`;
  const isVerified = Boolean(primaryRoom?.isLandlordVerified);
  const ratedRooms = hostRooms.filter((r) => r.reviewCount > 0 && r.ratingAvg > 0);
  const avgRating = ratedRooms.length > 0
    ? (ratedRooms.reduce((sum, r) => sum + r.ratingAvg, 0) / ratedRooms.length).toFixed(1)
    : null;
  const provinces = useMemo(
    () => Array.from(new Set(hostRooms.map((r) => r.provinceName || r.provinceCode).filter(Boolean))),
    [hostRooms]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Tìm phòng', href: '/rooms' },
          { label: hostName },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 text-center space-y-4 h-fit">
          <Avatar name={hostName} size="xl" className="mx-auto" />
          <div>
            <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">{hostName}</h1>
            <p className="text-xs text-stone-400 mt-0.5">Mã chủ trọ: {id}</p>
          </div>

          <div className="flex justify-center gap-2">
            {isVerified ? (
              <Badge variant="success" size="sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Đã xác minh CCCD
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Chưa xác minh danh tính
              </Badge>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-300">
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <p className="text-stone-400 text-[10px]">Đánh giá</p>
              <p className="font-bold flex items-center justify-center gap-1 mt-0.5 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {avgRating ?? 'Chưa có'}
              </p>
            </div>
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <p className="text-stone-400 text-[10px]">Phòng đang đăng</p>
              <p className="font-bold text-teal-700 dark:text-teal-400 mt-0.5">{hostRooms.length}</p>
            </div>
          </div>

          <div className="space-y-2 text-left text-xs text-stone-500 pt-2">
            <p className="flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{hostRooms.length > 0 ? `${hostRooms.length} tin đăng đang hiển thị` : 'Chưa có phòng khả dụng'}</span>
            </p>
            {provinces.length > 0 && (
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Khu vực: {provinces.join(', ')}</span>
              </p>
            )}
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Phòng đang cho thuê của chủ nhà ({hostRooms.length})
            </h2>
            <p className="text-xs text-stone-400">
              Danh sách tin đăng thực tế gắn với chủ trọ này trên hệ thống Tổ Ấm.
            </p>
          </div>

          {isLoading ? (
            <Card className="p-6 text-sm text-stone-500">Đang tải danh sách phòng của chủ trọ...</Card>
          ) : hostRooms.length === 0 ? (
            <Card className="p-6 text-sm text-stone-500">Chưa tìm thấy phòng đang hoạt động nào của chủ trọ này.</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hostRooms.map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

