'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminAuditLogs } from '@/presentation/hooks/useAdminAuditLogs';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Input } from '@/presentation/components/ui/Input';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { History, Shield } from 'lucide-react';

function AdminAuditLogsContent() {
  const t = useTranslations('admin.auditLogs');
  const { logs, searchTerm, setSearchTerm, isLoading, error, retry } = useAdminAuditLogs();

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
            <History className="w-6 h-6 text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-80">
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {logs.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colTime')}</TableHead>
                <TableHead>{t('colActor')}</TableHead>
                <TableHead>{t('colAction')}</TableHead>
                <TableHead>{t('colTarget')}</TableHead>
                <TableHead className="text-right">{t('colIp')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-neutral-500 font-mono">
                    {l.timestamp}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {l.actor}
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">
                      {l.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-neutral-600 dark:text-neutral-300 max-w-xs">
                    {l.target}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-400 font-mono text-right">
                    {l.ip}
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

export default function AdminAuditLogsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminAuditLogsContent />
    </Suspense>
  );
}
