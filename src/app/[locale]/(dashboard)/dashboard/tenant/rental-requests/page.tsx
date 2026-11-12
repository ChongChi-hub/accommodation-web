'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import { Send, FileText, ArrowRight } from 'lucide-react';

export default function TenantRentalRequestsPage() {
  const tAuto = useTranslations('autoI18n');
  const requests = [
    {
      id: 1,
      roomId: 1,
      roomTitle: 'Chung cư mini ban công rộng tại Dịch Vọng Hậu',
      price: '4.800.000 đ/tháng',
      startDate: '15/11/2026',
      duration: '12 tháng',
      status: 'APPROVED',
      statusText: 'Chủ nhà đã chấp thuận',
      note: 'Chờ tạo và ký hợp đồng điện tử',
    },
    {
      id: 2,
      roomId: 3,
      roomTitle: 'Căn hộ mini trung tâm Láng Hạ gần rạp chiếu phim',
      price: '5.500.000 đ/tháng',
      startDate: '01/12/2026',
      duration: '6 tháng',
      status: 'PENDING',
      statusText: 'Đang chờ xét duyệt hồ sơ',
      note: 'Đã gửi hồ sơ CCCD kèm theo',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0212')}{requests.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {tAuto('k0386')}
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <Badge variant={r.status === 'APPROVED' ? 'success' : 'warning'} size="md">
                {r.statusText}
              </Badge>
              <span className="text-xs text-stone-400">{tAuto('k0387')}{' '}{r.startDate}</span>
            </div>

            <div>
              <Link href={`/rooms/${r.roomId}`} className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-teal-700">
                {r.roomTitle}
              </Link>
              <p className="text-xs text-stone-500 mt-1">
                {tAuto('k0388')}{' '}<span className="font-semibold text-teal-700">{r.price}</span>{' '}{tAuto('k0389')}{' '}{r.duration}
              </p>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs text-stone-600 dark:text-stone-300 flex items-center justify-between">
              <span>{r.note}</span>
              {r.status === 'APPROVED' && (
                <Link href="/dashboard/tenant/contracts">
                  <Button variant="primary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                    {tAuto('k0312')}
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

