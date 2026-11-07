'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminUsers } from '@/presentation/hooks/useAdminUsers';
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
import { Users, Lock, Unlock, Eye, Search, Mail, Phone, Calendar, ShieldCheck, Clock } from 'lucide-react';

function AdminUsersContent() {
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');
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

  const [selectedUser, setSelectedUser] = useState<any | null>(null);

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
    { id: 'TENANT', label: t('tabTenant') },
    { id: 'LANDLORD', label: t('tabLandlord') },
    { id: 'MODERATOR', label: t('tabModerator') },
    { id: 'ADMIN', label: t('tabAdmin') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Users className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
                  <TableCell className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 text-xs font-bold flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-foreground font-medium">{u.email}</p>
                    <p className="text-[11px] text-foreground-muted">{u.phone}</p>
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
                  <TableCell className="text-xs text-foreground-muted">{u.joinedAt}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                      {u.status === 'ACTIVE' ? t('statusActive') : t('statusLocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(u)}
                        title={tCommon('details')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* User Detail Drawer (Bước 4 Requirement) */}
      <Drawer
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={t('colName')}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-teal-700 text-white text-base font-bold flex items-center justify-center">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{selectedUser.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary" size="sm">{selectedUser.role}</Badge>
                  <Badge variant={selectedUser.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-3 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{selectedUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{selectedUser.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Ngày tham gia: {selectedUser.joinedAt}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Trạng thái KYC: Đã xác thực CCCD</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Lịch sử hoạt động gần nhất</span>
              </h4>
              <div className="p-3 rounded-xl border border-border bg-surface text-xs space-y-2">
                <p className="text-foreground">Đăng nhập từ IP 118.69.182.42 (TP. Hồ Chí Minh)</p>
                <p className="text-[11px] text-foreground-muted">Hôm nay lúc 09:15 SA</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button
                variant={selectedUser.status === 'ACTIVE' ? 'danger' : 'primary'}
                className="w-full"
                onClick={() => {
                  toggleLock(selectedUser.id);
                  setSelectedUser(null);
                }}
              >
                {selectedUser.status === 'ACTIVE' ? t('btnLock') : t('btnUnlock')}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
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
