'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import { Calendar, Clock, MapPin, Phone, MessageSquare, X } from 'lucide-react';
import { toast } from '@/presentation/stores/toast.store';

export default function TenantAppointmentsPage() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      roomId: 1,
      roomTitle: 'Chung cư mini ban công rộng tại Dịch Vọng Hậu',
      address: 'Số 15 ngõ 92 Trần Thái Tông, Cầu Giấy',
      landlordName: 'Trần Minh Tuấn',
      landlordPhone: '0912345678',
      date: '09/11/2026',
      time: '09:30',
      status: 'CONFIRMED',
      statusText: 'Đã xác nhận',
      note: 'Đi cùng 1 bạn cùng phòng xem phòng',
    },
    {
      id: 2,
      roomId: 2,
      roomTitle: 'Studio ngập tràn ánh sáng view công viên Quan Hoa',
      address: 'Ngõ 118 Nguyễn Khánh Toàn, Quan Hoa',
      landlordName: 'Trần Minh Tuấn',
      landlordPhone: '0912345678',
      date: '12/11/2026',
      time: '15:00',
      status: 'PENDING',
      statusText: 'Chờ chủ nhà duyệt',
      note: 'Xem phòng sau giờ làm',
    },
  ]);

  const handleCancel = (id: number) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    toast.success('Đã hủy lịch hẹn xem phòng!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Lịch hẹn xem phòng ({appointments.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Theo dõi thời gian hẹn gặp trực tiếp chủ nhà tại phòng trọ.
          </p>
        </div>
        <Link href="/rooms">
          <Button variant="primary" size="sm" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
            Đặt hẹn phòng mới
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {appointments.map((a) => (
          <Card key={a.id} className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Badge
                  variant={a.status === 'CONFIRMED' ? 'success' : 'warning'}
                  size="md"
                >
                  {a.statusText}
                </Badge>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" /> {a.date} lúc {a.time}
                </span>
              </div>
              <button
                onClick={() => handleCancel(a.id)}
                className="text-xs text-stone-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Hủy lịch hẹn
              </button>
            </div>

            <div className="space-y-1">
              <Link href={`/rooms/${a.roomId}`} className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-teal-700">
                {a.roomTitle}
              </Link>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" /> {a.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-stone-600 dark:text-stone-300">
              <div>
                <span className="text-stone-400">Chủ trọ: </span>
                <span className="font-semibold">{a.landlordName}</span> ({a.landlordPhone})
              </div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/tenant/messages">
                  <Button variant="outline" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                    Nhắn tin chủ trọ
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

