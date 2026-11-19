'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { PaymentIntent, PayoutItem } from '@/domain/entities/Billing';
import { UnmatchedBankInflowItem, formatShortRef } from '@/domain/entities/WalletVerification';
import { walletVerificationRepository } from '@/infrastructure/repositories/http-wallet-verification.repository';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { AlertTriangle, CheckCircle2, QrCode, ShieldCheck, XCircle } from 'lucide-react';
import { AdminPayoutQrModal } from './AdminPayoutQrModal';

interface Props {
  unmatchedInflows: UnmatchedBankInflowItem[];
  manualIntents: PaymentIntent[];
  payouts: PayoutItem[];
  platformFeeRevenue: number;
  onApprovePayout: (id: string) => Promise<void>;
  onRejectPayout: (id: string, reason: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function AdminInflowAndWithdrawalTab({
  unmatchedInflows, manualIntents, payouts, platformFeeRevenue, onApprovePayout, onRejectPayout, onRefresh,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [txCodes, setTxCodes] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [qrPayout, setQrPayout] = useState<PayoutItem | null>(null);

  const handleManualConfirm = async (intent: PaymentIntent) => {
    const bankTxCode = (txCodes[intent.paymentCode] || '').trim();
    const reason = (reasons[intent.paymentCode] || 'Admin đối soát sao kê ngân hàng xác nhận').trim();
    if (bankTxCode.length < 6) {
      toast.error('Bắt buộc nhập Mã giao dịch ngân hàng thật (tối thiểu 6 ký tự, ví dụ FT261119...)');
      return;
    }
    setBusyId(intent.paymentCode);
    try {
      await walletVerificationRepository.manualConfirmPayment({
        paymentCode: intent.paymentCode, bankTxCode, actualAmount: intent.amount, reason,
      });
      toast.success(`Đã xác nhận thủ công khoản ${intent.paymentCode} với mã GD ${bankTxCode.toUpperCase()}`);
      await onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Xác nhận thủ công thất bại');
    } finally { setBusyId(null); }
  };

  const handleConfirmPayoutPaid = async (p: PayoutItem) => {
    const bankTxCode = (txCodes[p.id] || '').trim();
    if (bankTxCode.length < 6) {
      toast.error('Bắt buộc nhập Mã giao dịch ngân hàng thật sau khi chuyển khoản cho chủ trọ');
      return;
    }
    setBusyId(p.id);
    try {
      await walletVerificationRepository.confirmPayoutPaid(p.id, {
        bankTxCode, note: 'Admin đã chuyển khoản thật và xác nhận giải ngân',
      });
      toast.success(`Đã xác nhận chuyển khoản rút tiền ${p.payoutCode} thành công!`);
      await onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Xác nhận rút tiền thất bại');
    } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-500">Tiền về chưa khớp (Cần xử lý)</p>
          <p className="text-xl font-black text-amber-600">{unmatchedInflows.filter((u) => u.status === 'UNMATCHED').length}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-500">Yêu cầu rút tiền chờ duyệt / chuyển</p>
          <p className="text-xl font-black text-blue-600">
            {payouts.filter((p) => p.status === 'REQUESTED' || p.status === 'PENDING_APPROVAL' || p.status === 'APPROVED').length}
          </p>
        </Card>
        <Card className="p-4 space-y-1 border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-stone-500">Doanh thu hoa hồng sàn (5%)</p>
          <p className="text-xl font-black text-emerald-600">{formatVnd(platformFeeRevenue)}</p>
        </Card>
      </div>

      {/* 1. Unmatched Bank Inflows Queue */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Hàng đợi Tiền về chưa khớp ({unmatchedInflows.length})
          </span>
          <span className="text-[11px] text-stone-500">Lệch số tiền, quá hạn hoặc sai mã tham chiếu — không tự cộng sổ cái</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GD NCC</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Nội dung CK</TableHead>
                <TableHead>Lý do chưa khớp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unmatchedInflows.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-xs py-5 text-stone-500">Không có giao dịch tiền về chưa khớp nào</TableCell></TableRow>
              ) : (
                unmatchedInflows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs font-semibold">{u.providerTxId}</TableCell>
                    <TableCell className="font-bold text-amber-700">{formatVnd(u.amount)}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate">{u.rawContent || '--'}</TableCell>
                    <TableCell><Badge variant="warning" size="sm">{u.mismatchReason}</Badge></TableCell>
                    <TableCell><Badge variant={u.status === 'UNMATCHED' ? 'danger' : 'success'} size="sm">{u.status}</Badge></TableCell>
                    <TableCell className="text-xs text-stone-500">{formatIsoDateTime(u.receivedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 2. Manual Payment Verification Queue */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Khoản chờ xác minh thủ công dự phòng ({manualIntents.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã tham chiếu</TableHead>
                <TableHead>Loại / Mã đơn</TableHead>
                <TableHead>Số tiền cần thu</TableHead>
                <TableHead>Mã GD ngân hàng thật &amp; Lý do</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manualIntents.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-xs py-5 text-stone-500">Không có khoản nào đang chờ xác minh thủ công</TableCell></TableRow>
              ) : (
                manualIntents.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs font-bold">{m.paymentCode}</TableCell>
                    <TableCell className="text-xs">{m.orderType} ({formatShortRef(m.orderId, 'HD')})</TableCell>
                    <TableCell className="font-bold text-teal-700">{formatVnd(m.amount)}</TableCell>
                    <TableCell className="space-y-1.5">
                      <Input placeholder="Mã GD ngân hàng (FT...)" value={txCodes[m.paymentCode] || ''} onChange={(e) => setTxCodes((p) => ({ ...p, [m.paymentCode]: e.target.value }))} />
                      <Input placeholder="Lý do xác nhận thủ công" value={reasons[m.paymentCode] || ''} onChange={(e) => setReasons((p) => ({ ...p, [m.paymentCode]: e.target.value }))} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="primary" size="sm" isLoading={busyId === m.paymentCode} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => handleManualConfirm(m)}>
                        Xác nhận tiền về
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 3. Withdrawal Queue with System-Generated VietQR */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold">
          Hàng đợi Rút tiền Chủ trọ — QR do Hệ thống sinh ({payouts.length})
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã rút / Chủ TK</TableHead>
                <TableHead>Ngân hàng / STK</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mã GD chi trả</TableHead>
                <TableHead className="text-right">Duyệt / Xác nhận chuyển</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-xs py-5 text-stone-500">Chưa có yêu cầu rút tiền nào</TableCell></TableRow>
              ) : (
                payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      <p className="font-mono font-bold">{p.payoutCode}</p>
                      <p className="text-stone-500">{p.accountHolder}</p>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      <p className="font-semibold">{p.bankCode}</p>
                      <p className="font-mono">{p.accountNumber}</p>
                    </TableCell>
                    <TableCell className="font-bold text-teal-700 whitespace-nowrap">{formatVnd(p.amount)}</TableCell>
                    <TableCell className="whitespace-nowrap"><Badge variant={p.status === 'PAID' || p.status === 'COMPLETED' ? 'success' : p.status === 'REJECTED' || p.status === 'CANCELLED' ? 'danger' : 'warning'} size="sm">{p.status}</Badge></TableCell>
                    <TableCell className="min-w-[200px]">
                      {p.status === 'REQUESTED' || p.status === 'APPROVED' ? (
                        <Input placeholder="Mã GD ngân hàng (FT...)" value={txCodes[p.id] || ''} onChange={(e) => setTxCodes((prev) => ({ ...prev, [p.id]: e.target.value }))} />
                      ) : (
                        <span className="font-mono text-xs whitespace-nowrap">{p.bankTxCode || '--'}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {p.systemVietQrUrl && (
                          <Button variant="outline" size="sm" leftIcon={<QrCode className="w-3.5 h-3.5" />} onClick={() => setQrPayout(p)}>QR hệ thống</Button>
                        )}
                        {p.status === 'PENDING_APPROVAL' && (
                          <Button variant="secondary" size="sm" onClick={() => onApprovePayout(p.id)}>Duyệt 2 người</Button>
                        )}
                        {(p.status === 'REQUESTED' || p.status === 'APPROVED') && (
                          <>
                            <Button variant="primary" size="sm" isLoading={busyId === p.id} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => handleConfirmPayoutPaid(p)}>Xác nhận đã chuyển</Button>
                            <Button variant="outline" size="sm" leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => onRejectPayout(p.id, 'Admin từ chối yêu cầu rút tiền')}>Từ chối</Button>
                          </>
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

      <AdminPayoutQrModal payout={qrPayout} onClose={() => setQrPayout(null)} />
    </div>
  );
}
