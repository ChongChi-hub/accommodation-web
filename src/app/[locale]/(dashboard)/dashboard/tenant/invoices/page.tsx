'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import { CreditCard, Calendar, ArrowRight } from 'lucide-react';

export default function TenantInvoicesPage() {
  const tAuto = useTranslations('autoI18n');
  const invoices = [
    {
      id: 1,
      invoiceCode: 'INV-2026-11',
      month: 'Tháng 11/2026',
      totalAmount: '5.280.000 đ',
      roomAmount: '4.800.000 đ',
      utilityAmount: '480.000 đ',
      dueDate: '15/11/2026',
      status: 'UNPAID',
      statusText: 'Chưa thanh toán',
    },
    {
      id: 2,
      invoiceCode: 'INV-2026-10',
      month: 'Tháng 10/2026',
      totalAmount: '5.210.000 đ',
      roomAmount: '4.800.000 đ',
      utilityAmount: '410.000 đ',
      dueDate: '15/10/2026',
      status: 'PAID',
      statusText: 'Đã thanh toán',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0334')}{invoices.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {tAuto('k0335')}
        </p>
      </div>

      <div className="space-y-4">
        {invoices.map((inv) => (
          <Card key={inv.id} className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{inv.invoiceCode}</span>
                <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'} size="sm">
                  {inv.statusText}
                </Badge>
              </div>
              <span className="text-xs text-stone-400">{tAuto('k0336')}{' '}{inv.dueDate}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{inv.month}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {tAuto('k0337')}{' '}{inv.roomAmount}{' '}{tAuto('k0338')}{' '}{inv.utilityAmount}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-stone-400">{tAuto('k0339')}</p>
                <p className="text-xl font-black text-teal-800 dark:text-teal-400">{inv.totalAmount}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link href={`/dashboard/tenant/invoices/${inv.id}`}>
                <Button
                  variant={inv.status === 'UNPAID' ? 'secondary' : 'outline'}
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {inv.status === 'UNPAID' ? 'Thanh toán ngay' : 'Xem chi tiết'}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

