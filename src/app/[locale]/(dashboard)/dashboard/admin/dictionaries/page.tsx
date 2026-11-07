'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminDictionaries } from '@/presentation/hooks/useAdminDictionaries';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { FolderTree, Plus, MapPin, Sparkles, Building, Layers } from 'lucide-react';

function AdminDictionariesContent() {
  const t = useTranslations('admin.dictionaries');
  const tCommon = useTranslations('common');
  const { activeTab, setActiveTab, items, isLoading, error, retry } = useAdminDictionaries();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');

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

  const tabItems = [
    { id: 'room_types', label: t('tabRoomTypes'), icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'amenities', label: t('tabAmenities'), icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'locations', label: t('tabLocations'), icon: <MapPin className="w-3.5 h-3.5" /> },
  ];

  const handleCreate = () => {
    setIsAddModalOpen(false);
    toast.success(t('toastAdd'));
    setNewCode('');
    setNewName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <FolderTree className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          {t('btnAdd')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4">
        <Tabs
          items={tabItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </div>

      {/* Table */}
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
                  <TableCell className="font-mono text-xs font-semibold text-foreground-muted">
                    {item.code}
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted">
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

      {/* Add Dictionary Item Dialog */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('btnAdd')}
        description={t('subtitle')}
      >
        <div className="space-y-4 pt-2">
          <Input
            label={t('colCode')}
            placeholder="VD: STUDIO, AIR_COND..."
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
          <Input
            label={t('colName')}
            placeholder="VD: Phòng Studio, Máy điều hòa..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreate}>
              {tCommon('save')}
            </Button>
          </div>
        </div>
      </Dialog>
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
