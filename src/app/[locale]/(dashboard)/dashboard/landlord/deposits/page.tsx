'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { walletVerificationRepository } from '@/infrastructure/repositories/http-wallet-verification.repository';
import { EscrowHold, PayoutItem } from '@/domain/entities/Billing';
import { LandlordWalletSummary, WalletLedgerEntry } from '@/domain/entities/WalletVerification';
import { UserBankAccount } from '@/domain/entities/BankAccount';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { AlertTriangle, Landmark, ShieldCheck, XCircle } from 'lucide-react';
import { LandlordEscrowTable } from '@/presentation/components/billing/LandlordEscrowTable';
import { LandlordWalletPanel } from '@/presentation/components/billing/LandlordWalletPanel';
import { MandatoryBankAccountBanner } from '@/presentation/components/billing/MandatoryBankAccountBanner';

export default function LandlordDepositsPage() {
  const t = useTranslations('sprint3.deposit');
  const tc = useTranslations('sprint3.common');
  const [walletSummary, setWalletSummary] = useState<LandlordWalletSummary | null>(null);
  const [walletLedger, setWalletLedger] = useState<WalletLedgerEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [escrows, setEscrows] = useState<EscrowHold[]>([]);
  const [bankAccount, setBankAccount] = useState<UserBankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ amount: '50000', bankCode: 'VCB', accountNumber: '', accountHolder: '', otp: '' });

  const hasValidBank = Boolean(bankAccount && bankAccount.accountNumber && bankAccount.qrCodeUrl);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [wSum, wLed, pList, escList, bAcc] = await Promise.all([
        walletVerificationRepository.getLandlordWalletSummary(),
        walletVerificationRepository.getLandlordWalletLedger(100),
        container.billing.billingRepository.getPayouts(),
        container.billing.billingRepository.getLandlordEscrows(),
        container.bankAccount.bankAccountRepository.getMyBankAccount(),
      ]);
      setWalletSummary(wSum);
      setWalletLedger(wLed);
      setPayouts(pList);
      setEscrows(escList);
      setBankAccount(bAcc);
      if (bAcc) {
        setForm((p) => ({
          ...p,
          bankCode: bAcc.bankCode || p.bankCode,
          accountNumber: bAcc.accountNumber || p.accountNumber,
          accountHolder: bAcc.accountHolder || p.accountHolder,
        }));
      }
    } catch {
      setLoadError('Không thể tải dữ liệu Ví chủ trọ & Ký quỹ. Vui lòng thử lại.');
      toast.error(tc('loadError'));
    } finally {
      setLoading(false);
    }
  }, [tc]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleConfirmMoveIn = async (contractId: string) => {
    if (!hasValidBank) {
      toast.error('Bắt buộc: Vui lòng cung cấp Số tài khoản ngân hàng và Mã QR tại mục Tài khoản ngân hàng & QR trước khi bàn giao phòng!');
      return;
    }
    setBusy(true);
    try {
      await container.billing.billingRepository.confirmMoveIn(contractId);
      await loadData();
      toast.success('Bàn giao phòng thành công! Khi đủ 2 xác nhận, phần cọc giải phóng sẽ tự động cộng vào Ví chủ trọ.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleRejectProof = async (contractId: string, reason: string) => {
    setBusy(true);
    try {
      await container.billing.billingRepository.rejectEscrowProof(contractId, reason);
      await loadData();
      toast.success('Đã ghi nhận từ chối biên lai hỗ trợ không hợp lệ.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Từ chối biên lai thất bại');
    } finally {
      setBusy(false);
    }
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidBank) {
      toast.error('Bắt buộc: Vui lòng cung cấp Số tài khoản ngân hàng (MATCHED) và Mã QR trước khi yêu cầu rút tiền!');
      return;
    }
    setBusy(true);
    try {
      const idemKey = `wd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const created = await walletVerificationRepository.requestPayoutIdempotent({
        amount: Number(form.amount), bankCode: form.bankCode.trim(),
        accountNumber: form.accountNumber.trim(), accountHolder: form.accountHolder.trim(), otp: form.otp.trim(),
      }, idemKey);
      setPayouts((prev) => [created, ...prev]);
      setForm((p) => ({ ...p, otp: '' }));
      await loadData();
      toast.success('Đã tạo yêu cầu rút tiền! Số dư khả dụng đã tạm giữ, chờ Admin chuyển khoản thật và xác nhận.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleCancelPayout = async (id: string) => {
    setBusy(true);
    try {
      await walletVerificationRepository.cancelPayout(id);
      await loadData();
      toast.success('Đã hủy yêu cầu rút tiền và hoàn số dư về Ví khả dụng.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể hủy yêu cầu rút tiền');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          Ví Chủ Trọ &amp; Quản Lý Tiền Cọc
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('landlordSubtitle')}</p>
      </div>

      <MandatoryBankAccountBanner bankAccount={bankAccount} role="LANDLORD" />

      <Card className="p-4 border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Tiền cọc và tiền thuê tháng do Sàn xác minh qua webhook biến động số dư. Khi tạo yêu cầu rút, số dư sẽ chuyển sang tạm giữ chờ Admin chuyển khoản thật.
        </span>
      </Card>

      <LandlordWalletPanel
        summary={walletSummary}
        ledgerEntries={walletLedger}
        loading={loading}
        error={loadError}
        onRetry={loadData}
      />

      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold">{t('requestPayoutBtn')}</h2>
          <span className="text-[11px] text-stone-500">
            Tối thiểu {formatVnd(walletSummary?.withdrawalMinAmount ?? 1000)} | Chuyển về tài khoản ngân hàng đã xác minh
          </span>
        </div>
        <form onSubmit={handlePayout} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <Input label={t('amount')} type="number" min={walletSummary?.withdrawalMinAmount ?? 1000} required value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
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

      <LandlordEscrowTable
        escrows={escrows}
        busy={busy}
        onConfirmMoveIn={handleConfirmMoveIn}
        onRejectProof={handleRejectProof}
        contractLabel={t('contractId')}
        amountLabel={t('amount')}
        actionColLabel={tc('actionCol')}
      />

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold">
          {t('payoutHistory')} ({payouts.length})
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tc('codeCol')}</TableHead>
                <TableHead>{t('bankCode')}</TableHead>
                <TableHead>{t('accountNumber')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                <TableHead>Mã GD ngân hàng</TableHead>
                <TableHead>{tc('statusCol')}</TableHead>
                <TableHead>{tc('dateCol')}</TableHead>
                <TableHead className="text-right">{tc('actionCol')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-xs py-6 text-stone-500">{t('emptyPayouts')}</TableCell></TableRow>
              ) : (
                payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-semibold whitespace-nowrap">{p.payoutCode}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{p.bankCode}</TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{p.accountNumber}</TableCell>
                    <TableCell className="font-bold text-teal-700 dark:text-teal-400 whitespace-nowrap">{formatVnd(p.amount)}</TableCell>
                    <TableCell className="font-mono text-xs text-stone-600 dark:text-stone-300">{p.bankTxCode || '--'}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'PAID' || p.status === 'COMPLETED' ? 'success' : p.status === 'REJECTED' || p.status === 'CANCELLED' ? 'danger' : 'warning'} size="sm">
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">{formatIsoDateTime(p.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {(p.status === 'REQUESTED' || p.status === 'PENDING_APPROVAL') && (
                        <Button variant="outline" size="sm" isLoading={busy} leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => handleCancelPayout(p.id)}>
                          Hủy yêu cầu
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
