'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminRooms } from '@/presentation/hooks/useAdminRooms';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Drawer } from '@/presentation/components/ui/Drawer';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Check, X, ShieldAlert, Search, Eye, MapPin, User, Calendar, CreditCard } from 'lucide-react';

function AdminRoomsContent() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('admin.rooms');
  const tCommon = useTranslations('common');
  const {
    rooms,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    retry,
    handleApprove,
    handleOpenReject,
    handleConfirmReject,
    rejectModalOpen,
    setRejectModalOpen,
    rejectReason,
    setRejectReason,
  } = useAdminRooms();

  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
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

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + ' đ';

  const tabItems = [
    { id: 'PENDING', label: t('tabPending') },
    { id: 'APPROVED', label: t('tabApproved') },
    { id: 'REJECTED', label: t('tabRejected') },
    { id: 'ALL', label: t('tabAll') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <ShieldAlert className="w-5 h-5" />
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

      {/* Table or Empty State */}
      {rooms.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colTitle')}</TableHead>
                <TableHead>{t('colLandlord')}</TableHead>
                <TableHead>{t('colAddress')}</TableHead>
                <TableHead>{t('colPrice')}</TableHead>
                <TableHead>{t('colSubmitted')}</TableHead>
                <TableHead className="text-right">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">#{r.id}</span>
                      <Badge
                        variant={
                          r.status === 'APPROVED'
                            ? 'success'
                            : r.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {r.status === 'APPROVED' && t('statusApproved')}
                        {r.status === 'REJECTED' && t('statusRejected')}
                        {r.status === 'PENDING' && t('statusPending')}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground-muted truncate max-w-xs mt-0.5">
                      {r.title}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{r.landlordName}</TableCell>
                  <TableCell className="text-xs text-foreground-muted max-w-[200px] truncate">{r.address}</TableCell>
                  <TableCell className="font-bold text-teal-700 dark:text-teal-400">
                    {formatPrice(r.price)}
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted">{r.submittedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRoom(r)}
                        title={tCommon('details')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {r.status === 'PENDING' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(r.id)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {t('btnApprove')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReject(r.id)}
                          >
                            <X className="w-3.5 h-3.5 text-rose-600 mr-1" />
                            {t('btnReject')}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Room Detail Drawer (Bước 4 Requirement) */}
      <Drawer
        isOpen={Boolean(selectedRoom)}
        onClose={() => setSelectedRoom(null)}
        title={t('colTitle')}
      >
        {selectedRoom && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedRoom.status === 'APPROVED'
                      ? 'success'
                      : selectedRoom.status === 'REJECTED'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {selectedRoom.status}
                </Badge>
                <span className="text-xs text-foreground-muted">{tAuto('k0015')}{selectedRoom.id}</span>
              </div>
              <h3 className="text-base font-bold text-foreground">{selectedRoom.title}</h3>
            </div>

            <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-3 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{selectedRoom.address}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{tAuto('k0016')}{' '}{selectedRoom.landlordName}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CreditCard className="w-4 h-4 text-teal-700 shrink-0" />
                <span className="font-bold text-teal-700 dark:text-teal-400">
                  {formatPrice(selectedRoom.price)}{' '}{tAuto('k0017')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{tAuto('k0018')}{' '}{selectedRoom.submittedAt}</span>
              </div>
            </div>

            {selectedRoom.status === 'PENDING' && (
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    handleApprove(selectedRoom.id);
                    setSelectedRoom(null);
                  }}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  {t('btnApprove')}
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    handleOpenReject(selectedRoom.id);
                    setSelectedRoom(null);
                  }}
                >
                  <X className="w-4 h-4 mr-1.5" />
                  {t('btnReject')}
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Reject Reason Dialog */}
      <Dialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={t('rejectModalTitle')}
        description={t('rejectModalDesc')}
      >
        <div className="space-y-4 pt-2">
          <textarea
            rows={3}
            placeholder={t('rejectReasonPlaceholder')}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full rounded-xl border border-border p-3 text-xs bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReject}>
              {t('btnConfirmReject')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default function AdminRoomsModerationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminRoomsContent />
    </Suspense>
  );
}
