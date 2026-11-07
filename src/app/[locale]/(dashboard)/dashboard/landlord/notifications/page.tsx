'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Bell, Calendar, CreditCard, FileCheck, CheckCheck } from 'lucide-react';
import { toast } from '@/presentation/stores/toast.store';

export default function LandlordNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Khách thuê đã thanh toán hóa đơn INV-2026-10',
      content: 'Nguyễn Văn Thuê đã chuyển khoản thành công 5.210.000 đ qua VietQR.',
      time: '14/10/2026',
      read: true,
    },
    {
      id: 2,
      title: 'Lịch hẹn xem phòng mới cần duyệt',
      content: 'Lê Thị Mai vừa đăng ký xem phòng Studio Quan Hoa vào 15:00 Thứ Ba tuần sau.',
      time: 'Hôm nay',
      read: false,
    },
    {
      id: 3,
      title: 'Hợp đồng điện tử HĐ-2026-0042 đã được ký hoàn tất',
      content: 'Cả hai bên đã ký số điện tử. Phòng 302 chuyển sang trạng thái Đã cho thuê.',
      time: '30/10/2026',
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Thông báo hệ thống ({notifications.filter((n) => !n.read).length} chưa đọc)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Thông tin biến động về thanh toán, lịch hẹn và trạng thái phòng trọ.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          onClick={markAllRead}
        >
          Đọc tất cả
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`p-4 flex items-start gap-3.5 transition-colors ${
              !n.read
                ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-700/30'
                : 'bg-white dark:bg-stone-900'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-teal-700" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">{n.title}</h3>
                <span className="text-[10px] text-stone-400 shrink-0">{n.time}</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{n.content}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
