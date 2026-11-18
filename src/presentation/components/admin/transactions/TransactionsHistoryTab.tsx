'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/components/ui/Table';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { ArrowRightLeft, QrCode, Search } from 'lucide-react';
import { AdminPaymentIntentItem, JournalEntryDetailItem } from './types';

interface TransactionsHistoryTabProps {
  entries: JournalEntryDetailItem[];
  intents: AdminPaymentIntentItem[];
}

export function TransactionsHistoryTab({ entries, intents }: TransactionsHistoryTabProps) {
  const [view, setView] = useState<'JOURNAL' | 'VIETQR'>('JOURNAL');
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.entryNumber.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.referenceType.toLowerCase().includes(q) ||
        e.referenceId.toLowerCase().includes(q) ||
        e.postings.some((p) => p.accountNumber.toLowerCase().includes(q))
    );
  }, [entries, q]);

  const filteredIntents = useMemo(() => {
    if (!q) return intents;
    return intents.filter(
      (i) =>
        i.paymentCode.toLowerCase().includes(q) ||
        i.payerId.toLowerCase().includes(q) ||
        i.orderType.toLowerCase().includes(q) ||
        i.orderId.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q)
    );
  }, [intents, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            variant={view === 'JOURNAL' ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
            onClick={() => setView('JOURNAL')}
          >
            Bút toán Sổ cái kép ({entries.length})
          </Button>
          <Button
            variant={view === 'VIETQR' ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<QrCode className="w-3.5 h-3.5" />}
            onClick={() => setView('VIETQR')}
          >
            Giao dịch VietQR ({intents.length})
          </Button>
        </div>
        <div className="w-full sm:w-80">
          <Input
            placeholder="Tìm mã bút toán, mã GD, tài khoản, hợp đồng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {view === 'JOURNAL' ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số chứng từ</TableHead>
                <TableHead>Nghiệp vụ</TableHead>
                <TableHead>Chi tiết Nợ / Có (Double-Entry)</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-xs py-6 text-stone-500">
                    Không có bút toán nào khớp tìm kiếm.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((je) => (
                  <TableRow key={je.id}>
                    <TableCell className="text-xs">
                      <div className="font-mono font-bold">{je.entryNumber}</div>
                      <div className="text-[11px] text-stone-500">{je.createdBy || 'SYSTEM'}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="info" size="sm">{je.referenceType}</Badge>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 max-w-xs">{je.description}</div>
                    </TableCell>
                    <TableCell className="text-xs space-y-1">
                      {je.postings.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Badge variant={p.direction === 'DEBIT' ? 'warning' : 'success'} size="sm">
                            {p.direction}
                          </Badge>
                          <span>{p.accountNumber}</span>
                          <span className="font-bold">{formatVnd(p.amount)}</span>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-teal-700">{formatVnd(je.totalAmount)}</TableCell>
                    <TableCell className="text-xs text-stone-500">{formatIsoDateTime(je.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã thanh toán</TableHead>
                <TableHead>Người trả</TableHead>
                <TableHead>Loại / Mã đơn</TableHead>
                <TableHead>Số tiền / Đã thu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIntents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs py-6 text-stone-500">
                    Không có giao dịch VietQR nào khớp tìm kiếm.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIntents.map((pi) => (
                  <TableRow key={pi.id}>
                    <TableCell className="font-mono text-xs font-bold">{pi.paymentCode}</TableCell>
                    <TableCell className="font-mono text-xs">{pi.payerId}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="neutral" size="sm">{pi.orderType}</Badge>
                      <div className="font-mono text-[11px] text-stone-500 mt-0.5">{pi.orderId}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-bold">{formatVnd(pi.amount)}</div>
                      <div className="text-[11px] text-teal-700">Đã thu: {formatVnd(pi.paidAmount)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pi.status === 'PAID' ? 'success' : pi.status === 'PENDING' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {pi.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">{formatIsoDateTime(pi.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
