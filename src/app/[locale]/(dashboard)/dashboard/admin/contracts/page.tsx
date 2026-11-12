'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { ApiClient } from '@/infrastructure/http/api-client';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime } from '@/shared/utils/format-vnd';
import { RefreshCw, Search, ShieldCheck } from 'lucide-react';

interface SagaRecord {
  sagaId: string;
  currentState: string;
  compensationStep?: string | null;
  retryCount: number;
  updatedAt?: string;
}

export default function AdminContractsPage() {
  const t = useTranslations('sprint3.contract');
  const tc = useTranslations('sprint3.common');
  const [sagaId, setSagaId] = useState('');
  const [saga, setSaga] = useState<SagaRecord | null>(null);
  const [reason, setReason] = useState('Manual admin compensation');
  const [busy, setBusy] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sagaId.trim()) return;
    setBusy(true);
    try {
      const res = await ApiClient.get<SagaRecord>(`/booking/sagas/${encodeURIComponent(sagaId.trim())}`);
      setSaga(res);
    } catch (err: unknown) {
      setSaga(null);
      toast.error(err instanceof Error ? err.message : tc('loadError'));
    } finally {
      setBusy(false);
    }
  };

  const handleCompensate = async () => {
    if (!saga) return;
    setBusy(true);
    try {
      const res = await ApiClient.post<SagaRecord>(`/booking/sagas/${encodeURIComponent(saga.sagaId)}/compensate`, {
        reason,
      });
      setSaga(res);
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          {t('adminTitle')}
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5">{t('adminSubtitle')}</p>
      </div>

      <Card className="p-5 space-y-4">
        <form onSubmit={handleLookup} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-56">
            <Input label="Saga ID" required value={sagaId} onChange={(e) => setSagaId(e.target.value)} />
          </div>
          <Button type="submit" variant="primary" size="md" isLoading={busy} leftIcon={<Search className="w-4 h-4" />}>
            {tc('viewDetail')}
          </Button>
        </form>

        {saga && (
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold">{saga.sagaId}</span>
              <Badge variant={saga.currentState === 'CONTRACT_SIGNED' ? 'success' : 'warning'} size="md">
                {saga.currentState}
              </Badge>
            </div>
            <p className="text-stone-500">
              {tc('retryLabel')}: {saga.retryCount} • {tc('compensationLabel')}: {saga.compensationStep || '-'} • {formatIsoDateTime(saga.updatedAt)}
            </p>
            <div className="flex flex-wrap gap-2 items-center pt-2">
              <Input value={reason} onChange={(e) => setReason(e.target.value)} />
              <Button variant="outline" size="sm" isLoading={busy} leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={handleCompensate}>
                {tc('confirm')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
