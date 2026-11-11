'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { RefundItem } from '@/domain/entities/Billing';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { CheckCircle2, PlusCircle, XCircle } from 'lucide-react';
import { AccountItem, AdjustmentRequest } from './types';

interface MakerCheckerAndRefundsTabProps {
  accounts: AccountItem[];
  requests: AdjustmentRequest[];
  refunds: RefundItem[];
  currentUserId?: string;
  onCreateAdjustment: (payload: { accountNumber: string; direction: 'CREDIT' | 'DEBIT'; amount: number; reason: string }) => Promise<void>;
  onApprove: (req: AdjustmentRequest) => Promise<void>;
  onReject: (req: AdjustmentRequest) => Promise<void>;
  onApproveRefund: (refundId: string) => Promise<void>;
}

export function MakerCheckerAndRefundsTab({
  accounts,
  requests,
  refunds,
  currentUserId,
  onCreateAdjustment,
  onApprove,
  onReject,
  onApproveRefund,
}: MakerCheckerAndRefundsTabProps) {
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
            Create
          </Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
                      <Button variant="outline" size="sm" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => onApprove(r)}>Approve</Button>
                      <Button variant="ghost" size="sm" leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => onReject(r)}>Reject</Button>
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
              <TableHead>Refund Code</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
                    <Button variant="primary" size="sm" onClick={() => onApproveRefund(rf.id)}>Approve</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

