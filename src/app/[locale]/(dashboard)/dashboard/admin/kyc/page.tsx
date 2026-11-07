'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminKyc } from '@/presentation/hooks/useAdminKyc';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { ShieldCheck, Eye, CreditCard } from 'lucide-react';

function AdminKycContent() {
  const t = useTranslations('admin.kyc');
  const {
    kycList,
    selectedUser,
    setSelectedUser,
    isLoading,
    error,
    retry,
    handleApprove,
    handleReject,
  } = useAdminKyc();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {kycList.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colName')}</TableHead>
                <TableHead>{t('colIdNumber')}</TableHead>
                <TableHead>{t('colSubmitted')}</TableHead>
                <TableHead className="text-right">{t('colAction')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycList.map((k) => (
                <TableRow key={k.id}>
                  <TableCell>
                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{k.userName}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{k.userEmail}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {k.idNumber}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-400">{k.submittedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(k)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      {t('btnReview')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedUser && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          title={t('modalTitle', { name: selectedUser.userName })}
          description={t('modalDesc', {
            idNumber: selectedUser.idNumber,
            role: selectedUser.userEmail,
          })}
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t('frontImage')}
                </span>
                <div className="aspect-16/10 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={selectedUser.frontImage}
                    alt={t('frontImage')}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t('backImage')}
                </span>
                <div className="aspect-16/10 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={selectedUser.backImage}
                    alt={t('backImage')}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button variant="outline" size="sm" onClick={() => handleReject(selectedUser.id)}>
                {t('btnReject')}
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleApprove(selectedUser.id)}>
                {t('btnApprove')}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default function AdminKycModerationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminKycContent />
    </Suspense>
  );
}
