'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { container } from '@/infrastructure/di/container';
import { VietQrRealPaymentCard } from '@/presentation/components/billing/VietQrRealPaymentCard';
import { TenantEscrowTable } from '@/presentation/components/billing/TenantEscrowTable';
import { TenantRefundSection } from '@/presentation/components/billing/TenantRefundSection';
import { EscrowHold, PaymentIntent, RefundItem, TenantFinancialStats } from '@/domain/entities/Billing';
import { Contract } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatVnd } from '@/shared/utils/format-vnd';
import { CheckCircle2, QrCode, ShieldCheck } from 'lucide-react';

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
  const selectedEscrow = escrows.find((e) => e.contractId === selectedContractId) || null;
  const isDepositAlreadyPaid =
    (selectedContract && selectedContract.status !== 'AWAITING_DEPOSIT') ||
    (selectedEscrow && (selectedEscrow.status === 'HELD' || selectedEscrow.status === 'RELEASED'));
  const computedDepositAmount = selectedContract ? Number(selectedContract.depositAmount || selectedContract.monthlyRent || 0) : 0;

  const [refundForm, setRefundForm] = useState({
    contractId: '', landlordId: '', amount: '2000000',
    bankCode: 'VCB', accountNumber: '', accountHolder: '', otpCode: '', reason: '',
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
    return () => { active = false; };
  }, [selectedContractId]);

  useEffect(() => { loadData(); }, [loadData]);

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

  const handlePayDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId || isDepositAlreadyPaid) return;
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
          <Badge variant={isDepositAlreadyPaid ? 'success' : 'info'} size="sm">
            {isDepositAlreadyPaid ? 'ĐÃ HOÀN TẤT CỌC' : 'BẢO ĐẢM ESCROW'}
          </Badge>
        </div>

        <form onSubmit={handlePayDeposit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">{t('contractId')}</label>
            <select
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
              value={selectedContractId}
              onChange={(e) => { setSelectedContractId(e.target.value); setIntent(null); }}
              required
            >
              {contracts.length === 0 && <option value="">--</option>}
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>{c.contractCode} ({c.status}) - {formatVnd(c.depositAmount || c.monthlyRent)}</option>
              ))}
            </select>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
            <p className="text-[11px] text-stone-500">{t('amount')}</p>
            <p className="text-sm font-black text-teal-700 dark:text-teal-400" data-testid="server-deposit-amount">
              {computedDepositAmount > 0 ? formatVnd(computedDepositAmount) : '--'}
            </p>
          </div>
          <div>
            {isDepositAlreadyPaid ? (
              <Button type="button" variant="secondary" size="md" disabled className="w-full" leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}>
                Khoản cọc đã thanh toán
              </Button>
            ) : (
              <Button type="submit" variant="primary" size="md" isLoading={busy} disabled={!selectedContract || busy} leftIcon={<QrCode className="w-4 h-4" />}>
                Tạo mã thanh toán VietQR
              </Button>
            )}
          </div>
        </form>

        {isDepositAlreadyPaid && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>Khoản tiền cọc của hợp đồng này đã được thanh toán và bảo đảm tại Quỹ ký quỹ Escrow. Không cần tạo thêm mã thanh toán mới.</span>
          </div>
        )}

        {!isDepositAlreadyPaid && intent && (
          <VietQrRealPaymentCard
            intent={intent}
            onPaid={async () => { await loadData(); }}
            onCancel={async () => {
              try {
                await container.billing.billingRepository.cancelPaymentIntent(intent.paymentCode);
              } catch { /* ignore */ }
              setIntent((p) => (p ? { ...p, status: 'CANCELLED' } : null));
            }}
            onSubmitted={async () => { await loadData(); }}
          />
        )}
      </Card>

      <TenantEscrowTable
        escrows={escrows}
        busy={busy}
        onConfirmMoveIn={handleConfirmMoveIn}
        contractLabel={t('contractId')}
        amountLabel={t('amount')}
        actionColLabel={tc('actionCol')}
      />

      <TenantRefundSection
        refunds={refunds}
        refundForm={refundForm}
        setRefundForm={setRefundForm}
        onSubmitRefund={handleRequestRefund}
        busy={busy}
        t={t}
        tc={tc}
      />
    </div>
  );
}
