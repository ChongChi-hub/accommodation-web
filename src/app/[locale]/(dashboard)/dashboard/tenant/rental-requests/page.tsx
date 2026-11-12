'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { RentalRequest } from '@/domain/entities/RentalRequest';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatIsoDateTime } from '@/shared/utils/format-vnd';
import { FileText, XCircle, Send } from 'lucide-react';

export default function TenantRentalRequestsPage() {
  const t = useTranslations('sprint3.rental');
  const tc = useTranslations('sprint3.common');
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await container.rentalRequest.rentalRequestRepository.getTenantRequests();
      setRequests(list);
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancel = async (id: string) => {
    setBusyId(id);
    try {
      const updated = await container.rentalRequest.rentalRequestRepository.cancelRequest(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusyId(null);
    }
  };

  const getBadgeVariant = (status: string) => {
    if (status === 'APPROVED') return 'success';
    if (status === 'PENDING') return 'warning';
    if (status === 'REJECTED' || status === 'EXPIRED') return 'danger';
    return 'neutral';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('tenantTitle')} ({requests.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('tenantSubtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState icon={<Send className="w-8 h-8" />} title={t('emptyTenant')} />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <Badge variant={getBadgeVariant(r.status)} size="md">
                  {t(`status${r.status}` as 'statusPENDING')}
                </Badge>
                <span className="text-xs text-stone-500">
                  {t('moveInDate')}: {formatIsoDate(r.proposedMoveInDate)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <Link
                    href={`/rooms/${r.roomId}`}
                    className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-teal-700"
                  >
                    {t('roomLabel')}: #{r.roomId}
                  </Link>
                  <p className="text-stone-500">
                    {t('occupants')}: {r.numOccupants}
                  </p>
                  {r.holdingExpiresAt && (
                    <p className="text-amber-600 font-medium">
                      {t('holdingUntil')}: {formatIsoDateTime(r.holdingExpiresAt)}
                    </p>
                  )}
                </div>
                <span className="text-stone-400">{formatIsoDateTime(r.createdAt)}</span>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs text-stone-600 dark:text-stone-300 flex flex-wrap items-center justify-between gap-2">
                <span>{r.message || '-'}</span>
                <div className="flex items-center gap-2">
                  {r.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={busyId === r.id}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleCancel(r.id)}
                    >
                      {t('cancelRequest')}
                    </Button>
                  )}
                  {r.status === 'APPROVED' && (
                    <Link href={r.contractId ? `/dashboard/tenant/contracts/${r.contractId}` : '/dashboard/tenant/contracts'}>
                      <Button variant="primary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                        {t('viewContract')}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
