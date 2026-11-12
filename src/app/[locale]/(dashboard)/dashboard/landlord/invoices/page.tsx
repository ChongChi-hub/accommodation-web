'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Invoice } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import { Ban, Download, FileMinus, PlusCircle } from 'lucide-react';

export default function LandlordInvoicesPage() {
  const t = useTranslations('sprint3.invoice');
  const tc = useTranslations('sprint3.common');
  const user = useAuthStore((s) => s.user);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creditTarget, setCreditTarget] = useState<Invoice | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    contractId: '',
    tenantId: '',
    periodMonth: '',
    dueDate: '',
    baseRent: '4500000',
    electricityAmount: '250000',
    waterAmount: '90000',
    serviceAmount: '100000',
    otherAmount: '0',
  });
  const [creditForm, setCreditForm] = useState({ amount: '', reason: '' });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await container.billing.billingRepository.getLandlordInvoices();
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await container.billing.billingRepository.generateInvoice({
        contractId: form.contractId.trim(),
        tenantId: form.tenantId.trim(),
        landlordId: user?.id || 'landlord-self',
        periodMonth: form.periodMonth,
        dueDate: form.dueDate,
        baseRent: Number(form.baseRent),
        electricityAmount: Number(form.electricityAmount),
        waterAmount: Number(form.waterAmount),
        serviceAmount: Number(form.serviceAmount),
        otherAmount: Number(form.otherAmount),
      });
      setInvoices((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleIssueCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditTarget) return;
    setBusy(true);
    try {
      const cn = await container.billing.billingRepository.issueCreditNote(
        creditTarget.id,
        Number(creditForm.amount),
        creditForm.reason
      );
      setInvoices((prev) => [cn, ...prev]);
      setCreditTarget(null);
      setCreditForm({ amount: '', reason: '' });
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await container.billing.billingRepository.exportDashboardCsvBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'landlord-invoices.csv';
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
            {t('landlordTitle')} ({invoices.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">{t('landlordSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExportCsv}>
            {t('exportCsv')}
          </Button>
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />} onClick={() => setIsCreateOpen(true)}>
            {t('createInvoice')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tc('codeCol')}</TableHead>
              <TableHead>{t('periodMonth')}</TableHead>
              <TableHead>{t('totalAmount')}</TableHead>
              <TableHead>{t('paidAmount')}</TableHead>
              <TableHead>{t('dueDate')}</TableHead>
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead className="text-right">{tc('actionCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-xs py-6">{tc('loading')}</TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-xs py-6 text-stone-500">{t('empty')}</TableCell></TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-semibold">{inv.invoiceCode}</TableCell>
                  <TableCell className="text-xs">{formatIsoDate(inv.periodMonth)}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(inv.totalAmount)}</TableCell>
                  <TableCell className="text-xs">{formatVnd(inv.paidAmount)}</TableCell>
                  <TableCell className="text-xs text-stone-500">{formatIsoDate(inv.dueDate)}</TableCell>
                  <TableCell><Badge variant={inv.status === 'PAID' ? 'success' : 'warning'} size="sm">{inv.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<FileMinus className="w-3.5 h-3.5" />} onClick={() => setCreditTarget(inv)}>
                        {t('issueCreditNote')}
                      </Button>
                      {inv.status === 'UNPAID' && (
                        <Button variant="ghost" size="sm" leftIcon={<Ban className="w-3.5 h-3.5" />} onClick={async () => {
                          await container.billing.billingRepository.cancelInvoice(inv.id);
                          await loadData();
                          toast.success(tc('actionSuccess'));
                        }}>
                          {t('cancelInvoice')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('createInvoice')} size="md">
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Input label="Contract ID" required value={form.contractId} onChange={(e) => setForm((p) => ({ ...p, contractId: e.target.value }))} />
          <Input label="Tenant ID" required value={form.tenantId} onChange={(e) => setForm((p) => ({ ...p, tenantId: e.target.value }))} />
          <Input label={t('periodMonth')} type="date" required value={form.periodMonth} onChange={(e) => setForm((p) => ({ ...p, periodMonth: e.target.value }))} />
          <Input label={t('dueDate')} type="date" required value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
          <Input label={t('baseRent')} type="number" value={form.baseRent} onChange={(e) => setForm((p) => ({ ...p, baseRent: e.target.value }))} />
          <Input label={t('electricAmount')} type="number" value={form.electricityAmount} onChange={(e) => setForm((p) => ({ ...p, electricityAmount: e.target.value }))} />
          <Input label={t('waterAmount')} type="number" value={form.waterAmount} onChange={(e) => setForm((p) => ({ ...p, waterAmount: e.target.value }))} />
          <Input label={t('serviceAmount')} type="number" value={form.serviceAmount} onChange={(e) => setForm((p) => ({ ...p, serviceAmount: e.target.value }))} />
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>{tc('cancel')}</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={busy}>{t('createInvoice')}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog isOpen={Boolean(creditTarget)} onClose={() => setCreditTarget(null)} title={t('issueCreditNote')} size="sm">
        <form onSubmit={handleIssueCredit} className="space-y-3 pt-2">
          <Input label={t('creditAmount')} type="number" min={1} required value={creditForm.amount} onChange={(e) => setCreditForm((p) => ({ ...p, amount: e.target.value }))} />
          <Input label={t('creditReason')} required value={creditForm.reason} onChange={(e) => setCreditForm((p) => ({ ...p, reason: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreditTarget(null)}>{tc('cancel')}</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={busy}>{tc('confirm')}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
