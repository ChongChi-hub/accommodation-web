'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminReports } from '@/presentation/hooks/useAdminReports';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

function AdminReportsContent() {
  const t = useTranslations('admin.reports');
  const {
    reports,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    retry,
    handleResolve,
  } = useAdminReports();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl max-w-fit">
          {(['ALL', 'PENDING', 'RESOLVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab === 'ALL' && t('tabAll')}
              {tab === 'PENDING' && t('tabPending')}
              {tab === 'RESOLVED' && t('tabResolved')}
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

      {reports.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colTarget')}</TableHead>
                <TableHead>{t('colReporter')}</TableHead>
                <TableHead>{t('colReason')}</TableHead>
                <TableHead>{t('colTime')}</TableHead>
                <TableHead>{t('colStatus')}</TableHead>
                <TableHead className="text-right">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{r.targetTitle}</p>
                    <Badge variant="warning" size="sm" className="mt-0.5">
                      {r.targetType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{r.reporterName}</TableCell>
                  <TableCell className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xs">
                    {r.reason}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-400">{r.createdAt}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'RESOLVED' ? 'success' : 'danger'} size="sm">
                      {r.status === 'RESOLVED' ? t('statusResolved') : t('statusPending')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === 'PENDING' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolve(r.id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        {t('btnResolve')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminReportsContent />
    </Suspense>
  );
}
