'use client';
import { useTranslations } from 'next-intl';

import React, { useState, useEffect } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import { toast } from '@/presentation/stores/toast.store';
import { ShieldCheck, Clock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

interface HoldingDeposit {
  id: string;
  roomTitle: string;
  landlordName: string;
  amount: string;
  expiresAt: number;
  status: 'HELD_IN_ESCROW' | 'DISBURSED' | 'REFUNDED';
  contractId?: string;
}

export default function TenantDepositsPage() {
  const tAuto = useTranslations('autoI18n');
  const [deposits, setDeposits] = useState<HoldingDeposit[]>([
    {
      id: 'DEP-2026-0081',
      roomTitle: 'Phòng 302, Chung cư mini Dịch Vọng Hậu',
      landlordName: 'Trần Minh Tuấn',
      amount: '2.000.000 đ',
      expiresAt: Date.now() + 18 * 3600 * 1000 + 45 * 60 * 1000,
      status: 'HELD_IN_ESCROW',
      contractId: '1',
    },
    {
      id: 'DEP-2025-0104',
      roomTitle: 'Phòng 401, Nhà trọ Nguyễn Khánh Toàn',
      landlordName: 'Lê Văn Hoàng',
      amount: '1.500.000 đ',
      expiresAt: Date.now() - 30 * 86400 * 1000,
      status: 'DISBURSED',
      contractId: '2',
    },
  ]);

  const [timeLeft, setTimeLeft] = useState<string>('18 giờ 45 phút');

  useEffect(() => {
    const timer = setInterval(() => {
      const active = deposits.find((d) => d.status === 'HELD_IN_ESCROW');
      if (active) {
        const diff = Math.max(0, active.expiresAt - Date.now());
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deposits]);

  const handleRefund = (id: string) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'REFUNDED' as const } : d))
    );
    toast.success('Yêu cầu hoàn trả tiền cọc đã được gửi. Tiền sẽ về tài khoản trong 24h làm việc.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          {tAuto('k0304')}{deposits.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {tAuto('k0305')}
        </p>
      </div>

      <div className="space-y-4">
        {deposits.map((dep) => (
          <Card key={dep.id} className="p-5 space-y-4 border border-stone-200 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">{dep.id}</span>
                <Badge
                  variant={dep.status === 'HELD_IN_ESCROW' ? 'warning' : dep.status === 'DISBURSED' ? 'success' : 'neutral'}
                  size="sm"
                >
                  {dep.status === 'HELD_IN_ESCROW' ? 'Đang giữ chỗ (Escrow)' : dep.status === 'DISBURSED' ? 'Đã giải ngân' : 'Đã hoàn tiền'}
                </Badge>
              </div>
              {dep.status === 'HELD_IN_ESCROW' && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{tAuto('k0306')}{' '}{timeLeft}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-stone-400">{tAuto('k0307')}</p>
                <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">{dep.roomTitle}</p>
                <p className="text-stone-500 mt-0.5">{tAuto('k0300')}{' '}{dep.landlordName}</p>
              </div>
              <div>
                <p className="text-stone-400">{tAuto('k0308')}</p>
                <p className="text-lg font-black text-teal-800 dark:text-teal-400 mt-0.5">{dep.amount}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{tAuto('k0309')}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <AlertCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>{tAuto('k0310')}</span>
              </div>
              <div className="flex items-center gap-2">
                {dep.status === 'HELD_IN_ESCROW' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => handleRefund(dep.id)}
                  >
                    {tAuto('k0311')}
                  </Button>
                )}
                {dep.contractId && (
                  <Link href={`/dashboard/tenant/contracts/${dep.contractId}`}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      {tAuto('k0312')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
