'use client';

import React, { useState } from 'react';
import { EscrowHold } from '@/domain/entities/Billing';
import { formatShortRef } from '@/domain/entities/WalletVerification';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { formatVnd } from '@/shared/utils/format-vnd';
import { CheckCircle2, Eye, Lock, Receipt } from 'lucide-react';
import { EscrowTransferProofModal } from './EscrowTransferProofModal';

interface TenantEscrowTableProps {
  escrows: EscrowHold[];
  busy: boolean;
  onConfirmMoveIn: (contractId: string) => void;
  contractLabel: string;
  amountLabel: string;
  actionColLabel: string;
}

export function TenantEscrowTable({
  escrows,
  busy,
  onConfirmMoveIn,
  contractLabel,
  amountLabel,
  actionColLabel,
}: TenantEscrowTableProps) {
  const [selectedProofHold, setSelectedProofHold] = useState<EscrowHold | null>(null);

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex flex-wrap items-center justify-between gap-2">
          <span>Danh sách Ký quỹ Tiền cọc Hợp đồng ({escrows.length})</span>
          <span className="text-[11px] text-stone-500 font-normal">
            Giữ một phần cọc (50%) đến hết hợp đồng để bảo vệ hai bên
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{contractLabel}</TableHead>
                <TableHead>{amountLabel}</TableHead>
                <TableHead>Cọc đang giữ đến hết HĐ</TableHead>
                <TableHead>Mã GD &amp; Biên lai</TableHead>
                <TableHead>Trạng thái Ký quỹ</TableHead>
                <TableHead>Xác nhận dọn vào</TableHead>
                <TableHead className="text-right">{actionColLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escrows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-xs py-6 text-stone-500">
                    Chưa có khoản tiền cọc hợp đồng nào trong quỹ Escrow
                  </TableCell>
                </TableRow>
              ) : (
                escrows.map((e) => {
                  const retained = e.retainedAmount ?? (e.status === 'HELD' ? e.amount : 0);
                  const released = e.releasedAmount ?? 0;
                  const canCheckIn = e.status === 'HELD' && !e.tenantConfirmedMoveIn;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs font-semibold whitespace-nowrap">
                        {formatShortRef(e.contractId, 'HD')}
                      </TableCell>
                      <TableCell className="font-bold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                        {formatVnd(e.amount)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {e.status === 'PARTIALLY_RELEASED' ? (
                          <div className="space-y-0.5">
                            <p className="font-semibold text-amber-700 dark:text-amber-400">
                              {formatVnd(retained)} (đang giữ đến hết hợp đồng)
                            </p>
                            <p className="text-[11px] text-stone-500">
                              Đã giải phóng cho chủ trọ: {formatVnd(released)}
                            </p>
                          </div>
                        ) : e.status === 'HELD' ? (
                          <span className="font-semibold text-teal-700 dark:text-teal-400">
                            {formatVnd(e.amount)} (100% đang giữ)
                          </span>
                        ) : (
                          <span className="text-stone-400">{formatVnd(retained)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {e.bankTxCode || e.receiptUrl ? (
                          <div className="flex flex-col items-start gap-1">
                            {e.bankTxCode && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 font-mono text-[11px] font-bold text-teal-800 dark:text-teal-200">
                                <Receipt className="w-3 h-3" />
                                {e.bankTxCode}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedProofHold(e)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 underline"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem ảnh &amp; Mã GD
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">Chờ Admin duyệt cọc</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            e.status === 'RELEASED'
                              ? 'success'
                              : e.status === 'DISPUTE_FROZEN'
                              ? 'danger'
                              : e.status === 'HELD' || e.status === 'PARTIALLY_RELEASED'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {e.status === 'PARTIALLY_RELEASED' ? 'GIỮ 50% ĐẾN HẾT HĐ' : e.status}
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
                        {canCheckIn ? (
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={busy}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            onClick={() => onConfirmMoveIn(e.contractId)}
                          >
                            Xác nhận nhận phòng
                          </Button>
                        ) : e.status === 'AWAITING_DEPOSIT' ? (
                          <div className="inline-flex flex-col items-end gap-0.5">
                            <Button variant="secondary" size="sm" disabled leftIcon={<Lock className="w-3.5 h-3.5" />}>
                              Chờ Admin duyệt cọc
                            </Button>
                            <span className="text-[10px] text-stone-500">Mở khóa sau khi Admin duyệt giao dịch</span>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedProofHold && (
        <EscrowTransferProofModal
          hold={selectedProofHold}
          viewerRole="TENANT"
          onClose={() => setSelectedProofHold(null)}
        />
      )}
    </>
  );
}
