'use client';

import React, { useState } from 'react';
import { PaymentIntent } from '@/domain/entities/Billing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { CheckCircle2, XCircle, SearchCheck } from 'lucide-react';

interface Props {
  submissions: PaymentIntent[];
  busy: boolean;
  onConfirm: (paymentCode: string, payload: { actualAmount: number; bankTxCode: string; note?: string }) => Promise<void>;
  onReject: (paymentCode: string) => Promise<void>;
}

export function LandlordSubmittedDepositsTable({
  submissions,
  busy,
  onConfirm,
  onReject,
}: Props) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [actualAmount, setActualAmount] = useState<string>('');
  const [bankTxCode, setBankTxCode] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const handleOpenConfirm = (item: PaymentIntent) => {
    setSelectedCode(item.paymentCode);
    setActualAmount(String(item.amount));
    setBankTxCode('');
    setNote('');
  };

  const handleExecuteConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCode || !bankTxCode.trim() || Number(actualAmount) <= 0) return;
    await onConfirm(selectedCode, {
      actualAmount: Number(actualAmount),
      bankTxCode: bankTxCode.trim(),
      note: note.trim() || undefined,
    });
    setSelectedCode(null);
  };

  return (
    <Card className="p-0 overflow-hidden border-teal-200 dark:border-teal-900">
      <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between bg-teal-50/50 dark:bg-teal-950/20">
        <span className="flex items-center gap-2">
          <SearchCheck className="w-4 h-4 text-teal-600" />
          Khoản cọc chờ bạn đối soát & nhận tiền ({submissions.length})
        </span>
        <span className="text-[11px] text-stone-500 font-normal">
          Chỉ xác nhận sau khi kiểm tra biến động số dư ngân hàng
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã giao dịch</TableHead>
            <TableHead>Mã hợp đồng</TableHead>
            <TableHead>Số tiền cọc</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-xs py-5 text-stone-500">
                Hiện không có khoản cọc nào đang chờ đối soát
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((s) => (
              <React.Fragment key={s.id}>
                <TableRow>
                  <TableCell className="font-mono text-xs font-semibold">{s.paymentCode}</TableCell>
                  <TableCell className="font-mono text-xs">{s.orderId}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(s.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="warning" size="sm">CHỜ XÁC NHẬN</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-stone-500">{formatIsoDateTime(s.createdAt || s.expiresAt)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={busy}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenConfirm(s)}
                    >
                      Đối soát & Nhận
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={busy}
                      leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                      onClick={() => onReject(s.paymentCode)}
                    >
                      Báo chưa nhận
                    </Button>
                  </TableCell>
                </TableRow>
                {selectedCode === s.paymentCode && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-stone-50 dark:bg-stone-900/60 p-4">
                      <form onSubmit={handleExecuteConfirm} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <Input
                          label="Số tiền thực nhận (VND)"
                          type="number"
                          required
                          value={actualAmount}
                          onChange={(e) => setActualAmount(e.target.value)}
                        />
                        <Input
                          label="Mã GD ngân hàng (FT...)"
                          required
                          placeholder="Ví dụ: FT2611190012"
                          value={bankTxCode}
                          onChange={(e) => setBankTxCode(e.target.value)}
                        />
                        <Input
                          label="Ghi chú (tùy chọn)"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            isLoading={busy}
                            disabled={!bankTxCode.trim() || Number(actualAmount) <= 0}
                          >
                            Chốt đã nhận tiền
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedCode(null)}
                          >
                            Đóng
                          </Button>
                        </div>
                      </form>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
