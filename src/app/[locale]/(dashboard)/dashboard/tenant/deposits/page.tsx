'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { VietQrRealPaymentCard } from '@/presentation/components/billing/VietQrRealPaymentCard';
import { EscrowHold, PaymentIntent, RefundItem, TenantFinancialStats } from '@/domain/entities/Billing';
import { Contract } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { AlertTriangle, CheckCircle2, Lock, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';

export default function TenantDepositsPage() {
  const t = useTranslations('sprint3.deposit');
  const tc = useTranslations('sprint3.common');
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<TenantFinancialStats | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [escrows, setEscrows] = useState<EscrowHold[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || null;
  const awaitingContracts = contracts.filter((c) => c.status === 'AWAITING_DEPOSIT');
  const computedDepositAmount = selectedContract ? Number(selectedContract.depositAmount || selectedContract.monthlyRent || 0) : 0;

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
      const [s, cList, rList, escList] = await Promise.all([
        container.billing.billingRepository.getTenantDashboardStats(),
        container.contract.contractRepository.getTenantContracts(),
        container.billing.billingRepository.getTenantRefunds(),
        container.billing.billingRepository.getTenantEscrows(),
      ]);
      setStats(s);
      setContracts(cList);
      setRefunds(rList);
      setEscrows(escList);
      if (cList.length > 0) {
        const queryContractId = searchParams.get('contractId');
        const preferred =
          (queryContractId ? cList.find((c) => c.id === queryContractId) : null) ||
          cList.find((c) => c.status === 'AWAITING_DEPOSIT') ||
          cList[0];
        setSelectedContractId((prev) => prev || preferred.id);
        setRefundForm((prev) => ({
          ...prev,
          contractId: prev.contractId || preferred.id,
          landlordId: prev.landlordId || preferred.landlordId,
          amount: prev.amount || String(preferred.depositAmount || 2000000),
        }));
      }
    } catch {
      toast.error(tc('loadError'));
    }
  }, [tc, searchParams]);

  useEffect(() => {
    if (!selectedContractId) return;
    let active = true;
    container.billing.billingRepository
      .getPendingPaymentIntent('DEPOSIT', selectedContractId)
      .then((pending) => {
        if (active && pending) setIntent(pending);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [selectedContractId]);

  const handleConfirmMoveIn = async (contractId: string) => {
    setBusy(true);
    try {
      await container.billing.billingRepository.confirmMoveIn(contractId);
      await loadData();
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

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
        amount: computedDepositAmount,
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

      <Card className="p-4 border-teal-300 bg-teal-50/70 dark:bg-teal-950/30 flex items-start gap-2.5 text-xs text-teal-900 dark:text-teal-200">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-600" />
        <span>Quỹ ký quỹ Escrow bảo đảm hai chiều: Tiền cọc được giữ an toàn tại tài khoản trung gian của Tổ Ấm và chỉ giải ngân sau khi hai bên ký nhận bàn giao phòng.</span>
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold">Thanh toán tiền cọc giữ chỗ (VietQR)</h2>
          <Badge variant="info" size="sm">BẢO ĐẢM ESCROW</Badge>
        </div>
        <form onSubmit={handlePayDeposit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              {t('contractId')}
            </label>
            <select
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
              value={selectedContractId}
              onChange={(e) => {
                setSelectedContractId(e.target.value);
                setIntent(null);
              }}
              required
            >
              {contracts.length === 0 && <option value="">--</option>}
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contractCode} ({c.status}) - {formatVnd(c.depositAmount || c.monthlyRent)}
                </option>
              ))}
            </select>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
            <p className="text-[11px] text-stone-500">{t('amount')}</p>
            <p className="text-sm font-black text-teal-700 dark:text-teal-400" data-testid="server-deposit-amount">
              {computedDepositAmount > 0 ? formatVnd(computedDepositAmount) : '--'}
            </p>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={busy}
            disabled={!selectedContract || busy}
            leftIcon={<QrCode className="w-4 h-4" />}
          >
            Tạo mã thanh toán VietQR
          </Button>
        </form>

        {intent && (
          <VietQrRealPaymentCard
            intent={intent}
            onPaid={async () => {
              await loadData();
            }}
            onCancel={async () => {
              try {
                await container.billing.billingRepository.cancelPaymentIntent(intent.paymentCode);
              } catch {
                // ignore
              }
              setIntent((p) => (p ? { ...p, status: 'CANCELLED' } : null));
            }}
          />
        )}
      </Card>

      {/* Escrow Holds List */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
          <span>Danh sách Ký quỹ Tiền cọc Hợp đồng ({escrows.length})</span>
          <span className="text-[11px] text-stone-500 font-normal">Quản lý ký quỹ Escrow bảo đảm hai chiều</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('contractId')}</TableHead>
              <TableHead>{t('amount')}</TableHead>
              <TableHead>Trạng thái Ký quỹ</TableHead>
              <TableHead>Xác nhận dọn vào</TableHead>
              <TableHead className="text-right">{tc('actionCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escrows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs py-5 text-stone-500">
                  Chưa có khoản tiền cọc hợp đồng nào trong quỹ Escrow
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
                    <span className={e.tenantConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      {e.tenantConfirmedMoveIn ? '[Đã dọn vào]' : '[Chờ bạn xác nhận]'}
                    </span>
                    <span className="mx-1.5 text-stone-300">|</span>
                    <span className={e.landlordConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      {e.landlordConfirmedMoveIn ? '[Đã giao phòng]' : '[Chờ bàn giao]'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {e.status === 'HELD' && !e.tenantConfirmedMoveIn && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={busy}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => handleConfirmMoveIn(e.contractId)}
                      >
                        Xác nhận nhận phòng
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
              <TableHead>{tc('codeCol')}</TableHead>
              <TableHead>{t('contractId')}</TableHead>
              <TableHead>{t('amount')}</TableHead>
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead>{tc('dateCol')}</TableHead>
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
