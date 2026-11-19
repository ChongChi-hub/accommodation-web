'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { container } from '@/infrastructure/di/container';
import { Invoice, PaymentIntent } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import { CreditCard, Download, Gauge, ShieldCheck } from 'lucide-react';
import { VietQrRealPaymentCard } from '@/presentation/components/billing/VietQrRealPaymentCard';

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
      const [inv, activeIntent] = await Promise.all([
        container.billing.billingRepository.getInvoice(id),
        container.billing.billingRepository.getPendingPaymentIntent('INVOICE', id).catch(() => null),
      ]);
      setInvoice(inv);
      if (activeIntent) setIntent(activeIntent);
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
      toast.success('Đã tạo mã VietQR thanh toán hóa đơn về tài khoản sàn Tổ Ấm!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleCancelIntent = async () => {
    if (!intent) return;
    try {
      if (intent.status === 'PENDING') {
        await container.billing.billingRepository.cancelPaymentIntent(intent.paymentCode);
      }
      setIntent(null);
    } catch {
      setIntent(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[{ label: t('tenantTitle'), href: '/dashboard/tenant/invoices' }, { label: invoice.invoiceCode }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{invoice.invoiceCode}</h1>
            <Badge variant={invoice.status === 'PAID' ? 'success' : 'warning'} size="md">{invoice.status}</Badge>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('periodMonth')}: {formatIsoDate(invoice.periodMonth)} | {t('dueDate')}: {formatIsoDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/tenant/utilities">
            <Button variant="outline" size="sm" leftIcon={<Gauge className="w-3.5 h-3.5" />}>
              Xem chỉ số &amp; ảnh điện nước
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={async () => {
              try {
                const blob = await container.billing.billingRepository.downloadInvoiceReceiptPdfBlob(invoice.id);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt-${invoice.invoiceCode}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : tc('actionError'));
              }
            }}
          >
            Tải PDF
          </Button>
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && !intent && (
            <Button variant="primary" size="sm" isLoading={busy} leftIcon={<CreditCard className="w-3.5 h-3.5" />} onClick={handleCreateIntent}>
              Tạo mã VietQR thanh toán
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4 border-teal-200 bg-teal-50/50 dark:bg-teal-950/20 flex items-start gap-2.5 text-xs text-teal-900 dark:text-teal-200">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-600" />
        <span>
          Tiền phòng và điện nước hàng tháng được chuyển về tài khoản sàn Tổ Ấm (LE THANH CUONG). Sau khi bấm &quot;Tôi đã chuyển tiền&quot;, Admin sẽ kiểm tra và duyệt thanh toán để cộng doanh thu vào ví chủ trọ.
        </span>
      </Card>

      <Card className="p-5 space-y-2 text-xs">
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('baseRent')}</span><strong>{formatVnd(invoice.baseRent)}</strong></div>
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('electricAmount')}</span><strong>{formatVnd(invoice.electricityAmount)}</strong></div>
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('waterAmount')}</span><strong>{formatVnd(invoice.waterAmount)}</strong></div>
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('serviceAmount')}</span><strong>{formatVnd(invoice.serviceAmount)}</strong></div>
        <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800"><span>{t('otherAmount')}</span><strong>{formatVnd(invoice.otherAmount)}</strong></div>
        <div className="flex justify-between py-2 text-sm font-bold"><span>{t('totalAmount')}</span><span className="text-teal-700">{formatVnd(invoice.totalAmount)}</span></div>
        <div className="flex justify-between py-1 text-stone-500"><span>{t('paidAmount')}</span><span>{formatVnd(invoice.paidAmount)}</span></div>
        <div className="flex justify-between py-1 font-bold text-amber-700"><span>{t('remainingAmount')}</span><span>{formatVnd(remaining)}</span></div>
      </Card>

      {intent && invoice.status !== 'PAID' && (
        <VietQrRealPaymentCard
          intent={intent}
          onPaid={() => loadData()}
          onCancel={handleCancelIntent}
          onSubmitted={() => loadData()}
        />
      )}
    </div>
  );
}
