'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { Invoice } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import { ArrowRight, Receipt } from 'lucide-react';

export default function TenantInvoicesPage() {
  const t = useTranslations('sprint3.invoice');
  const tc = useTranslations('sprint3.common');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await container.billing.billingRepository.getTenantInvoices();
      setInvoices(list);
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('tenantTitle')} ({invoices.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('tenantSubtitle')}</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-xl" />
      ) : invoices.length === 0 ? (
        <EmptyState icon={<Receipt className="w-8 h-8" />} title={t('empty')} />
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <Card key={inv.id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold">{inv.invoiceCode}</span>
                  <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'danger' : 'warning'} size="sm">
                    {inv.status}
                  </Badge>
                </div>
                <span className="text-xs text-stone-500">{t('dueDate')}: {formatIsoDate(inv.dueDate)}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="space-y-1 text-stone-600 dark:text-stone-300">
                  <p>{t('periodMonth')}: <strong>{formatIsoDate(inv.periodMonth)}</strong></p>
                  <p>
                    {t('baseRent')}: {formatVnd(inv.baseRent)} • {t('electricAmount')}: {formatVnd(inv.electricityAmount)} • {t('waterAmount')}: {formatVnd(inv.waterAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-stone-400">{t('totalAmount')}</p>
                  <p className="text-lg font-black text-teal-700">{formatVnd(inv.totalAmount)}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href={`/dashboard/tenant/invoices/${inv.id}`}>
                  <Button variant={inv.status !== 'PAID' ? 'secondary' : 'outline'} size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {inv.status !== 'PAID' ? t('payOnline') : tc('viewDetail')}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
