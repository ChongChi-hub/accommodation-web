'use client';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { Link } from '@/i18n/routing';
import { UserCheck, Check, X, FileText, ShieldCheck } from 'lucide-react';

export default function LandlordRentalRequestsPage() {
  const tAuto = useTranslations('autoI18n');
  const [requests, setRequests] = useState([
    {
      id: 1,
      tenantName: 'Nguyễn Văn Thuê',
      tenantPhone: '0987 654 321',
      idNumber: '001202012345',
      roomTitle: 'Phòng 302, Chung cư mini Dịch Vọng Hậu',
      price: '4.800.000 đ/tháng',
      startDate: '15/11/2026',
      duration: '12 tháng',
      status: 'PENDING',
      statusText: 'Chờ xét duyệt',
    },
  ]);

  const handleApprove = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED', statusText: 'Đã chấp thuận' } : r))
    );
    toast.success('Đã chấp thuận yêu cầu thuê! Bạn có thể tạo hợp đồng điện tử ngay bây giờ.');
  };

  const handleReject = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.info('Đã từ chối yêu cầu thuê phòng.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0212')}{requests.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {tAuto('k0213')}
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id} className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Badge variant={r.status === 'APPROVED' ? 'success' : 'warning'} size="md">
                  {r.statusText}
                </Badge>
                <span className="text-xs text-stone-400">{tAuto('k0214')}{' '}{r.startDate}</span>
              </div>
              <span className="text-xs text-stone-500">{tAuto('k0215')}{' '}{r.duration}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-stone-400">{tAuto('k0216')}</p>
                <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">{r.roomTitle}</p>
                <p className="font-semibold text-teal-700 mt-0.5">{r.price}</p>
              </div>
              <div>
                <p className="text-stone-400">{tAuto('k0217')}</p>
                <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">{r.tenantName}</p>
                <p className="text-stone-500 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{tAuto('k0218')}{' '}{r.idNumber}{' '}{tAuto('k0219')}{' '}{r.tenantPhone}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {r.status === 'PENDING' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<X className="w-3.5 h-3.5" />}
                    onClick={() => handleReject(r.id)}
                  >
                    {tAuto('k0082')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => handleApprove(r.id)}
                  >
                    {tAuto('k0220')}
                  </Button>
                </>
              ) : (
                <Link href="/dashboard/landlord/contracts">
                  <Button variant="primary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                    {tAuto('k0221')}
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

