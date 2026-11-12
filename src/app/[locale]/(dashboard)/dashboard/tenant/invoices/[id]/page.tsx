'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { container } from '@/infrastructure/di/container';
import { Invoice, PaymentIntent } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import { AlertTriangle, CheckCircle2, CreditCard } from 'lucide-react';

export default function TenantInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations('sprint3.invoice');
  const tc = useTranslations('sprint3.common');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const inv = await container.billing.billingRepository.getInvoice(id);
      setInvoice(inv);
    } catch {
      toast.error(tc('loadError'));
    }
  }, [id, tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!invoice) {
    return <Skeleton className="h-72 w-full max-w-3xl rounded-xl" />;
  }

  const remaining = Math.max(0, invoice.totalAmount - invoice.paidAmount);

  const handleCreateIntent = async () => {
    setBusy(true);
    try {
      const created = await container.billing.billingRepository.createPaymentIntent({
        orderType: 'INVOICE',
        orderId: invoice.id,
        amount: remaining || invoice.totalAmount,
      });
      setIntent(created);
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleSimulatePay = async () => {
    if (!intent) return;
    setBusy(true);
    try {
      await container.billing.billingRepository.simulateSandboxWebhook({
        paymentCode: intent.paymentCode,
        amount: intent.amount,
        status: 'PAID',
      });
      setIntent((p) => (p ? { ...p, status: 'PAID' } : null));
      await loadData();
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb items={[{ label: t('tenantTitle'), href: '/dashboard/tenant/invoices' }, { label: invoice.invoiceCode }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{invoice.invoiceCode}</h1>
            <Badge variant={invoice.status === 'PAID' ? 'success' : 'warning'} size="md">{invoice.status}</Badge>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{t('periodMonth')}: {formatIsoDate(invoice.periodMonth)} • {t('dueDate')}: {formatIsoDate(invoice.dueDate)}</p>
        </div>
        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
          <Button variant="secondary" size="md" isLoading={busy} leftIcon={<CreditCard className="w-4 h-4" />} onClick={handleCreateIntent}>
            {t('payOnline')}
          </Button>
        )}
      </div>

      <Card className="p-4 border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{tc('sandboxNotice')}</span>
      </Card>

      <Card className="p-6 space-y-2 text-xs">
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('baseRent')}</span><strong>{formatVnd(invoice.baseRent)}</strong></div>
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('electricAmount')}</span><strong>{formatVnd(invoice.electricityAmount)}</strong></div>
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('waterAmount')}</span><strong>{formatVnd(invoice.waterAmount)}</strong></div>
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('serviceAmount')}</span><strong>{formatVnd(invoice.serviceAmount)}</strong></div>
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('otherAmount')}</span><strong>{formatVnd(invoice.otherAmount)}</strong></div>
        <div className="flex justify-between py-2 text-sm font-bold"><span>{t('totalAmount')}</span><span className="text-teal-700">{formatVnd(invoice.totalAmount)}</span></div>
        <div className="flex justify-between py-1 text-stone-500"><span>{t('paidAmount')}</span><span>{formatVnd(invoice.paidAmount)}</span></div>
        <div className="flex justify-between py-1 font-bold text-amber-700"><span>{t('remainingAmount')}</span><span>{formatVnd(remaining)}</span></div>
      </Card>

      {intent && (
        <Card className="p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <p className="font-mono font-bold">{intent.paymentCode} ({intent.status})</p>
            <p>{t('totalAmount')}: <strong>{formatVnd(intent.amount)}</strong></p>
            {intent.qrUrl && <img src={intent.qrUrl} alt={intent.paymentCode} className="w-28 h-28 rounded-lg border bg-white p-1" />}
          </div>
          {intent.status === 'PENDING' && (
            <Button variant="primary" size="sm" isLoading={busy} leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={handleSimulatePay}>
              {t('simulatePaid')}
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
