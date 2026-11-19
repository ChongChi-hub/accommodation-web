'use client';

import React, { useState } from 'react';
import { EscrowHold } from '@/domain/entities/Billing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { formatVnd } from '@/shared/utils/format-vnd';
import { CheckCircle2, Eye, Receipt } from 'lucide-react';
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
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
          <span>Danh sách Ký quỹ Tiền cọc Hợp đồng ({escrows.length})</span>
          <span className="text-[11px] text-stone-500 font-normal">Quản lý ký quỹ Escrow bảo đảm hai chiều</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{contractLabel}</TableHead>
              <TableHead>{amountLabel}</TableHead>
              <TableHead>Mã GD & Biên lai</TableHead>
              <TableHead>Trạng thái Ký quỹ</TableHead>
              <TableHead>Xác nhận dọn vào</TableHead>
              <TableHead className="text-right">{actionColLabel}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escrows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs py-5 text-stone-500">
                  Chưa có khoản tiền cọc hợp đồng nào trong quỹ Escrow
                </TableCell>
              </TableRow>
            ) : (
              escrows.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs font-semibold">{e.contractId}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(e.amount)}</TableCell>
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
                          Xem ảnh & Mã GD
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">Chưa chuyển khoản</span>
                    )}
                  </TableCell>
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
                        onClick={() => onConfirmMoveIn(e.contractId)}
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


