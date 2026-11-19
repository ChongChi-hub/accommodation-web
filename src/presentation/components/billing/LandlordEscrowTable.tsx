'use client';

import React, { useState } from 'react';
import { EscrowHold } from '@/domain/entities/Billing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { formatVnd } from '@/shared/utils/format-vnd';
import { Eye, KeyRound, Receipt } from 'lucide-react';
import { EscrowTransferProofModal } from './EscrowTransferProofModal';

interface Props {
  escrows: EscrowHold[];
  busy: boolean;
  onConfirmMoveIn: (contractId: string) => void;
  onRejectProof?: (contractId: string, reason: string) => Promise<void>;
  contractLabel: string;
  amountLabel: string;
  actionColLabel: string;
}

export function LandlordEscrowTable({
  escrows,
  busy,
  onConfirmMoveIn,
  onRejectProof,
  contractLabel,
  amountLabel,
  actionColLabel,
}: Props) {
  const [selectedProofHold, setSelectedProofHold] = useState<EscrowHold | null>(null);

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
          <span>Tiền cọc phòng đang ký quỹ Escrow ({escrows.length})</span>
          <span className="text-[11px] text-stone-500 font-normal">
            Kiểm tra ảnh biên lai & mã giao dịch ngân hàng trước khi bàn giao phòng
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{contractLabel}</TableHead>
              <TableHead>{amountLabel}</TableHead>
              <TableHead>Mã GD & Biên lai CK</TableHead>
              <TableHead>Trạng thái Ký quỹ</TableHead>
              <TableHead>Tiến độ bàn giao</TableHead>
              <TableHead className="text-right">{actionColLabel}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escrows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs py-5 text-stone-500">
                  Chưa có khoản tiền cọc nào thuộc phòng của bạn trong quỹ Escrow
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
                    <span className={e.landlordConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      {e.landlordConfirmedMoveIn ? '[Đã bàn giao chìa khóa]' : '[Chờ bạn bàn giao]'}
                    </span>
                    <span className="mx-1.5 text-stone-300">|</span>
                    <span className={e.tenantConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      {e.tenantConfirmedMoveIn ? '[Khách đã nhận phòng]' : '[Khách chưa dọn vào]'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(e.bankTxCode || e.receiptUrl) && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedProofHold(e)}
                        >
                          Biên lai
                        </Button>
                      )}
                      {e.status === 'HELD' && !e.landlordConfirmedMoveIn && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={busy}
                          leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                          onClick={() => onConfirmMoveIn(e.contractId)}
                        >
                          Bàn giao phòng
                        </Button>
                      )}
                    </div>
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
          viewerRole="LANDLORD"
          busy={busy}
          onConfirmMoveIn={onConfirmMoveIn}
          onRejectProof={onRejectProof}
          onClose={() => setSelectedProofHold(null)}
        />
      )}
    </>
  );
}


