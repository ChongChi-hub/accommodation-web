'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminKyc } from '@/presentation/hooks/useAdminKyc';
import { AdminOwnershipDocItem } from '@/domain/entities/Billing';
import { container } from '@/infrastructure/di/container';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { KycModerationModal } from '@/presentation/components/kyc/KycModerationModal';
import { AdminOwnershipKycSection } from '@/presentation/components/kyc/AdminOwnershipKycSection';
import { ShieldCheck, Eye, RefreshCw, FileText, BellRing } from 'lucide-react';

function AdminKycContent() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('kyc');
  const tOwn = useTranslations('sprint3.ownershipKyc');

  const [activeTab, setActiveTab] = useState<'identity' | 'ownership'>('identity');
  const [ownershipDocs, setOwnershipDocs] = useState<AdminOwnershipDocItem[]>([]);
  const [ownershipLoading, setOwnershipLoading] = useState(true);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);

  const loadOwnershipDocs = useCallback(async () => {
    setOwnershipLoading(true);
    setOwnershipError(null);
    try {
      let rooms: any[] = [];
      try {
        rooms = await container.admin.adminRepository.getPendingRooms();
      } catch {
        // enrichment fallback
      }
      const docs = await container.ownershipKyc.ownershipKycRepository.getAdminOwnershipDocs(rooms);
      setOwnershipDocs(docs);
    } catch (err: unknown) {
      setOwnershipError(err instanceof Error ? err.message : 'Không thể tải danh sách giấy tờ sở hữu');
    } finally {
      setOwnershipLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOwnershipDocs();
  }, [loadOwnershipDocs]);

  const pendingOwnershipCount = ownershipDocs.filter((d) => d.status === 'PENDING').length;

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
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => {
            retry();
            void loadOwnershipDocs();
          }}
        >
          {t('all')}
        </Button>
      </div>

      {/* Top-level KYC section tabs: Identity eKYC vs Property Ownership (KYC-03) */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
            activeTab === 'identity'
              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
              : 'bg-surface text-foreground-muted border-border hover:text-foreground hover:bg-muted'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{tOwn('adminTabIdentity')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ownership')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
            activeTab === 'ownership'
              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
              : 'bg-surface text-foreground-muted border-border hover:text-foreground hover:bg-muted'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{tOwn('adminTabOwnership')}</span>
          {pendingOwnershipCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'ownership'
                  ? 'bg-white/25 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {pendingOwnershipCount}
            </span>
          )}
        </button>
      </div>

      {/* Prominent notification banner on Identity tab whenever Sổ đỏ / KYC-03 docs are waiting */}
      {activeTab === 'identity' && pendingOwnershipCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-300/70 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/30 px-4 py-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-medium">
            <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{tOwn('adminPendingBanner', { count: pendingOwnershipCount })}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('ownership')}
            className="shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
          >
            {tOwn('adminSwitchToOwnership')}
          </Button>
        </div>
      )}

      {activeTab === 'ownership' ? (
        <AdminOwnershipKycSection
          docs={ownershipDocs}
          isLoading={ownershipLoading}
          error={ownershipError}
          onRefresh={loadOwnershipDocs}
          onDocsChange={setOwnershipDocs}
        />
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="py-12">
          <ErrorState title="Lỗi tải dữ liệu" message={error} onRetry={retry} />
        </div>
      ) : (
        <>
          <div className="flex gap-2 border-b border-border pb-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
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
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-foreground-muted">CCCD:</span>
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
                          </div>
                          {item.faceStatus && item.faceStatus !== 'NONE' && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-medium text-foreground-muted">Khuôn mặt:</span>
                              <Badge
                                variant={
                                  item.faceStatus === 'PASSED'
                                    ? 'success'
                                    : item.faceStatus === 'FAILED'
                                    ? 'danger'
                                    : 'warning'
                                }
                              >
                                {item.faceStatus === 'PASSED'
                                  ? 'PASSED'
                                  : item.faceStatus === 'PENDING'
                                  ? 'PENDING'
                                  : 'FAILED'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          disabled={isLoadingDetail}
                          onClick={() => selectKyc(item.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed
                            bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-700 hover:text-white hover:border-teal-700
                            dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800 dark:hover:bg-teal-600 dark:hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{tAuto('k0008')}</span>
                        </button>
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
        </>
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
