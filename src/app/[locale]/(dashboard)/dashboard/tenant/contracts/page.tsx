'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { ArrowRight, Calendar, FileText } from 'lucide-react';

export default function TenantContractsPage() {
  const t = useTranslations('sprint3.contract');
  const tc = useTranslations('sprint3.common');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await container.contract.contractRepository.getTenantContracts();
      setContracts(list);
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('tenantTitle')} ({contracts.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('tenantSubtitle')}</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-xl" />
      ) : contracts.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8" />} title={t('empty')} />
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <Card key={c.id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold">{c.contractCode}</span>
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                    {c.status}
                  </Badge>
                </div>
                <span className="text-xs text-stone-400">{formatIsoDateTime(c.createdAt)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-600 dark:text-stone-300">
                <span>{t('roomIdLabel')}: <strong>#{c.roomId}</strong></span>
                <span>{t('monthlyRent')}: <strong className="text-teal-700">{formatVnd(c.monthlyRent)}</strong></span>
                <span>{t('depositAmount')}: <strong className="text-teal-700">{formatVnd(c.depositAmount)}</strong></span>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {formatIsoDate(c.startDate)} - {formatIsoDate(c.endDate)}
                </span>
                <Link href={`/dashboard/tenant/contracts/${c.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {tc('viewDetail')}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
