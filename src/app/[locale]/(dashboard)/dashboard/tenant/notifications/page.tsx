'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Bell, Calendar, CreditCard, FileCheck, CheckCheck } from 'lucide-react';
import { toast } from '@/presentation/stores/toast.store';

export default function TenantNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Hóa đơn tiền phòng tháng 11/2026 đã sẵn sàng',
      content: 'Chủ trọ đã chốt chỉ số điện nước. Tổng tiền cần thanh toán là 5.280.000 đ trước ngày 15/11.',
      type: 'INVOICE',
      time: '2 giờ trước',
      read: false,
    },
    {
      id: 2,
      title: 'Lịch hẹn xem phòng đã được xác nhận',
      content: 'Chủ nhà Trần Minh Tuấn đã đồng ý lịch hẹn vào 09:30 Thứ Bảy (09/11).',
      type: 'APPOINTMENT',
      time: 'Hôm qua',
      read: true,
    },
    {
      id: 3,
      title: 'Hợp đồng điện tử HĐ-2026-0042 đã có hiệu lực',
      content: 'Cả hai bên đã hoàn tất ký số điện tử với mã OTP định danh an toàn.',
      type: 'CONTRACT',
      time: '5 ngày trước',
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc!');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'APPOINTMENT':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      default:
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Thông báo ({notifications.filter((n) => !n.read).length} chưa đọc)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Cập nhật tức thời về lịch hẹn, hóa đơn tiền phòng và hợp đồng thuê.
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
              {getIcon(n.type)}
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

