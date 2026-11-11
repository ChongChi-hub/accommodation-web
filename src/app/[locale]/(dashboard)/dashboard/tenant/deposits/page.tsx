'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { PaymentIntent, RefundItem, TenantFinancialStats } from '@/domain/entities/Billing';
import { Contract } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { AlertTriangle, CheckCircle2, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';

export default function TenantDepositsPage() {
  const t = useTranslations('sprint3.deposit');
  const tc = useTranslations('sprint3.common');
  const [stats, setStats] = useState<TenantFinancialStats | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [depositAmount, setDepositAmount] = useState('2000000');
  const [busy, setBusy] = useState(false);

  const [refundForm, setRefundForm] = useState({
    contractId: '',
    landlordId: '',
    amount: '2000000',
    bankCode: 'VCB',
    accountNumber: '',
    accountHolder: '',
    otpCode: '',
    reason: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [s, cList, rList] = await Promise.all([
        container.billing.billingRepository.getTenantDashboardStats(),
        container.contract.contractRepository.getTenantContracts(),
        container.billing.billingRepository.getTenantRefunds(),
      ]);
      setStats(s);
      setContracts(cList);
      setRefunds(rList);
      if (cList.length > 0) {
        const first = cList[0];
        setSelectedContractId((prev) => prev || first.id);
        setDepositAmount((prev) => prev || String(first.depositAmount || 2000000));
        setRefundForm((prev) => ({
          ...prev,
          contractId: prev.contractId || first.id,
          landlordId: prev.landlordId || first.landlordId,
        }));
      }
    } catch {
      toast.error(tc('loadError'));
    }
  }, [tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) return;
    setBusy(true);
    try {
      const created = await container.billing.billingRepository.createPaymentIntent({
        orderType: 'DEPOSIT',
        orderId: selectedContractId,
        amount: Number(depositAmount),
      });
      setIntent(created);
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!intent) return;
    setBusy(true);
    try {
      await container.billing.billingRepository.simulateSandboxWebhook({
        paymentCode: intent.paymentCode,
        amount: intent.amount,
        status: 'PAID',
      });
      setIntent((prev) => (prev ? { ...prev, status: 'PAID' } : null));
      await loadData();
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await container.billing.billingRepository.requestRefund({
        ...refundForm,
        amount: Number(refundForm.amount),
      });
      setRefunds((prev) => [created, ...prev]);
      setRefundForm((p) => ({ ...p, otpCode: '', reason: '' }));
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          {t('tenantTitle')}
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('tenantSubtitle')}</p>
      </div>

      <Card className="p-4 border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{tc('sandboxNotice')}</span>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-400">{t('activeEscrow')}</p>
          <p className="text-xl font-black text-amber-600">{formatVnd(stats?.activeEscrowBalance)}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-400">{t('paidTotal')}</p>
          <p className="text-xl font-black text-teal-700">{formatVnd(stats?.totalPaidAmount)}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-400">{t('unpaidTotal')}</p>
          <p className="text-xl font-black text-stone-800 dark:text-stone-200">{formatVnd(stats?.unpaidInvoicesTotal)}</p>
        </Card>
      </div>

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-bold">{t('payDepositBtn')}</h2>
        <form onSubmit={handlePayDeposit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Input
            label={t('contractId')}
            required
            list="tenant-contracts-list"
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
          />
          <datalist id="tenant-contracts-list">
            {contracts.map((c) => <option key={c.id} value={c.id}>{c.contractCode}</option>)}
          </datalist>
          <Input label={t('amount')} type="number" min={1000} required value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
          <Button type="submit" variant="primary" size="md" isLoading={busy} leftIcon={<QrCode className="w-4 h-4" />}>
            {t('payDepositBtn')}
          </Button>
        </form>

        {intent && (
          <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-mono font-bold">{intent.paymentCode} ({intent.status})</p>
              <p>{t('amount')}: <strong>{formatVnd(intent.amount)}</strong></p>
              {intent.qrUrl && <img src={intent.qrUrl} alt={intent.paymentCode} className="w-28 h-28 rounded-lg border bg-white p-1" />}
            </div>
            {intent.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button variant="primary" size="sm" isLoading={busy} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={handleSimulateWebhook}>
                  {t('simulateSuccess')}
                </Button>
                <Button variant="outline" size="sm" isLoading={busy} onClick={async () => {
                  await container.billing.billingRepository.cancelPaymentIntent(intent.paymentCode);
                  setIntent((p) => (p ? { ...p, status: 'CANCELLED' } : null));
                }}>
                  {t('cancelIntent')}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-bold">{t('requestRefundBtn')}</h2>
        <form onSubmit={handleRequestRefund} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input label={t('contractId')} required value={refundForm.contractId} onChange={(e) => setRefundForm((p) => ({ ...p, contractId: e.target.value }))} />
          <Input label={t('landlordId')} required value={refundForm.landlordId} onChange={(e) => setRefundForm((p) => ({ ...p, landlordId: e.target.value }))} />
          <Input label={t('amount')} type="number" min={1000} required value={refundForm.amount} onChange={(e) => setRefundForm((p) => ({ ...p, amount: e.target.value }))} />
          <Input label={t('bankCode')} required value={refundForm.bankCode} onChange={(e) => setRefundForm((p) => ({ ...p, bankCode: e.target.value }))} />
          <Input label={t('accountNumber')} required value={refundForm.accountNumber} onChange={(e) => setRefundForm((p) => ({ ...p, accountNumber: e.target.value }))} />
          <Input label={t('accountHolder')} required value={refundForm.accountHolder} onChange={(e) => setRefundForm((p) => ({ ...p, accountHolder: e.target.value }))} />
          <Input label={t('otpCode')} required pattern="[0-9]{6}" maxLength={6} value={refundForm.otpCode} onChange={(e) => setRefundForm((p) => ({ ...p, otpCode: e.target.value }))} />
          <Input label={t('reason')} required value={refundForm.reason} onChange={(e) => setRefundForm((p) => ({ ...p, reason: e.target.value }))} />
          <div className="sm:col-span-4 flex justify-end">
            <Button type="submit" variant="secondary" size="sm" isLoading={busy} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              {t('requestRefundBtn')}
            </Button>
          </div>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>{t('contractId')}</TableHead>
              <TableHead>{t('amount')}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-xs py-5 text-stone-500">{t('emptyRefunds')}</TableCell></TableRow>
            ) : (
              refunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-semibold">{r.refundCode}</TableCell>
                  <TableCell className="font-mono text-xs">{r.contractId}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(r.amount)}</TableCell>
                  <TableCell><Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">{r.status}</Badge></TableCell>
                  <TableCell className="text-xs text-stone-500">{formatIsoDateTime(r.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
