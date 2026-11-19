'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { LandlordWalletSummary, WalletLedgerEntry } from '@/domain/entities/WalletVerification';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { AlertCircle, Clock, Lock, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';

interface Props {
  summary: LandlordWalletSummary | null;
  ledgerEntries: WalletLedgerEntry[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function getEntryCategory(refType: string): { label: string; variant: 'success' | 'info' | 'warning' | 'danger' } {
  switch (refType) {
    case 'ESCROW_PARTIAL_RELEASE':
    case 'ESCROW_DISBURSE':
      return { label: 'Cọc đã giải phóng (50%)', variant: 'success' };
    case 'ESCROW_PARTIAL_PENDING':
      return { label: 'Cọc chờ hết hạn giữ', variant: 'info' };
    case 'ESCROW_PENDING_SETTLE':
      return { label: 'Cọc chuyển sang khả dụng', variant: 'success' };
    case 'INVOICE_PAYMENT':
      return { label: 'Tiền thuê tháng & điện', variant: 'success' };
    case 'PAYOUT_HOLD':
      return { label: 'Tạm giữ yêu cầu rút tiền', variant: 'warning' };
    case 'PAYOUT':
      return { label: 'Rút tiền thành công', variant: 'info' };
    case 'PAYOUT_REVERSAL':
      return { label: 'Hoàn trả số dư (Hủy/Từ chối rút)', variant: 'danger' };
    default:
      return { label: refType, variant: 'info' };
  }
}

export function LandlordWalletPanel({ summary, ledgerEntries, loading, error, onRetry }: Props) {
  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-44 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card role="alert" className="p-4 border-red-300 bg-red-50/70 dark:bg-red-950/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-red-800 dark:text-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Thử lại
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1 border-teal-200 dark:border-teal-800">
          <p className="text-xs text-stone-500 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-teal-600" />
            Số dư khả dụng (có thể rút)
          </p>
          <p className="text-xl font-black text-teal-700 dark:text-teal-400">
            {formatVnd(summary?.availableBalance ?? 0)}
          </p>
          <p className="text-[11px] text-stone-400">
            Tối thiểu rút: {formatVnd(summary?.withdrawalMinAmount ?? 1000)}
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Đang chờ mở rút ({summary?.withdrawalHoldDays ?? 0} ngày)
          </p>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400">
            {formatVnd(summary?.pendingBalance ?? 0)}
          </p>
          <p className="text-[11px] text-stone-400">
            Tự động chuyển sang khả dụng khi đến hạn
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            Đang tạm giữ rút tiền
          </p>
          <p className="text-xl font-black text-blue-700 dark:text-blue-400">
            {formatVnd(summary?.withdrawalHoldBalance ?? 0)}
          </p>
          <p className="text-[11px] text-stone-400">
            Chờ Admin xác nhận chuyển khoản
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Cọc giữ đến hết hợp đồng
          </p>
          <p className="text-xl font-black text-stone-800 dark:text-stone-200">
            {formatVnd(summary?.escrowRetainedBalance ?? 0)}
          </p>
          <p className="text-[11px] text-stone-400">
            Giải phóng {summary?.depositReleasePercent ?? 50}% khi đủ 2 xác nhận
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
            Lịch sử bút toán Ví chủ trọ ({ledgerEntries.length})
          </span>
          <span className="text-[11px] text-stone-500">
            Hoa hồng sàn {summary?.commissionPercent ?? 5}% trên tổng tiền thuê + điện tách dòng riêng; cọc không thu hoa hồng
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Phân loại</TableHead>
                <TableHead>Diễn giải &amp; Hoa hồng tách dòng</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs py-6 text-stone-500">
                    Chưa có bút toán ví nào. Khi tiền cọc giải phóng hoặc khách thanh toán tiền phòng + điện, lịch sử sẽ hiển thị tại đây.
                  </TableCell>
                </TableRow>
              ) : (
                ledgerEntries.map((entry) => {
                  const cat = getEntryCategory(entry.referenceType);
                  const commissionPosting = entry.postings.find(
                    (p) => p.accountNumber === '4010-REVENUE' && p.direction === 'CREDIT'
                  );
                  const walletPosting = entry.postings.find((p) => p.accountNumber.startsWith('2020-WALLET-'));
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs text-stone-500 whitespace-nowrap">
                        {formatIsoDateTime(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cat.variant} size="sm">{cat.label}</Badge>
                      </TableCell>
                      <TableCell className="text-xs space-y-1">
                        <p className="font-medium text-stone-800 dark:text-stone-200">{entry.description}</p>
                        {commissionPosting && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                            Phí hoa hồng sàn ({summary?.commissionPercent ?? 5}%): -{formatVnd(commissionPosting.amount)} | Thực nhận vào ví: +{formatVnd(walletPosting?.amount ?? 0)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs whitespace-nowrap">
                        {walletPosting ? (
                          <span className={walletPosting.direction === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}>
                            {walletPosting.direction === 'CREDIT' ? '+' : '-'}{formatVnd(walletPosting.amount)}
                          </span>
                        ) : (
                          <span>{formatVnd(entry.totalAmount)}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
