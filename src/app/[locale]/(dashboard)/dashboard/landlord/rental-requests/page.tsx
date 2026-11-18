'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { RentalRequest } from '@/domain/entities/RentalRequest';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatIsoDateTime } from '@/shared/utils/format-vnd';
import { Check, X, FileText, UserCheck, Eye, XCircle, MessageSquare } from 'lucide-react';

type StatusTab = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export default function LandlordRentalRequestsPage() {
  const t = useTranslations('sprint3.rental');
  const tc = useTranslations('sprint3.common');
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RentalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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

  const counts = useMemo(() => {
    const map: Record<StatusTab, number> = {
      ALL: requests.length,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };
    for (const r of requests) {
      if (r.status === 'PENDING') map.PENDING++;
      else if (r.status === 'APPROVED') map.APPROVED++;
      else if (r.status === 'REJECTED') map.REJECTED++;
      else if (r.status === 'CANCELLED' || r.status === 'EXPIRED') map.CANCELLED++;
    }
    return map;
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (activeTab === 'ALL') return requests;
    if (activeTab === 'CANCELLED') {
      return requests.filter((r) => r.status === 'CANCELLED' || r.status === 'EXPIRED');
    }
    return requests.filter((r) => r.status === activeTab);
  }, [requests, activeTab]);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      const updated = await container.rentalRequest.rentalRequestRepository.approveRequest(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    try {
      const updated = await container.rentalRequest.rentalRequestRepository.rejectRequest(
        rejectTarget.id,
        rejectReason
      );
      setRequests((prev) => prev.map((r) => (r.id === rejectTarget.id ? updated : r)));
      setRejectTarget(null);
      setRejectReason('');
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusyId(null);
    }
  };

  const handleCancelApproved = async (id: string) => {
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

  const tabs: { key: StatusTab; label: string }[] = [
    { key: 'ALL', label: t('tabAll') },
    { key: 'PENDING', label: t('tabPending') },
    { key: 'APPROVED', label: t('tabApproved') },
    { key: 'REJECTED', label: t('tabRejected') },
    { key: 'CANCELLED', label: t('tabCancelled') },
  ];

  const presetReasons = [
    t('rejectReasonRoomTaken'),
    t('rejectReasonCriteria'),
    t('rejectReasonSchedule'),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('landlordTitle')} ({filteredRequests.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('landlordSubtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-teal-700 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState icon={<UserCheck className="w-8 h-8" />} title={t('emptyLandlord')} />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((r) => (
            <Card key={r.id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <Badge variant={getBadgeVariant(r.status)} size="md">
                  {t(`status${r.status}` as 'statusPENDING')}
                </Badge>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span>
                    {t('moveInDate')}: <strong className="text-stone-800 dark:text-stone-200">{formatIsoDate(r.proposedMoveInDate)}</strong>
                  </span>
                  <span>
                    {t('submittedAt')}: {formatIsoDateTime(r.createdAt)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="min-w-0">
                  <p className="text-stone-400">{t('roomLabel')}</p>
                  <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5 truncate" title={r.roomTitle || t('fallbackRoomTitle')}>
                    {r.roomTitle || t('fallbackRoomTitle')}
                  </p>
                  {r.message && <p className="text-stone-500 mt-1">{r.message}</p>}
                </div>
                <div className="min-w-0">
                  <p className="text-stone-400">{t('tenantLabel')}</p>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5 truncate" title={r.tenantName || t('fallbackGuestName')}>
                    {r.tenantName || t('fallbackGuestName')}
                  </p>
                  <p className="text-stone-500 mt-1">
                    {t('occupants')}: {r.numOccupants}
                  </p>
                </div>
              </div>

              {r.status === 'REJECTED' && r.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
                  <span className="font-semibold">{t('rejectionReasonLabel')}: </span>
                  <span>{r.rejectionReason}</span>
                </div>
              )}

              <div className="pt-2 flex flex-wrap justify-end gap-2">
                <Link
                  href={`/dashboard/landlord/messages?tenantId=${encodeURIComponent(r.tenantId)}&tenantName=${encodeURIComponent(r.tenantName || t('fallbackGuestName'))}&roomId=${encodeURIComponent(r.roomId)}&roomTitle=${encodeURIComponent(r.roomTitle || t('fallbackRoomTitle'))}`}
                >
                  <Button variant="ghost" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                    {t('sendMessage')}
                  </Button>
                </Link>
                {r.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={busyId === r.id}
                      leftIcon={<X className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setRejectTarget(r);
                        setRejectReason('');
                      }}
                    >
                      {t('reject')}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={busyId === r.id}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleApprove(r.id)}
                    >
                      {t('approveAndContract')}
                    </Button>
                  </>
                )}

                {r.status === 'APPROVED' && r.contractId && (
                  <Link href={`/dashboard/landlord/contracts/${r.contractId}`}>
                    <Button variant="primary" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                      {t('viewContract')}
                    </Button>
                  </Link>
                )}

                {r.status === 'APPROVED' && !r.contractId && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={busyId === r.id}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleCancelApproved(r.id)}
                    >
                      {t('cancelRequest')}
                    </Button>
                    <Link href={`/dashboard/landlord/contracts?requestId=${r.id}&roomId=${r.roomId}&tenantId=${r.tenantId}`}>
                      <Button variant="primary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                        {t('createContract')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title={t('rejectModalTitle')}
        size="md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-2">
            {presetReasons.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRejectReason(preset)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
                  rejectReason === preset
                    ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-semibold'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('rejectReasonPlaceholder')}
            rows={3}
            maxLength={500}
            className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setRejectTarget(null)}>
              {t('cancelAction')}
            </Button>
            <Button variant="danger" size="sm" type="submit" isLoading={busyId === rejectTarget?.id}>
              {t('confirmReject')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
