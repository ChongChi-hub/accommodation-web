'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Invoice } from '@/domain/entities/Billing';
import { Contract } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import { Ban, Download, FileMinus, Gauge, PlusCircle } from 'lucide-react';
import { LandlordCreateInvoiceDialog } from '@/presentation/components/billing/LandlordCreateInvoiceDialog';

export default function LandlordInvoicesPage() {
  const t = useTranslations('sprint3.invoice');
  const tc = useTranslations('sprint3.common');
  const user = useAuthStore((s) => s.user);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialContractId, setInitialContractId] = useState<string | undefined>(undefined);
  const [initialPeriodMonth, setInitialPeriodMonth] = useState<string | undefined>(undefined);
  const [creditTarget, setCreditTarget] = useState<Invoice | null>(null);
  const [busy, setBusy] = useState(false);
  const [creditForm, setCreditForm] = useState({ amount: '', reason: '' });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invList, contractList] = await Promise.all([
        container.billing.billingRepository.getLandlordInvoices(),
        container.contract.contractRepository.getLandlordContracts().catch(() => []),
      ]);
      setInvoices(invList);
      setContracts(contractList);
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get('contractId') || undefined;
      const pm = params.get('periodMonth') || undefined;
      if (cid) {
        setInitialContractId(cid);
        setInitialPeriodMonth(pm);
        setIsCreateOpen(true);
      }
    }
  }, [loadData]);

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
          <p className="text-xs text-stone-500 mt-0.5">
            Tạo hóa đơn tự động lấy tiền phòng theo Hợp đồng + chỉ số điện nước đã ghi. Khi khách thanh toán và Admin duyệt, 95% cộng vào Ví chủ trọ (trừ 5% hoa hồng sàn).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/landlord/utilities">
            <Button variant="outline" size="sm" leftIcon={<Gauge className="w-3.5 h-3.5" />}>
              Ghi chỉ số điện nước
            </Button>
          </Link>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExportCsv}>
            {t('exportCsv')}
          </Button>
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />} onClick={() => setIsCreateOpen(true)}>
            {t('createInvoice')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tc('codeCol')}</TableHead>
                <TableHead>{t('periodMonth')}</TableHead>
                <TableHead>Chi tiết (Phòng / Điện / Nước)</TableHead>
                <TableHead>{t('totalAmount')}</TableHead>
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
                    <TableCell className="font-mono text-xs font-semibold whitespace-nowrap">{inv.invoiceCode}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatIsoDate(inv.periodMonth)}</TableCell>
                    <TableCell className="text-[11px] text-stone-600 dark:text-stone-300">
                      Phòng: {formatVnd(inv.baseRent)} | Điện: {formatVnd(inv.electricityAmount)} | Nước: {formatVnd(inv.waterAmount)}
                    </TableCell>
                    <TableCell className="font-bold text-teal-700 whitespace-nowrap">{formatVnd(inv.totalAmount)}</TableCell>
                    <TableCell className="text-xs text-stone-500 whitespace-nowrap">{formatIsoDate(inv.dueDate)}</TableCell>
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
                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <Button variant="outline" size="sm" onClick={async () => {
                            try {
                              await container.billing.billingRepository.remindInvoice(inv.id);
                              toast.success(t('remindSuccess'));
                            } catch (err: unknown) {
                              toast.error(err instanceof Error ? err.message : tc('actionError'));
                            }
                          }}>
                            {t('remindBtn')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <LandlordCreateInvoiceDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        contracts={contracts}
        landlordId={user?.id || 'landlord-self'}
        initialContractId={initialContractId}
        initialPeriodMonth={initialPeriodMonth}
        onCreated={(created) => setInvoices((prev) => [created, ...prev])}
      />

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
