'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import { FileText, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TenantContractsPage() {
  const tAuto = useTranslations('autoI18n');
  const contracts = [
    {
      id: 1,
      contractNumber: 'HĐ-2026-0042',
      roomTitle: 'Phòng 302, Chung cư mini Dịch Vọng Hậu',
      landlordName: 'Trần Minh Tuấn',
      price: '4.800.000 đ/tháng',
      startDate: '01/11/2026',
      endDate: '31/10/2027',
      status: 'ACTIVE',
      statusText: 'Đang có hiệu lực',
      signedAt: '30/10/2026',
    },
    {
      id: 2,
      contractNumber: 'HĐ-2025-0189',
      roomTitle: 'Phòng 401, Nhà trọ ngõ 118 Nguyễn Khánh Toàn',
      landlordName: 'Lê Văn Hoàng',
      price: '3.600.000 đ/tháng',
      startDate: '01/10/2025',
      endDate: '30/09/2026',
      status: 'EXPIRED',
      statusText: 'Đã hoàn thành',
      signedAt: '28/09/2025',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0297')}{contracts.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {tAuto('k0298')}
        </p>
      </div>

      <div className="space-y-4">
        {contracts.map((c) => (
          <Card key={c.id} className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{c.contractNumber}</span>
                <Badge variant={c.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                  {c.statusText}
                </Badge>
              </div>
              <span className="text-xs text-stone-400">{tAuto('k0299')}{' '}{c.signedAt}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{c.roomTitle}</h3>
              <p className="text-xs text-stone-500 mt-1">
                {tAuto('k0300')}{' '}<span className="font-semibold text-stone-700 dark:text-stone-300">{c.landlordName}</span>{' '}{tAuto('k0301')}{' '}<span className="font-bold text-teal-700">{c.price}</span>
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {tAuto('k0215')}{' '}{c.startDate}{' '}{tAuto('k0302')}{' '}{c.endDate}
              </span>
              <Link href={`/dashboard/tenant/contracts/${c.id}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {tAuto('k0303')}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

