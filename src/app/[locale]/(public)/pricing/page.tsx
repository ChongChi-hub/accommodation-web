'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Check, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function PricingPage() {
  const tAuto = useTranslations('autoI18n');
  const plans = [
    {
      name: 'Khách thuê trọ',
      price: '0 đ',
      period: 'trọn đời',
      desc: 'Dành cho người tìm phòng và thuê phòng',
      features: [
        'Tìm kiếm và xem phòng không giới hạn',
        'Đặt lịch hẹn xem phòng trực tiếp',
        'Ký hợp đồng thuê điện tử an toàn',
        'Quản lý và thanh toán hóa đơn online',
        'Hỗ trợ bảo vệ tiền cọc 100%',
      ],
      buttonText: 'Bắt đầu tìm phòng',
      href: '/rooms',
      isPopular: false,
    },
    {
      name: 'Chủ nhà trọ tiêu chuẩn',
      price: 'Miễn phí',
      period: 'cho 3 phòng đầu',
      desc: 'Dành cho chủ trọ cá nhân quy mô nhỏ',
      features: [
        'Đăng tối đa 3 phòng trọ miễn phí',
        'Hệ thống quản lý khách thuê & hợp đồng',
        'Ghi chỉ số điện nước hàng tháng',
        'Lập hóa đơn tự động gửi khách',
        'Nhận thông báo lịch hẹn qua email & app',
      ],
      buttonText: 'Đăng phòng ngay',
      href: '/dashboard/landlord/rooms/new',
      isPopular: true,
    },
    {
      name: 'Tòa nhà chuyên nghiệp (PRO)',
      price: '299.000 đ',
      period: '/tháng',
      desc: 'Dành cho chủ nhiều tòa chung cư mini',
      features: [
        'Không giới hạn số lượng phòng đăng',
        'Huy hiệu Tòa nhà uy tín ưu tiên hiển thị',
        'Báo cáo doanh thu & công nợ chuyên sâu',
        'Nhắc nợ tự động qua SMS & Zalo',
        'Hỗ trợ kỹ thuật 24/7 riêng biệt',
      ],
      buttonText: 'Liên hệ tư vấn',
      href: '/contact',
      isPopular: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Breadcrumb items={[{ label: 'Bảng giá dịch vụ' }]} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">
          {tAuto('k0424')}
        </h1>
        <p className="text-xs text-stone-500 max-w-xl mx-auto">
          {tAuto('k0425')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <Card
            key={idx}
            className={`p-6 flex flex-col justify-between relative ${
              p.isPopular
                ? 'border-2 border-teal-700 shadow-md ring-4 ring-teal-50 dark:ring-teal-950/50'
                : ''
            }`}
          >
            {p.isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />{' '}{tAuto('k0426')}
              </span>
            )}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{p.name}</h3>
                <p className="text-xs text-stone-400 mt-0.5">{p.desc}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-stone-900 dark:text-stone-100">{p.price}</span>
                <span className="text-xs text-stone-400">{p.period}</span>
              </div>

              <ul className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <Link href={p.href} className="block">
                <Button
                  variant={p.isPopular ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  {p.buttonText}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

