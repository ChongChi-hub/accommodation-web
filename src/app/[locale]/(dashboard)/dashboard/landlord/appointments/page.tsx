'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { Calendar, Phone, Check, X, Clock, MessageSquare } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function LandlordAppointmentsPage() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      tenantName: 'Nguyễn Văn Thuê',
      tenantPhone: '0987 654 321',
      roomTitle: 'Phòng 302, Chung cư mini Dịch Vọng Hậu',
      dateTime: '09:30 Thứ Bảy (09/11/2026)',
      status: 'CONFIRMED',
      statusText: 'Đã xác nhận',
      note: 'Đi cùng 1 bạn cùng phòng xem phòng',
    },
    {
      id: 2,
      tenantName: 'Lê Thị Mai',
      tenantPhone: '0901 234 567',
      roomTitle: 'Studio ngập tràn ánh sáng view công viên Quan Hoa',
      dateTime: '15:00 Thứ Ba (12/11/2026)',
      status: 'PENDING',
      statusText: 'Chờ duyệt',
      note: 'Xem phòng sau giờ làm việc',
    },
  ]);

  const handleApprove = (id: number) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'CONFIRMED', statusText: 'Đã xác nhận' } : a))
    );
    toast.success('Đã xác nhận lịch hẹn! Hệ thống đã gửi SMS cho khách thuê.');
  };

  const handleDecline = (id: number) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    toast.info('Đã từ chối lịch hẹn xem phòng.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Lịch hẹn xem phòng từ khách ({appointments.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Quản lý và sắp xếp các cuộc hẹn trực tiếp với khách tìm phòng.
        </p>
      </div>

      <div className="space-y-4">
        {appointments.map((a) => (
          <Card key={a.id} className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Badge variant={a.status === 'CONFIRMED' ? 'success' : 'warning'} size="md">
                  {a.statusText}
                </Badge>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" /> {a.dateTime}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-400">SĐT khách: </span>
                <span className="font-semibold text-teal-800 dark:text-teal-400">{a.tenantPhone}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{a.roomTitle}</p>
              <p className="text-xs text-stone-500">
                Khách hẹn: <span className="font-semibold">{a.tenantName}</span> • Lời nhắn: &ldquo;{a.note}&rdquo;
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Link href="/dashboard/landlord/messages">
                <Button variant="ghost" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                  Nhắn tin với khách
                </Button>
              </Link>
              {a.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<X className="w-3.5 h-3.5" />}
                    onClick={() => handleDecline(a.id)}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => handleApprove(a.id)}
                  >
                    Chấp thuận lịch hẹn
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
