'use client';

import React, { useState } from 'react';
import { EscrowHold } from '@/domain/entities/Billing';
import { UserBankAccount } from '@/domain/entities/BankAccount';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { formatVnd } from '@/shared/utils/format-vnd';
import { DollarSign, RefreshCcw, ShieldCheck } from 'lucide-react';
import { EscrowDisburseRefundModal } from './EscrowDisburseRefundModal';

interface Props {
  escrows: EscrowHold[];
  onRefresh: () => Promise<void>;
}

export function AdminEscrowManagementTab({ escrows, onRefresh }: Props) {
  const [selectedHold, setSelectedHold] = useState<EscrowHold | null>(null);
  const [modalMode, setModalMode] = useState<'DISBURSE' | 'REFUND' | null>(null);
  const [bankInfo, setBankInfo] = useState<UserBankAccount | null>(null);
  const [loadingBank, setLoadingBank] = useState(false);
  const [busy, setBusy] = useState(false);
  const [txRef, setTxRef] = useState('');
  const [reason, setReason] = useState('Admin hoan tien coc theo quy dinh');

  const openActionModal = async (hold: EscrowHold, mode: 'DISBURSE' | 'REFUND') => {
    setSelectedHold(hold);
    setModalMode(mode);
    setTxRef('');
    setLoadingBank(true);
    const targetUserId = mode === 'DISBURSE' ? hold.landlordId : hold.tenantId;
    try {
      const acc = await container.bankAccount.bankAccountRepository.getUserBankAccount(targetUserId);
      setBankInfo(acc);
    } catch {
      setBankInfo(null);
    } finally {
      setLoadingBank(false);
    }
  };

  const handleConfirmDisburse = async () => {
    if (!selectedHold) return;
    if (!txRef.trim()) {
      toast.error('Vui lòng nhập mã giao dịch ngân hàng chuyển tiền');
      return;
    }
    setBusy(true);
    try {
      await container.billing.billingRepository.releaseEscrow(selectedHold.contractId);
      toast.success('Đã giải ngân tiền cọc thành công cho chủ trọ!');
      setSelectedHold(null);
      setModalMode(null);
      await onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi giải ngân cọc');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmRefund = async () => {
    if (!selectedHold) return;
    setBusy(true);
    try {
      await container.billing.billingRepository.refundEscrow(selectedHold.contractId, reason);
      toast.success('Đã hoàn tiền cọc thành công cho người thuê!');
      setSelectedHold(null);
      setModalMode(null);
      await onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi hoàn cọc');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Quản lý Ký quỹ Tiền cọc Escrow ({escrows.length})</span>
          </div>
          <span className="text-[11px] text-stone-500 font-normal">
            Giải ngân cho chủ trọ khi đủ 2 điều kiện: Bàn giao phòng &amp; Dọn vào ở
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Hợp đồng</TableHead>
              <TableHead>Số tiền cọc</TableHead>
              <TableHead>Trạng thái Ký quỹ</TableHead>
              <TableHead>Tiến độ 2 điều kiện</TableHead>
              <TableHead>Điều kiện Giải ngân</TableHead>
              <TableHead className="text-right">Thao tác Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escrows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs py-6 text-stone-500">
                  Không có khoản ký quỹ Escrow nào trong hệ thống
                </TableCell>
              </TableRow>
            ) : (
              escrows.map((e) => {
                const bothActive = e.landlordConfirmedMoveIn && e.tenantConfirmedMoveIn;
                const canDisburse = e.status === 'HELD' && bothActive;
                const canRefund = e.status === 'HELD' || e.status === 'DISPUTE_FROZEN';

                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs font-semibold">{e.contractId}</TableCell>
                    <TableCell className="font-bold text-teal-700">{formatVnd(e.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          e.status === 'RELEASED' ? 'success' : e.status === 'DISPUTE_FROZEN' ? 'danger' : 'warning'
                        }
                        size="sm"
                      >
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="space-y-0.5">
                        <span className={e.landlordConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                          {e.landlordConfirmedMoveIn ? '1. Đã bàn giao phòng' : '1. Chưa bàn giao phòng'}
                        </span>
                        <br />
                        <span className={e.tenantConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                          {e.tenantConfirmedMoveIn ? '2. Đã dọn vào ở' : '2. Chưa dọn vào ở'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {bothActive ? (
                        <Badge variant="success" size="sm">ĐỦ ĐIỀU KIỆN GIẢI NGÂN</Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">CHỜ BÀN GIAO &amp; DỌN VÀO</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      {canDisburse && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openActionModal(e, 'DISBURSE')}
                          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                        >
                          Giải ngân cho Chủ trọ
                        </Button>
                      )}
                      {canRefund && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionModal(e, 'REFUND')}
                          leftIcon={<RefreshCcw className="w-3.5 h-3.5" />}
                        >
                          Hoàn cọc
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {modalMode && selectedHold && (
        <EscrowDisburseRefundModal
          hold={selectedHold}
          mode={modalMode}
          bankInfo={bankInfo}
          loadingBank={loadingBank}
          busy={busy}
          txRef={txRef}
          setTxRef={setTxRef}
          reason={reason}
          setReason={setReason}
          onClose={() => setModalMode(null)}
          onConfirmDisburse={handleConfirmDisburse}
          onConfirmRefund={handleConfirmRefund}
        />
      )}
    </div>
  );
}
