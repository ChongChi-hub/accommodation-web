'use client';

import React from 'react';
import { RefundItem } from '@/domain/entities/Billing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { RefreshCw } from 'lucide-react';

interface RefundFormState {
  contractId: string;
  landlordId: string;
  amount: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  otpCode: string;
  reason: string;
}

interface TenantRefundSectionProps {
  refunds: RefundItem[];
  refundForm: RefundFormState;
  setRefundForm: React.Dispatch<React.SetStateAction<RefundFormState>>;
  onSubmitRefund: (e: React.FormEvent) => void;
  busy: boolean;
  t: (key: string) => string;
  tc: (key: string) => string;
}

export function TenantRefundSection({
  refunds,
  refundForm,
  setRefundForm,
  onSubmitRefund,
  busy,
  t,
  tc,
}: TenantRefundSectionProps) {
  return (
    <Card className="p-5 space-y-4">
      <h2 className="text-sm font-bold">{t('requestRefundBtn')}</h2>
      <form onSubmit={onSubmitRefund} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Input label={t('contractId')} required value={refundForm.contractId} onChange={(e) => setRefundForm((p) => ({ ...p, contractId: e.target.value }))} />
        <Input label={t('landlordId')} required value={refundForm.landlordId} onChange={(e) => setRefundForm((p) => ({ ...p, landlordId: e.target.value }))} />
        <Input label={t('amount')} type="number" min={1000} required value={refundForm.amount} onChange={(e) => setRefundForm((p) => ({ ...p, amount: e.target.value }))} />
        <Input label={t('bankCode')} required value={refundForm.bankCode} onChange={(e) => setRefundForm((p) => ({ ...p, bankCode: e.target.value }))} />
        <Input label={t('accountNumber')} required value={refundForm.accountNumber} onChange={(e) => setRefundForm((p) => ({ ...p, accountNumber: e.target.value }))} />
        <Input label={t('accountHolder')} required value={refundForm.accountHolder} onChange={(e) => setRefundForm((p) => ({ ...p, accountHolder: e.target.value }))} />
        <Input label={t('otpCode')} required pattern="[0-9]{6}" maxLength={6} value={refundForm.otpCode} onChange={(e) => setRefundForm((p) => ({ ...p, otpCode: e.target.value }))} />
        <Input label={t('reason')} required value={refundForm.reason} onChange={(e) => setRefundForm((p) => ({ ...p, reason: e.target.value }))} />
        <div className="sm:col-span-4 flex justify-end">
          <Button type="submit" variant="secondary" size="sm" isLoading={busy} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            {t('requestRefundBtn')}
          </Button>
        </div>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tc('codeCol')}</TableHead>
            <TableHead>{t('contractId')}</TableHead>
            <TableHead>{t('amount')}</TableHead>
            <TableHead>{tc('statusCol')}</TableHead>
            <TableHead>{tc('dateCol')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center text-xs py-5 text-stone-500">{t('emptyRefunds')}</TableCell></TableRow>
          ) : (
            refunds.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs font-semibold">{r.refundCode}</TableCell>
                <TableCell className="font-mono text-xs">{r.contractId}</TableCell>
                <TableCell className="font-bold text-teal-700">{formatVnd(r.amount)}</TableCell>
                <TableCell><Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">{r.status}</Badge></TableCell>
                <TableCell className="text-xs text-stone-500">{formatIsoDateTime(r.createdAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

