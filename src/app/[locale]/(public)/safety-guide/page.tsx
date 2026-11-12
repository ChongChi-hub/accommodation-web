'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { ShieldAlert, CheckCircle2, FileCheck, Eye, CreditCard } from 'lucide-react';

export default function SafetyGuidePage() {
  const tAuto = useTranslations('autoI18n');
  const tips = [
    {
      icon: <Eye className="w-5 h-5 text-teal-700" />,
      title: '1. Luôn đến xem phòng trực tiếp',
      desc: 'Không bao giờ chuyển tiền đặt cọc khi chưa xem phòng và chưa gặp trực tiếp chủ nhà hoặc quản lý tòa nhà được ủy quyền.',
    },
    {
      icon: <FileCheck className="w-5 h-5 text-teal-700" />,
      title: '2. Đọc kỹ điều khoản hợp đồng',
      desc: 'Kiểm tra rõ thời hạn thuê, giá tiền phòng, giá điện nước theo quy định, tiền cọc và điều kiện hoàn lại tiền cọc khi hết hợp đồng.',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-teal-700" />,
      title: '3. Giữ biên lai và chứng từ thanh toán',
      desc: 'Mọi khoản thanh toán nên chuyển khoản có nội dung rõ ràng hoặc lưu lại phiếu thu, hóa đơn điện tử trong ứng dụng Tổ Ấm.',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-teal-700" />,
      title: '4. Kiểm tra trang thiết bị lúc nhận phòng',
      desc: 'Lập biên bản bàn giao ghi rõ hiện trạng máy lạnh, bình nóng lạnh, nội thất và đồng hồ điện nước ngay ngày đầu chuyển đến.',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Cẩm nang thuê an toàn' }]} />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0440')}
        </h1>
        <p className="text-xs text-stone-500 max-w-2xl">
          {tAuto('k0441')}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong>{tAuto('k0442')}</strong>{' '}{tAuto('k0443')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tips.map((t, idx) => (
          <Card key={idx} className="p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
              {t.icon}
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{t.title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">{t.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

