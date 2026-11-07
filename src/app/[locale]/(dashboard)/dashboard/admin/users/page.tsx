'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminUsers } from '@/presentation/hooks/useAdminUsers';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Users, Lock, Unlock, Shield } from 'lucide-react';

function AdminUsersContent() {
  const t = useTranslations('admin.users');
  const {
    users,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    retry,
    toggleLock,
  } = useAdminUsers();

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
            <Users className="w-6 h-6 text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl max-w-fit overflow-x-auto">
          {(['ALL', 'TENANT', 'LANDLORD', 'MODERATOR', 'ADMIN'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab === 'ALL' && t('tabAll')}
              {tab === 'TENANT' && t('tabTenant')}
              {tab === 'LANDLORD' && t('tabLandlord')}
              {tab === 'MODERATOR' && t('tabModerator')}
              {tab === 'ADMIN' && t('tabAdmin')}
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

      {users.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colName')}</TableHead>
                <TableHead>{t('colContact')}</TableHead>
                <TableHead>{t('colRole')}</TableHead>
                <TableHead>{t('colJoined')}</TableHead>
                <TableHead>{t('colStatus')}</TableHead>
                <TableHead className="text-right">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold text-neutral-900 dark:text-neutral-100">
                    {u.name}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-neutral-800 dark:text-neutral-200">{u.email}</p>
                    <p className="text-[11px] text-neutral-400">{u.phone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.role === 'ADMIN'
                          ? 'danger'
                          : u.role === 'LANDLORD'
                          ? 'primary'
                          : u.role === 'MODERATOR'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {u.role === 'TENANT' && t('tabTenant')}
                      {u.role === 'LANDLORD' && t('tabLandlord')}
                      {u.role === 'MODERATOR' && t('tabModerator')}
                      {u.role === 'ADMIN' && t('tabAdmin')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500">{u.joinedAt}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                      {u.status === 'ACTIVE' ? t('statusActive') : t('statusLocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleLock(u.id)}
                    >
                      {u.status === 'ACTIVE' ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-rose-600 mr-1" />
                          {t('btnLock')}
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                          {t('btnUnlock')}
                        </>
                      )}
                    </Button>
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

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminUsersContent />
    </Suspense>
  );
}
