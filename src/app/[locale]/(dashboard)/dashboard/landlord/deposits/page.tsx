'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { EscrowHold, LandlordFinancialStats, PayoutItem } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { AlertTriangle, CheckCircle2, KeyRound, Landmark, ShieldCheck } from 'lucide-react';

export default function LandlordDepositsPage() {
  const t = useTranslations('sprint3.deposit');
  const tc = useTranslations('sprint3.common');
  const [stats, setStats] = useState<LandlordFinancialStats | null>(null);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [escrows, setEscrows] = useState<EscrowHold[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    amount: '50000',
    bankCode: 'VCB',
    accountNumber: '',
    accountHolder: '',
    otp: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [s, pList, escList] = await Promise.all([
        container.billing.billingRepository.getLandlordDashboardStats(),
        container.billing.billingRepository.getPayouts(),
        container.billing.billingRepository.getLandlordEscrows(),
      ]);
      setStats(s);
      setPayouts(pList);
      setEscrows(escList);
    } catch {
      toast.error(tc('loadError'));
    }
  }, [tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmMoveIn = async (contractId: string) => {
    setBusy(true);
    try {
      await container.billing.billingRepository.confirmMoveIn(contractId);
      await loadData();
      toast.success('Bàn giao phòng thành công!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await container.billing.billingRepository.requestPayout({
        amount: Number(form.amount),
        bankCode: form.bankCode.trim(),
        accountNumber: form.accountNumber.trim(),
        accountHolder: form.accountHolder.trim(),
        otp: form.otp.trim(),
      });
      setPayouts((prev) => [created, ...prev]);
      setForm((p) => ({ ...p, otp: '' }));
      await loadData();
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
          {t('landlordTitle')}
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('landlordSubtitle')}</p>
      </div>

      <Card className="p-4 border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{tc('sandboxNotice')}</span>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-400">{t('pendingEscrow')}</p>
          <p className="text-xl font-black text-amber-600">{formatVnd(stats?.pendingEscrowBalance)}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-400">{t('availableBalance')}</p>
          <p className="text-xl font-black text-teal-700">{formatVnd(stats?.availableBalance)}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-400">{t('totalRevenue')}</p>
          <p className="text-xl font-black text-stone-800 dark:text-stone-200">{formatVnd(stats?.totalRevenue)}</p>
        </Card>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">{t('requestPayoutBtn')}</h2>
          <span className="text-[11px] text-stone-500">Hỗ trợ số tiền demo từ 1,000 VND (phục vụ OJT)</span>
        </div>
        <form onSubmit={handlePayout} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <Input label={t('amount')} type="number" min={1000} required value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
          <Input label={t('bankCode')} required value={form.bankCode} onChange={(e) => setForm((p) => ({ ...p, bankCode: e.target.value }))} />
          <Input label={t('accountNumber')} required value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))} />
          <Input label={t('accountHolder')} required value={form.accountHolder} onChange={(e) => setForm((p) => ({ ...p, accountHolder: e.target.value }))} />
          <Input label={t('otpCode')} required pattern="[0-9]{6}" maxLength={6} value={form.otp} onChange={(e) => setForm((p) => ({ ...p, otp: e.target.value }))} />
          <div className="sm:col-span-5 flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={busy} leftIcon={<Landmark className="w-3.5 h-3.5" />}>
              {t('requestPayoutBtn')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Landlord Escrow Holds List */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
          <span>Tiền cọc phòng đang ký quỹ Escrow ({escrows.length})</span>
          <span className="text-[11px] text-stone-500 font-normal">Quản lý bàn giao phòng & giải ngân cọc</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('contractId')}</TableHead>
              <TableHead>{t('amount')}</TableHead>
              <TableHead>Trạng thái Ký quỹ</TableHead>
              <TableHead>Tiến độ bàn giao</TableHead>
              <TableHead className="text-right">{tc('actionCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escrows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs py-5 text-stone-500">
                  Chưa có khoản tiền cọc nào thuộc phòng của bạn trong quỹ Escrow
                </TableCell>
              </TableRow>
            ) : (
              escrows.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs font-semibold">{e.contractId}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(e.amount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        e.status === 'RELEASED'
                          ? 'success'
                          : e.status === 'DISPUTE_FROZEN'
                          ? 'danger'
                          : e.status === 'HELD'
                          ? 'info'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className={e.landlordConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      {e.landlordConfirmedMoveIn ? '✓ Đã bàn giao chìa khóa' : '⏳ Chờ bạn bàn giao'}
                    </span>
                    <span className="mx-1.5 text-stone-300">|</span>
                    <span className={e.tenantConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      {e.tenantConfirmedMoveIn ? '✓ Khách đã nhận phòng' : '⏳ Khách chưa dọn vào'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {e.status === 'HELD' && !e.landlordConfirmedMoveIn && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={busy}
                        leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                        onClick={() => handleConfirmMoveIn(e.contractId)}
                      >
                        Bàn giao phòng
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold">
          {t('payoutHistory')} ({payouts.length})
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tc('codeCol')}</TableHead>
              <TableHead>{t('bankCode')}</TableHead>
              <TableHead>{t('accountNumber')}</TableHead>
              <TableHead>{t('amount')}</TableHead>
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead>{tc('dateCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs py-6 text-stone-500">{t('emptyPayouts')}</TableCell></TableRow>
            ) : (
              payouts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-semibold">{p.payoutCode}</TableCell>
                  <TableCell className="text-xs">{p.bankCode}</TableCell>
                  <TableCell className="font-mono text-xs">{p.accountNumber}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(p.amount)}</TableCell>
                  <TableCell><Badge variant={p.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">{p.status}</Badge></TableCell>
                  <TableCell className="text-xs text-stone-500">{formatIsoDateTime(p.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
