'use client';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function FaqPage() {
  const tAuto = useTranslations('autoI18n');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Tổ Ấm có thu phí của người tìm phòng không?',
      a: 'Không. Toàn bộ tính năng tìm kiếm, liên hệ, đặt lịch hẹn và ký hợp đồng thuê trọ trên Tổ Ấm đều hoàn toàn miễn phí đối với người thuê.',
    },
    {
      q: 'Làm sao để biết phòng trọ đã được xác thực thực tế?',
      a: 'Các phòng có huy hiệu màu xanh lá "Đã xác thực" đã được đội ngũ cộng tác viên của Tổ Ấm đến kiểm tra thực địa, đo diện tích, xác minh giá và chụp ảnh xác nhận.',
    },
    {
      q: 'Hợp đồng điện tử trên Tổ Ấm có giá trị pháp lý không?',
      a: 'Có. Hợp đồng điện tử trên Tổ Ấm được tạo lập căn cứ theo Luật Giao dịch điện tử Việt Nam và Bộ luật Dân sự, có chữ ký số xác thực OTP gửi về số điện thoại đã định danh.',
    },
    {
      q: 'Nếu chủ trọ không hoàn trả tiền cọc thì xử lý thế nào?',
      a: 'Hệ thống lưu trữ lịch sử hợp đồng và biên bản bàn giao. Nếu phát sinh tranh chấp, ban hỗ trợ pháp lý Tổ Ấm sẽ đóng vai trò trung gian hòa giải và bảo vệ quyền lợi hợp pháp của các bên.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Câu hỏi thường gặp' }]} />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0422')}
        </h1>
        <p className="text-xs text-stone-500">
          {tAuto('k0423')}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <Card
              key={idx}
              className="p-5 cursor-pointer transition-all"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-teal-700 shrink-0" />
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{faq.q}</h3>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0',
                    isOpen && 'rotate-180 text-teal-700'
                  )}
                />
              </div>
              {isOpen && (
                <p className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 leading-relaxed pl-7">
                  {faq.a}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

