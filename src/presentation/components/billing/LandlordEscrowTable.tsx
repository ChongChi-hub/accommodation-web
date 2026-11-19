'use client';

import React from 'react';
import { EscrowHold } from '@/domain/entities/Billing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { formatVnd } from '@/shared/utils/format-vnd';
import { KeyRound } from 'lucide-react';

interface Props {
  escrows: EscrowHold[];
  busy: boolean;
  onConfirmMoveIn: (contractId: string) => void;
  contractLabel: string;
  amountLabel: string;
  actionColLabel: string;
}

export function LandlordEscrowTable({
  escrows,
  busy,
  onConfirmMoveIn,
  contractLabel,
  amountLabel,
  actionColLabel,
}: Props) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
        <span>Tiền cọc phòng đang ký quỹ Escrow ({escrows.length})</span>
        <span className="text-[11px] text-stone-500 font-normal">Quản lý bàn giao phòng & giải ngân cọc</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{contractLabel}</TableHead>
            <TableHead>{amountLabel}</TableHead>
            <TableHead>Trạng thái Ký quỹ</TableHead>
            <TableHead>Tiến độ bàn giao</TableHead>
            <TableHead className="text-right">{actionColLabel}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {escrows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-xs py-5 text-stone-500">
                Chưa có khoản tiền cọc nào thuộc phòng của bạn trong quỹ Escrow
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
                  <span className={e.landlordConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                    {e.landlordConfirmedMoveIn ? '[Đã bàn giao chìa khóa]' : '[Chờ bạn bàn giao]'}
                  </span>
                  <span className="mx-1.5 text-stone-300">|</span>
                  <span className={e.tenantConfirmedMoveIn ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                    {e.tenantConfirmedMoveIn ? '[Khách đã nhận phòng]' : '[Khách chưa dọn vào]'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

