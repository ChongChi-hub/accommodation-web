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
import { History, Search, Shield, Globe } from 'lucide-react';

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <History className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full sm:w-80">
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
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
                  <TableCell className="text-xs text-foreground-muted font-mono whitespace-nowrap">
                    {l.timestamp}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {l.actor}
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">
                      {l.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-foreground max-w-xs truncate">
                    {l.target}
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted font-mono text-right whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-surface-muted border border-border">
                      {l.ip}
                    </span>
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
