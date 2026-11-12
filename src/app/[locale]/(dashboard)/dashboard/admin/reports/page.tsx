'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminReports } from '@/presentation/hooks/useAdminReports';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Drawer } from '@/presentation/components/ui/Drawer';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { AlertTriangle, CheckCircle, Eye, Search, ShieldAlert, FileText, User } from 'lucide-react';

function AdminReportsContent() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('admin.reports');
  const tCommon = useTranslations('common');
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

  const [selectedReport, setSelectedReport] = useState<any | null>(null);

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

  const tabItems = [
    { id: 'ALL', label: t('tabAll') },
    { id: 'PENDING', label: t('tabPending') },
    { id: 'RESOLVED', label: t('tabResolved') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          items={tabItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />

        <div className="w-full sm:w-72">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
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
                    <p className="font-bold text-foreground">{r.targetTitle}</p>
                    <Badge variant="warning" size="sm" className="mt-0.5">
                      {r.targetType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{r.reporterName}</TableCell>
                  <TableCell className="text-xs text-foreground-muted max-w-xs truncate">
                    {r.reason}
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted">{r.createdAt}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'RESOLVED' ? 'success' : 'danger'} size="sm">
                      {r.status === 'RESOLVED' ? t('statusResolved') : t('statusPending')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReport(r)}
                        title={tCommon('details')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Violation Report Drawer (Bước 4 Requirement) */}
      <Drawer
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        title={t('title')}
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="space-y-2 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Badge variant={selectedReport.status === 'RESOLVED' ? 'success' : 'danger'}>
                  {selectedReport.status === 'RESOLVED' ? t('statusResolved') : t('statusPending')}
                </Badge>
                <Badge variant="warning">{selectedReport.targetType}</Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">{selectedReport.targetTitle}</h3>
            </div>

            <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-3 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{tAuto('k0009')}{' '}<strong className="font-semibold">{selectedReport.reporterName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{tAuto('k0010')}{' '}{selectedReport.createdAt}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>{tAuto('k0011')}</span>
              </h4>
              <div className="p-4 rounded-xl border border-border bg-surface text-xs leading-relaxed text-foreground">
                {selectedReport.reason}
              </div>
            </div>

            {selectedReport.status === 'PENDING' && (
              <div className="pt-4 border-t border-border flex justify-end">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    handleResolve(selectedReport.id);
                    setSelectedReport(null);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  {t('btnResolve')}
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
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
