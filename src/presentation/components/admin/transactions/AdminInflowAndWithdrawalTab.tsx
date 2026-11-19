'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { PayoutItem } from '@/domain/entities/Billing';
import { AdminPendingApprovalItem, UnmatchedBankInflowItem, formatShortRef } from '@/domain/entities/WalletVerification';
import { walletVerificationRepository } from '@/infrastructure/repositories/http-wallet-verification.repository';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { CheckCircle2, Eye, QrCode, ShieldCheck, XCircle } from 'lucide-react';
import { AdminPayoutQrModal } from './AdminPayoutQrModal';
import { AdminProofPreviewModal } from './AdminProofPreviewModal';

interface Props {
  unmatchedInflows: UnmatchedBankInflowItem[];
  pendingApprovals: AdminPendingApprovalItem[];
  payouts: PayoutItem[];
  platformFeeRevenue: number;
  onApprovePayout: (id: string) => Promise<void>;
  onRejectPayout: (id: string, reason: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function AdminInflowAndWithdrawalTab({
  unmatchedInflows, pendingApprovals, payouts, platformFeeRevenue, onApprovePayout, onRejectPayout, onRefresh,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [txCodes, setTxCodes] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [qrPayout, setQrPayout] = useState<PayoutItem | null>(null);
  const [proofItem, setProofItem] = useState<AdminPendingApprovalItem | null>(null);

  const handleApproveDeposit = async (item: AdminPendingApprovalItem) => {
    const bankTxCode = (txCodes[item.paymentCode] ?? item.submittedBankTxCode ?? '').trim();
    const reason = (reasons[item.paymentCode] || 'Admin kiểm tra tài khoản LE THANH CUONG đã nhận đủ tiền').trim();
    if (bankTxCode.length < 6) {
      toast.error('Bắt buộc nhập Mã giao dịch ngân hàng thật (tối thiểu 6 ký tự) trước khi duyệt');
      return;
    }
    setBusyId(item.paymentCode);
    try {
      await walletVerificationRepository.manualConfirmPayment({
        paymentCode: item.paymentCode, bankTxCode, actualAmount: item.amount, reason,
      });
      toast.success(`Đã duyệt giao dịch ${item.paymentCode}! Tiền cọc đã vào quỹ Escrow.`);
      await onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Duyệt giao dịch thất bại');
    } finally { setBusyId(null); }
  };

  const handleRejectDeposit = async (item: AdminPendingApprovalItem) => {
    const reason = (reasons[item.paymentCode] || 'Chưa nhận được tiền hoặc chuyển thiếu vào tài khoản sàn LE THANH CUONG').trim();
    setBusyId(item.paymentCode);
    try {
      await walletVerificationRepository.manualRejectPayment({ paymentCode: item.paymentCode, reason });
      toast.success(`Đã hủy giao dịch không hợp lệ ${item.paymentCode} và thông báo cho khách thuê.`);
      await onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Hủy giao dịch thất bại');
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
        <Card className="p-4 space-y-1 border-amber-200 dark:border-amber-800">
          <p className="text-xs text-stone-500">Giao dịch tiền cọc chờ Admin duyệt</p>
          <p className="text-xl font-black text-amber-600">{pendingApprovals.length}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-500">Yêu cầu rút tiền chủ trọ chờ xử lý</p>
          <p className="text-xl font-black text-blue-600">
            {payouts.filter((p) => p.status === 'REQUESTED' || p.status === 'PENDING_APPROVAL' || p.status === 'APPROVED').length}
          </p>
        </Card>
        <Card className="p-4 space-y-1 border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-stone-500">Doanh thu hoa hồng sàn (5%)</p>
          <p className="text-xl font-black text-emerald-600">{formatVnd(platformFeeRevenue)}</p>
        </Card>
      </div>

      {/* 1. Admin Deposit / Payment Approval Queue (Primary Flow) */}
      <Card className="p-0 overflow-hidden border-teal-200 dark:border-teal-800">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Giao dịch tiền cọc chờ Admin kiểm tra tài khoản LE THANH CUONG &amp; duyệt ({pendingApprovals.length})
          </span>
          <span className="text-[11px] text-stone-500">Kiểm tra tiền đã về đủ TK sàn, bấm Duyệt (giữ 50% cọc) hoặc Hủy nếu chưa nhận được tiền</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách thuê &amp; Mã tham chiếu</TableHead>
                <TableHead>Hợp đồng</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Mã GD ngân hàng &amp; Lý do</TableHead>
                <TableHead className="text-right">Kiểm tra &amp; Quyết định</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-xs py-6 text-stone-500">Hiện không có giao dịch nào đang chờ Admin duyệt</TableCell></TableRow>
              ) : (
                pendingApprovals.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      <p className="font-bold text-stone-900 dark:text-stone-100">{m.tenantName}</p>
                      <p className="font-mono text-[11px] text-teal-700 dark:text-teal-400">{m.paymentCode}</p>
                      {m.createdAt && <p className="text-[10px] text-stone-400">{formatIsoDateTime(m.createdAt)}</p>}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      <p className="font-mono font-semibold">{formatShortRef(m.orderId, 'HD')}</p>
                      <p className="text-[10px] text-stone-400">{m.orderType}</p>
                    </TableCell>
                    <TableCell className="font-bold text-teal-700 dark:text-teal-400 whitespace-nowrap">{formatVnd(m.amount)}</TableCell>
                    <TableCell className="space-y-1.5 min-w-[210px]">
                      <Input
                        placeholder="Mã GD ngân hàng (FT...)"
                        value={txCodes[m.paymentCode] ?? m.submittedBankTxCode ?? ''}
                        onChange={(e) => setTxCodes((p) => ({ ...p, [m.paymentCode]: e.target.value }))}
                      />
                      <Input
                        placeholder="Ghi chú duyệt hoặc lý do hủy"
                        value={reasons[m.paymentCode] || ''}
                        onChange={(e) => setReasons((p) => ({ ...p, [m.paymentCode]: e.target.value }))}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {m.hasProofImage && (
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setProofItem(m)}>
                            Xem biên lai
                          </Button>
                        )}
                        <Button variant="primary" size="sm" isLoading={busyId === m.paymentCode} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => handleApproveDeposit(m)}>
                          Duyệt giao dịch
                        </Button>
                        <Button variant="outline" size="sm" isLoading={busyId === m.paymentCode} leftIcon={<XCircle className="w-3.5 h-3.5 text-red-600" />} onClick={() => handleRejectDeposit(m)}>
                          Hủy giao dịch
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 2. Withdrawal Queue with System-Generated VietQR */}
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
                        {p.systemVietQrUrl && <Button variant="outline" size="sm" leftIcon={<QrCode className="w-3.5 h-3.5" />} onClick={() => setQrPayout(p)}>QR hệ thống</Button>}
                        {p.status === 'PENDING_APPROVAL' && <Button variant="secondary" size="sm" onClick={() => onApprovePayout(p.id)}>Duyệt 2 người</Button>}
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

      {unmatchedInflows.length > 0 && (
        <Card className="p-3 text-xs text-stone-500">
          <strong className="text-stone-700 dark:text-stone-300">Tiền về chưa khớp ({unmatchedInflows.length}):</strong>{' '}
          {unmatchedInflows.map((u) => `${u.providerTxId} (${formatVnd(u.amount)} - ${u.mismatchReason})`).join(' | ')}
        </Card>
      )}

      <AdminPayoutQrModal payout={qrPayout} onClose={() => setQrPayout(null)} />
      <AdminProofPreviewModal item={proofItem} onClose={() => setProofItem(null)} />
    </div>
  );
}
