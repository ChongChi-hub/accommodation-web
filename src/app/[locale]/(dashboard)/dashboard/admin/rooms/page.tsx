'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminRooms } from '@/presentation/hooks/useAdminRooms';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Check, X, ShieldAlert, Search } from 'lucide-react';

function AdminRoomsContent() {
  const t = useTranslations('admin.rooms');
  const {
    rooms,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    retry,
    handleApprove,
    handleOpenReject,
    handleConfirmReject,
    rejectModalOpen,
    setRejectModalOpen,
    rejectReason,
    setRejectReason,
  } = useAdminRooms();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState title={t('errorTitle')} message={t('errorDesc')} onRetry={retry} />
      </div>
    );
  }

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + ' đ';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl max-w-fit">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab === 'PENDING' && t('tabPending')}
              {tab === 'APPROVED' && t('tabApproved')}
              {tab === 'REJECTED' && t('tabRejected')}
              {tab === 'ALL' && t('tabAll')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {rooms.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colTitle')}</TableHead>
                <TableHead>{t('colLandlord')}</TableHead>
                <TableHead>{t('colAddress')}</TableHead>
                <TableHead>{t('colPrice')}</TableHead>
                <TableHead>{t('colSubmitted')}</TableHead>
                <TableHead className="text-right">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">#{r.id}</span>
                      <Badge
                        variant={
                          r.status === 'APPROVED'
                            ? 'success'
                            : r.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {r.status === 'APPROVED' && t('statusApproved')}
                        {r.status === 'REJECTED' && t('statusRejected')}
                        {r.status === 'PENDING' && t('statusPending')}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-xs mt-0.5">
                      {r.title}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{r.landlordName}</TableCell>
                  <TableCell className="text-xs text-neutral-500 max-w-[200px] truncate">{r.address}</TableCell>
                  <TableCell className="font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(r.price)}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-400">{r.submittedAt}</TableCell>
                  <TableCell className="text-right">
                    {r.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(r.id)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          {t('btnApprove')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReject(r.id)}
                        >
                          <X className="w-3.5 h-3.5 text-rose-600 mr-1" />
                          {t('btnReject')}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">
                        {r.status === 'APPROVED' ? t('statusApproved') : t('statusRejected')}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={t('rejectModalTitle')}
        description={t('rejectModalDesc')}
      >
        <div className="space-y-4 pt-2">
          <textarea
            rows={3}
            placeholder={t('rejectReasonPlaceholder')}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 text-xs bg-white dark:bg-neutral-900 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              {t('btnReject')}
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReject}>
              {t('btnConfirmReject')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default function AdminRoomsModerationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminRoomsContent />
    </Suspense>
  );
}
