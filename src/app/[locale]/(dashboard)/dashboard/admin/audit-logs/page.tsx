'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminAuditLogs } from '@/presentation/hooks/useAdminAuditLogs';
import { AuditLogItem } from '@/domain/repositories/AdminRepository';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { formatIsoDateTime } from '@/shared/utils/format-vnd';
import { Eye, History, RefreshCw, Search } from 'lucide-react';

function sourceVariant(source?: string): 'primary' | 'info' | 'warning' | 'success' | 'neutral' {
  switch ((source || 'ADMIN').toUpperCase()) {
    case 'BILLING':
      return 'success';
    case 'BOOKING':
      return 'info';
    case 'IDENTITY':
      return 'warning';
    case 'DISPUTE':
      return 'primary';
    default:
      return 'neutral';
  }
}

function AdminAuditLogsContent() {
  const t = useTranslations('admin.auditLogs');
  const {
    logs,
    totalCount,
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    isLoading,
    error,
    retry,
  } = useAdminAuditLogs();
  const [selected, setSelected] = useState<AuditLogItem | null>(null);

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
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <History className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')} ({totalCount} sự kiện được ghi nhận)
          </p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={retry}>
          Làm mới
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'ADMIN', 'DISPUTE', 'BILLING', 'BOOKING', 'IDENTITY'] as const).map((src) => (
            <Button
              key={src}
              variant={sourceFilter === src ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSourceFilter(src)}
            >
              {src === 'ALL' ? 'Tất cả nguồn' : src}
            </Button>
          ))}
        </div>
        <div className="w-full sm:w-80">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colTime')}</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>{t('colActor')}</TableHead>
                <TableHead>{t('colAction')}</TableHead>
                <TableHead>{t('colTarget')}</TableHead>
                <TableHead className="text-right">{t('colIp')}</TableHead>
                <TableHead className="text-right">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={String(l.id)}>
                  <TableCell className="text-xs text-foreground-muted font-mono whitespace-nowrap">
                    {formatIsoDateTime(l.timestamp) || l.timestamp}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sourceVariant(l.source)} size="sm">
                      {l.source || 'ADMIN'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <div className="font-semibold text-foreground">{l.actor}</div>
                    {l.actorRole && <div className="text-[11px] text-foreground-muted">{l.actorRole}</div>}
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
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelected(l)}>
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Nhật ký ${selected.action}` : ''}
        size="md"
      >
        {selected && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-muted border border-border">
              <div>
                <p className="text-foreground-muted">Tác nhân (Actor)</p>
                <p className="font-mono font-bold">{selected.actor} ({selected.actorRole || 'ADMIN'})</p>
              </div>
              <div>
                <p className="text-foreground-muted">Nguồn &amp; Thời gian</p>
                <p className="font-semibold">{selected.source || 'ADMIN'} • {formatIsoDateTime(selected.timestamp)}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Đối tượng tác động</p>
                <p className="font-mono">{selected.target}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Địa chỉ IP</p>
                <p className="font-mono">{selected.ip}</p>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1">Chi tiết / Payload Diff</p>
              <pre className="p-3 rounded-lg bg-surface-muted border border-border font-mono text-[11px] whitespace-pre-wrap break-all">
                {selected.details || 'Không có dữ liệu thay đổi bổ sung'}
              </pre>
            </div>
            {selected.userAgent && (
              <div>
                <p className="text-foreground-muted">User-Agent</p>
                <p className="font-mono text-[11px] break-all">{selected.userAgent}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
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
