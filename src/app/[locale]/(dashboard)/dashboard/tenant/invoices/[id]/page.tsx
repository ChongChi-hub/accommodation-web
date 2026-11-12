'use client';
import { useTranslations } from 'next-intl';

import React, { use, useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { toast } from '@/presentation/stores/toast.store';
import { CreditCard, QrCode, CheckCircle2, Zap, Droplets, Wifi, Sparkles, Building } from 'lucide-react';

export default function TenantInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tAuto = useTranslations('autoI18n');
  const { id } = use(params);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handlePay = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsPaid(true);
      setIsPayModalOpen(false);
      toast.success('Thanh toán hóa đơn 5.280.000 đ thành công!');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb
        items={[
          { label: 'Hóa đơn', href: '/dashboard/tenant/invoices' },
          { label: 'INV-2026-11' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {tAuto('k0313')}
            </h1>
            <Badge variant={isPaid ? 'success' : 'warning'} size="md">
              {isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
            </Badge>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{tAuto('k0314')}</p>
        </div>

        {!isPaid && (
          <Button
            variant="secondary"
            size="md"
            leftIcon={<CreditCard className="w-4 h-4" />}
            onClick={() => setIsPayModalOpen(true)}
          >
            {tAuto('k0315')}
          </Button>
        )}
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">{tAuto('k0316')}</h2>
        <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-stone-600 dark:text-stone-400">{tAuto('k0317')}</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{tAuto('k0318')}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <div>
              <p className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />{' '}{tAuto('k0319')}
              </p>
              <p className="text-[11px] text-stone-400">{tAuto('k0320')}</p>
            </div>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{tAuto('k0321')}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <div>
              <p className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-500" />{' '}{tAuto('k0322')}
              </p>
              <p className="text-[11px] text-stone-400">{tAuto('k0323')}</p>
            </div>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{tAuto('k0324')}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-teal-500" />{' '}{tAuto('k0325')}
            </span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{tAuto('k0326')}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />{' '}{tAuto('k0327')}
            </span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{tAuto('k0328')}</span>
          </div>

          <div className="pt-4 flex justify-between items-baseline">
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{tAuto('k0329')}</span>
            <span className="text-2xl font-black text-teal-800 dark:text-teal-400">{tAuto('k0330')}</span>
          </div>
        </div>
      </Card>

      <Dialog
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Thanh toán hóa đơn tiền phòng"
        description="Quét mã QR VietQR hoặc thanh toán bằng thẻ ATM / Thẻ quốc tế."
      >
        <div className="space-y-4 pt-2 text-center">
          <div className="w-48 h-48 mx-auto bg-stone-100 dark:bg-stone-800 rounded-2xl flex flex-col items-center justify-center p-3 border border-stone-200 dark:border-stone-700">
            <QrCode className="w-32 h-32 text-stone-900 dark:text-stone-100" />
            <span className="text-[10px] text-stone-500 mt-1">{tAuto('k0331')}</span>
          </div>
          <div>
            <p className="text-xs text-stone-400">{tAuto('k0332')}</p>
            <p className="text-xl font-bold text-teal-800 dark:text-teal-400">{tAuto('k0330')}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button variant="outline" size="sm" onClick={() => setIsPayModalOpen(false)}>
              {tAuto('k0154')}
            </Button>
            <Button variant="primary" size="sm" isLoading={isPaying} onClick={handlePay}>
              {tAuto('k0333')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

