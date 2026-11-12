'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminKyc } from '@/presentation/hooks/useAdminKyc';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { KycModerationModal } from '@/presentation/components/kyc/KycModerationModal';
import { ShieldCheck, Eye, RefreshCw } from 'lucide-react';

function AdminKycContent() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('kyc');
  const {
    kycList,
    selectedKyc,
    setSelectedKyc,
    selectKyc,
    statusFilter,
    setStatusFilter,
    isLoading,
    isLoadingDetail,
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
        <ErrorState title="Lỗi tải dữ liệu" message={error} onRetry={retry} />
      </div>
    );
  }

  const filterTabs = [
    { id: 'PENDING', label: t('badgePending') },
    { id: 'APPROVED', label: t('badgeVerified') },
    { id: 'REJECTED', label: t('badgeRejected') },
    { id: 'ALL', label: t('all') },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span>{t('moderationTitle')}</span>
          </h1>
          <p className="text-xs text-foreground-muted mt-1">{t('moderationSubtitle')}</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={retry}>
          {t('all')}
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground-muted hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden border border-border">
        {kycList.length === 0 ? (
          <EmptyState title={t('noRequests')} description={t('noRequests')} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fullNameOnId')}</TableHead>
                <TableHead>{t('idNumber')}</TableHead>
                <TableHead>{tAuto('k0007')}</TableHead>
                <TableHead>{t('filterStatus')}</TableHead>
                <TableHead className="text-right">{t('zoomImage')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-foreground">
                    {item.fullNameOnId}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.idNumberMasked}</TableCell>
                  <TableCell className="text-xs text-foreground-muted">
                    {item.userEmail}
                    <br />
                    {item.userPhone}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'APPROVED'
                          ? 'success'
                          : item.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      isLoading={isLoadingDetail}
                      onClick={() => selectKyc(item.id)}
                    >
                      {tAuto('k0008')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {selectedKyc && (
        <KycModerationModal
          kyc={selectedKyc}
          onClose={() => setSelectedKyc(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

export default function AdminKycPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AdminKycContent />
    </Suspense>
  );
}
