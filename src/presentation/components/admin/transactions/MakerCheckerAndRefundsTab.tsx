'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { PayoutItem, RefundItem } from '@/domain/entities/Billing';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { CheckCircle2, Landmark, PlusCircle, ShieldAlert, XCircle } from 'lucide-react';
import { AccountItem, AdjustmentRequest } from './types';

interface MakerCheckerAndRefundsTabProps {
  accounts: AccountItem[];
  requests: AdjustmentRequest[];
  refunds: RefundItem[];
  payouts?: PayoutItem[];
  currentUserId?: string;
  onCreateAdjustment: (payload: { accountNumber: string; direction: 'CREDIT' | 'DEBIT'; amount: number; reason: string }) => Promise<void>;
  onApprove: (req: AdjustmentRequest) => Promise<void>;
  onReject: (req: AdjustmentRequest) => Promise<void>;
  onApproveRefund: (refundId: string) => Promise<void>;
  onApprovePayout?: (payoutId: string) => Promise<void>;
  onRejectPayout?: (payoutId: string, reason?: string) => Promise<void>;
}

export function MakerCheckerAndRefundsTab({
  accounts,
  requests,
  refunds,
  payouts = [],
  currentUserId,
  onCreateAdjustment,
  onApprove,
  onReject,
  onApproveRefund,
  onApprovePayout,
  onRejectPayout,
}: MakerCheckerAndRefundsTabProps) {
  const tl = useTranslations('sprint3.ledger');
  const tc = useTranslations('sprint3.common');
  const td = useTranslations('sprint3.deposit');
  const [accountNumber, setAccountNumber] = useState(accounts[0]?.accountNumber || '');
  const [direction, setDirection] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onCreateAdjustment({
        accountNumber: accountNumber || accounts[0]?.accountNumber || '',
        direction,
        amount: Number(amount),
        reason: reason.trim(),
      });
      setAmount('');
      setReason('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <Select
            label="Account"
            value={accountNumber || accounts[0]?.accountNumber || ''}
            onChange={(e) => setAccountNumber(e.target.value)}
            options={accounts.map((a) => ({ value: a.accountNumber, label: `${a.accountNumber} (${a.accountName})` }))}
          />
          <Select
            label="Direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'CREDIT' | 'DEBIT')}
            options={[{ value: 'CREDIT', label: 'CREDIT' }, { value: 'DEBIT', label: 'DEBIT' }]}
          />
          <Input label="Amount (VND)" type="number" min={1} required value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Reason" required value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button type="submit" variant="primary" size="md" isLoading={busy} leftIcon={<PlusCircle className="w-4 h-4" />}>
            {tc('create')}
          </Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tc('codeCol')}</TableHead>
              <TableHead>{tl('account')}</TableHead>
              <TableHead>{tl('direction')}</TableHead>
              <TableHead>{td('amount')}</TableHead>
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead className="text-right">{tc('actionCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.id.slice(0, 8)}</TableCell>
                <TableCell className="font-mono text-xs">{r.accountNumber}</TableCell>
                <TableCell className="text-xs">{r.direction}</TableCell>
                <TableCell className="font-bold">{formatVnd(r.amount)}</TableCell>
                <TableCell><Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'} size="sm">{r.status}</Badge></TableCell>
                <TableCell className="text-right">
                  {r.status === 'PENDING' && r.makerId !== currentUserId && (
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => onApprove(r)}>{tc('approve')}</Button>
                      <Button variant="ghost" size="sm" leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => onReject(r)}>{tc('reject')}</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tl('refundCode')}</TableHead>
              <TableHead>{tl('contract')}</TableHead>
              <TableHead>{td('amount')}</TableHead>
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead>{tc('dateCol')}</TableHead>
              <TableHead className="text-right">{tc('actionCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.map((rf) => (
              <TableRow key={rf.id}>
                <TableCell className="font-mono text-xs font-semibold">{rf.refundCode}</TableCell>
                <TableCell className="font-mono text-xs">{rf.contractId}</TableCell>
                <TableCell className="font-bold text-teal-700">{formatVnd(rf.amount)}</TableCell>
                <TableCell><Badge variant={rf.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">{rf.status}</Badge></TableCell>
                <TableCell className="text-xs text-stone-500">{formatIsoDateTime(rf.createdAt)}</TableCell>
                <TableCell className="text-right">
                  {rf.status === 'PENDING_APPROVAL' && (
                    <Button variant="primary" size="sm" onClick={() => onApproveRefund(rf.id)}>{tc('approve')}</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Landlord Payout Approvals (Maker-Checker Queue) */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-teal-600" />
            <span>Duyệt Yêu cầu Rút tiền Chủ trọ ({payouts.length})</span>
          </div>
          <span className="text-[11px] text-stone-500 font-normal">Hạn mức phê duyệt kép Maker-Checker: &gt; 10,000,000 VND</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã rút tiền</TableHead>
              <TableHead>Chủ trọ</TableHead>
              <TableHead>Ngân hàng &amp; STK</TableHead>
              <TableHead>{td('amount')}</TableHead>
              <TableHead>Cấp duyệt</TableHead>
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead>{tc('dateCol')}</TableHead>
              <TableHead className="text-right">{tc('actionCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-xs py-5 text-stone-500">
                  Không có yêu cầu rút tiền nào cần xử lý
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((p) => {
                const isHighValue = p.amount > 10_000_000;
                const isPending = p.status === 'PENDING_APPROVAL' || p.status === 'REQUESTED';
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-semibold">{p.payoutCode}</TableCell>
                    <TableCell className="font-mono text-xs">{p.landlordId || '-'}</TableCell>
                    <TableCell className="text-xs">
                      {p.bankCode} - {p.accountNumber} ({p.accountHolder})
                    </TableCell>
                    <TableCell className="font-bold text-stone-900 dark:text-stone-100">{formatVnd(p.amount)}</TableCell>
                    <TableCell>
                      {isHighValue ? (
                        <Badge variant="warning" size="sm">Maker-Checker (&gt;10M)</Badge>
                      ) : (
                        <Badge variant="info" size="sm">Tự động (&le;10M)</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === 'COMPLETED' ? 'success' : p.status === 'REJECTED' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">{formatIsoDateTime(p.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {isPending && onApprovePayout && onRejectPayout && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            onClick={() => onApprovePayout(p.id)}
                          >
                            {tc('approve')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50"
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                            onClick={() => {
                              const reason = window.prompt('Nhập lý do từ chối yêu cầu rút tiền:');
                              if (reason !== null) {
                                onRejectPayout(p.id, reason.trim() || undefined);
                              }
                            }}
                          >
                            {tc('reject')}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

