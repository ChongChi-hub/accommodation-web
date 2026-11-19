'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { walletVerificationRepository } from '@/infrastructure/repositories/http-wallet-verification.repository';
import { EscrowHold, PayoutItem } from '@/domain/entities/Billing';
import { LandlordWalletSummary, WalletLedgerEntry } from '@/domain/entities/WalletVerification';
import { UserBankAccount } from '@/domain/entities/BankAccount';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { AlertTriangle, Eye, Landmark, ShieldCheck, XCircle } from 'lucide-react';
import { LandlordEscrowTable } from '@/presentation/components/billing/LandlordEscrowTable';
import { LandlordWalletPanel } from '@/presentation/components/billing/LandlordWalletPanel';
import { MandatoryBankAccountBanner } from '@/presentation/components/billing/MandatoryBankAccountBanner';
import { LandlordPayoutModal } from '@/presentation/components/billing/LandlordPayoutModal';
import { PayoutReceiptPreviewModal } from '@/presentation/components/billing/PayoutReceiptPreviewModal';

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
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [receiptPayout, setReceiptPayout] = useState<PayoutItem | null>(null);

  const hasValidBank = Boolean(bankAccount && bankAccount.accountNumber && bankAccount.qrCodeUrl);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
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
    } catch {
      if (!silent) {
        setLoadError('Không thể tải dữ liệu Ví chủ trọ & Ký quỹ. Vui lòng thử lại.');
        toast.error(tc('loadError'));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tc]);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime status polling every 5s when any withdrawal request is active
  const hasPendingPayout = payouts.some((p) => p.status === 'REQUESTED' || p.status === 'PENDING_APPROVAL' || p.status === 'APPROVED');
  useEffect(() => {
    if (!hasPendingPayout) return;
    const timer = setInterval(() => { loadData(true); }, 5000);
    return () => clearInterval(timer);
  }, [hasPendingPayout, loadData]);

  const handleConfirmMoveIn = async (contractId: string) => {
    if (!hasValidBank) {
      toast.error('Bắt buộc: Vui lòng cung cấp Số tài khoản ngân hàng và Mã QR trước khi bàn giao phòng!');
      return;
    }
    setBusy(true);
    try {
      await container.billing.billingRepository.confirmMoveIn(contractId);
      await loadData();
      toast.success('Bàn giao phòng thành công! Khi đủ 2 xác nhận, 50% tiền cọc sẽ tự động cộng vào Ví chủ trọ.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally { setBusy(false); }
  };

  const handleRejectProof = async (contractId: string, reason: string) => {
    setBusy(true);
    try {
      await container.billing.billingRepository.rejectEscrowProof(contractId, reason);
      await loadData();
      toast.success('Đã ghi nhận từ chối biên lai hỗ trợ không hợp lệ.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Từ chối biên lai thất bại');
    } finally { setBusy(false); }
  };

  const handleCreatePayout = async (payload: { amount: number; bankCode: string; accountNumber: string; accountHolder: string; otp: string }) => {
    setBusy(true);
    try {
      const idemKey = `wd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const created = await walletVerificationRepository.requestPayoutIdempotent(payload, idemKey);
      setPayouts((prev) => [created, ...prev]);
      setIsPayoutModalOpen(false);
      await loadData(true);
      toast.success('Đã gửi lệnh rút tiền tới Admin! Số dư khả dụng đã tạm giữ chờ Admin chuyển khoản & xác nhận biên lai.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally { setBusy(false); }
  };

  const handleCancelPayout = async (id: string) => {
    setBusy(true);
    try {
      await walletVerificationRepository.cancelPayout(id);
      await loadData(true);
      toast.success('Đã hủy lệnh rút tiền và hoàn số dư về Ví khả dụng.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể hủy lệnh rút tiền');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Ví Chủ Trọ &amp; Quản Lý Tiền Cọc
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">{t('landlordSubtitle')}</p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Landmark className="w-4 h-4" />}
          onClick={() => {
            if (!hasValidBank) {
              toast.error('Vui lòng cung cấp Số tài khoản ngân hàng và Mã QR cá nhân trước khi tạo lệnh rút tiền!');
              return;
            }
            setIsPayoutModalOpen(true);
          }}
        >
          Tạo lệnh rút tiền
        </Button>
      </div>

      <MandatoryBankAccountBanner bankAccount={bankAccount} role="LANDLORD" />

      <Card className="p-4 border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Tiền cọc (50% sau khi đủ 2 xác nhận) và tiền thuê tháng (trừ 5% hoa hồng sàn) sẽ cộng vào Ví khả dụng sau khi Admin duyệt giao dịch. Bấm &quot;Tạo lệnh rút tiền&quot; để gửi yêu cầu giải ngân tới Admin.
        </span>
      </Card>

      <LandlordWalletPanel summary={walletSummary} ledgerEntries={walletLedger} loading={loading} error={loadError} onRetry={() => loadData()} />

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
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <span>{t('payoutHistory')} ({payouts.length})</span>
          {hasPendingPayout && <span className="text-[11px] font-normal text-teal-600">Đang tự động cập nhật trạng thái mỗi 5 giây</span>}
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
                <TableHead>Biên lai giải ngân</TableHead>
                <TableHead>{tc('statusCol')}</TableHead>
                <TableHead>{tc('dateCol')}</TableHead>
                <TableHead className="text-right">{tc('actionCol')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-xs py-6 text-stone-500">{t('emptyPayouts')}</TableCell></TableRow>
              ) : (
                payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-semibold whitespace-nowrap">{p.payoutCode}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{p.bankCode}</TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{p.accountNumber}</TableCell>
                    <TableCell className="font-bold text-teal-700 dark:text-teal-400 whitespace-nowrap">{formatVnd(p.amount)}</TableCell>
                    <TableCell className="font-mono text-xs text-stone-600 dark:text-stone-300 whitespace-nowrap">{p.bankTxCode || '--'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {p.proofUrl ? (
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setReceiptPayout(p)}>
                          Xem biên lai
                        </Button>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'PAID' || p.status === 'COMPLETED' ? 'success' : p.status === 'REJECTED' || p.status === 'CANCELLED' ? 'danger' : 'warning'} size="sm">
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-500 whitespace-nowrap">{formatIsoDateTime(p.createdAt)}</TableCell>
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

      <LandlordPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        bankAccount={bankAccount}
        availableBalance={walletSummary?.availableBalance ?? 0}
        minAmount={walletSummary?.withdrawalMinAmount ?? 1000}
        busy={busy}
        onConfirmSubmit={handleCreatePayout}
      />
      <PayoutReceiptPreviewModal payout={receiptPayout} onClose={() => setReceiptPayout(null)} />
    </div>
  );
}
