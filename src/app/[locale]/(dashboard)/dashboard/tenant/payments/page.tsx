'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { Invoice } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { Download } from 'lucide-react';

export default function TenantPaymentsPage() {
  const t = useTranslations('sprint3.invoice');
  const tc = useTranslations('sprint3.common');
  const [items, setItems] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const invoices = await container.billing.billingRepository.getTenantInvoices();
      setItems(invoices.filter((inv) => inv.paidAmount > 0 || inv.status === 'PAID' || inv.status === 'PARTIAL'));
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = async () => {
    try {
      const blob = await container.billing.billingRepository.exportDashboardCsvBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tenant-payments.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t('paymentsTitle')} ({items.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">{t('paymentsSubtitle')}</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExportCsv}>
          {t('exportCsv')}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>{t('periodMonth')}</TableHead>
              <TableHead>{t('paidAmount')}</TableHead>
              <TableHead>{t('totalAmount')}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs py-6">{tc('loading')}</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs py-6 text-stone-500">{t('empty')}</TableCell></TableRow>
            ) : (
              items.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-semibold">{inv.invoiceCode}</TableCell>
                  <TableCell className="text-xs">{formatIsoDate(inv.periodMonth)}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(inv.paidAmount)}</TableCell>
                  <TableCell className="text-xs">{formatVnd(inv.totalAmount)}</TableCell>
                  <TableCell><Badge variant={inv.status === 'PAID' ? 'success' : 'warning'} size="sm">{inv.status}</Badge></TableCell>
                  <TableCell className="text-xs text-stone-500">{formatIsoDateTime(inv.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
