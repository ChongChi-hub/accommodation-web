'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminDictionaries } from '@/presentation/hooks/useAdminDictionaries';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { FolderTree, Plus, MapPin, Sparkles, Building } from 'lucide-react';

function AdminDictionariesContent() {
  const t = useTranslations('admin.dictionaries');
  const { activeTab, setActiveTab, items, isLoading, error, retry } = useAdminDictionaries();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-10 w-full max-w-md" />
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
            <FolderTree className="w-6 h-6 text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => toast.info(t('toastAdd'))}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          {t('btnAdd')}
        </Button>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('room_types')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'room_types'
              ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Building className="w-4 h-4" />
          {t('tabRoomTypes')}
        </button>
        <button
          onClick={() => setActiveTab('amenities')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'amenities'
              ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {t('tabAmenities')}
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'locations'
              ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          {t('tabLocations')}
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colCode')}</TableHead>
                <TableHead>{t('colName')}</TableHead>
                <TableHead>
                  {activeTab === 'room_types' && t('colDesc')}
                  {activeTab === 'amenities' && t('colCategory')}
                  {activeTab === 'locations' && t('colCoverage')}
                </TableHead>
                <TableHead className="text-right">{t('colStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    {item.code}
                  </TableCell>
                  <TableCell className="font-bold text-neutral-900 dark:text-neutral-100">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500 dark:text-neutral-400">
                    {item.description || item.category || item.coverage}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="success" size="sm">
                      {item.status === 'ACTIVE' ? t('statusActive') : t('statusCovered')}
                    </Badge>
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

export default function AdminDictionariesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminDictionariesContent />
    </Suspense>
  );
}
