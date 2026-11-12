'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { ApiClient } from '@/infrastructure/http/api-client';
import { toast } from '@/presentation/stores/toast.store';
import { FileDown } from 'lucide-react';
import { AccountItem } from './types';

interface ExportTabProps {
  accounts: AccountItem[];
}

export function ExportTab({ accounts }: ExportTabProps) {
  const tl = useTranslations('sprint3.ledger');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [accountNumber, setAccountNumber] = useState(accounts[0]?.accountNumber || '');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const downloadReport = async (type: 'general-ledger' | 'trial-balance' | 'statement', filename: string) => {
    setIsExporting(type);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (type === 'statement' && (accountNumber || accounts[0]?.accountNumber)) {
        params.append('accountNumber', accountNumber || accounts[0].accountNumber);
      }
      const blob = await ApiClient.getBlob(`/billing/ledger/export/${type}?${params.toString()}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label={tl('fromDate')} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <Input label={tl('toDate')} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <Select
          label={tl('account')}
          value={accountNumber || accounts[0]?.accountNumber || ''}
          onChange={(e) => setAccountNumber(e.target.value)}
          options={accounts.map((a) => ({ value: a.accountNumber, label: `${a.accountNumber} (${a.accountName})` }))}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" isLoading={isExporting === 'general-ledger'} leftIcon={<FileDown className="w-3.5 h-3.5" />} onClick={() => downloadReport('general-ledger', 'general-ledger.csv')}>
          {tl('generalLedgerCsv')}
        </Button>
        <Button variant="outline" size="sm" isLoading={isExporting === 'trial-balance'} leftIcon={<FileDown className="w-3.5 h-3.5" />} onClick={() => downloadReport('trial-balance', 'trial-balance.csv')}>
          {tl('trialBalanceCsv')}
        </Button>
        <Button variant="outline" size="sm" isLoading={isExporting === 'statement'} leftIcon={<FileDown className="w-3.5 h-3.5" />} onClick={() => downloadReport('statement', 'account-statement.csv')}>
          {tl('accountStatementCsv')}
        </Button>
      </div>
    </Card>
  );
}

