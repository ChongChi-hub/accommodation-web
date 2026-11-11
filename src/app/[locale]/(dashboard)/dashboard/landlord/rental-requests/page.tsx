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
import { Check, X, FileText, UserCheck } from 'lucide-react';

export default function LandlordRentalRequestsPage() {
  const t = useTranslations('sprint3.rental');
  const tc = useTranslations('sprint3.common');
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await container.rentalRequest.rentalRequestRepository.getLandlordRequests();
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

  const handleDecision = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      const updated =
        action === 'approve'
          ? await container.rentalRequest.rentalRequestRepository.approveRequest(id)
          : await container.rentalRequest.rentalRequestRepository.rejectRequest(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('landlordTitle')} ({requests.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('landlordSubtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState icon={<UserCheck className="w-8 h-8" />} title={t('emptyLandlord')} />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'PENDING' ? 'warning' : 'neutral'} size="md">
                  {t(`status${r.status}` as 'statusPENDING')}
                </Badge>
                <span className="text-xs text-stone-500">
                  {t('moveInDate')}: {formatIsoDate(r.proposedMoveInDate)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-stone-400">{t('roomLabel')}</p>
                  <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">#{r.roomId}</p>
                  <p className="text-stone-500 mt-0.5">{r.message || '-'}</p>
                </div>
                <div>
                  <p className="text-stone-400">{t('tenantLabel')}</p>
                  <p className="font-mono text-stone-900 dark:text-stone-100 mt-0.5">{r.tenantId}</p>
                  <p className="text-stone-500 mt-0.5">
                    {t('occupants')}: {r.numOccupants} • {formatIsoDateTime(r.createdAt)}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                {r.status === 'PENDING' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={busyId === r.id}
                      leftIcon={<X className="w-3.5 h-3.5" />}
                      onClick={() => handleDecision(r.id, 'reject')}
                    >
                      {t('reject')}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={busyId === r.id}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleDecision(r.id, 'approve')}
                    >
                      {t('approveAndContract')}
                    </Button>
                  </>
                ) : (
                  <Link href={`/dashboard/landlord/contracts?requestId=${r.id}&roomId=${r.roomId}&tenantId=${r.tenantId}`}>
                    <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                      {t('createContract')}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
