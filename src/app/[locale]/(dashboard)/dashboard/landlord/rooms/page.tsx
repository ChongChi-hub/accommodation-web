'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useLandlordRooms } from '@/presentation/hooks/useLandlordRooms';
import { LandlordRoomTable } from '@/presentation/components/landlord/LandlordRoomTable';
import { LandlordRoomCard } from '@/presentation/components/landlord/LandlordRoomCard';
import { LandlordRoomDeleteModal } from '@/presentation/components/landlord/LandlordRoomDeleteModal';
import { LandlordRoomItem } from '@/domain/entities/LandlordRoom';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { Pagination } from '@/presentation/components/ui/Pagination';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { PlusCircle, Search, Building, RefreshCw, X } from 'lucide-react';

export default function LandlordRoomsPage() {
  const t = useTranslations('landlord.rooms');
  const {
    rooms,
    summary,
    pagination,
    isLoading,
    error,
    search,
    status,
    sort,
    setSearch,
    setStatus,
    setSort,
    setPage,
    toggleVisibility,
    deleteRoom,
    refresh,
  } = useLandlordRooms();

  const [searchInput, setSearchInput] = useState(search);
  const [selectedDeleteRoom, setSelectedDeleteRoom] = useState<LandlordRoomItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const tabs = [
    { id: 'ALL', label: t('tabs.all'), badge: summary.total },
    { id: 'PUBLISHED', label: t('tabs.published'), badge: summary.published },
    { id: 'HIDDEN', label: t('tabs.hidden'), badge: summary.hidden },
    { id: 'PENDING_REVIEW', label: t('tabs.pending'), badge: summary.pendingReview },
    { id: 'DRAFT', label: t('tabs.draft'), badge: summary.draft },
    { id: 'REJECTED', label: t('tabs.rejected'), badge: summary.rejected },
    { id: 'RENTED', label: t('tabs.rented'), badge: summary.rented },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  const handleToggleVisibility = async (roomId: number, currentHidden: boolean): Promise<boolean> => {
    setTogglingId(roomId);
    try {
      return await toggleVisibility(roomId, currentHidden);
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async (roomId: number) => {
    setIsDeleting(true);
    try {
      const ok = await deleteRoom(roomId);
      if (ok) setSelectedDeleteRoom(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t('title')} {summary.total > 0 && `(${summary.total})`}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/dashboard/landlord/rooms/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
            {t('createNew')}
          </Button>
        </Link>
      </div>

      {/* Tabs by Status */}
      <div className="overflow-x-auto pb-1">
        <Tabs items={tabs} activeId={status} onChange={setStatus} />
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('searchPlaceholder')}
              leftIcon={<Search className="w-4 h-4 text-stone-400" />}
              className="text-xs pr-8"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                aria-label="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <div className="w-full sm:w-56 shrink-0">
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={[
                { value: 'createdAt,desc', label: t('sort.newest') },
                { value: 'price,asc', label: t('sort.priceAsc') },
                { value: 'price,desc', label: t('sort.priceDesc') },
                { value: 'viewCount,desc', label: t('sort.mostViewed') },
              ]}
              className="text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Main Content: 4 Visual States */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-stone-100 dark:border-stone-800 animate-pulse">
                <div className="w-14 h-14 bg-stone-200 dark:bg-stone-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/2" />
                </div>
                <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded w-20" />
                <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-28" />
              </div>
            ))}
          </div>
        </Card>
      ) : error ? (
        <ErrorState
          title={t('error.title')}
          message={t('error.desc')}
          onRetry={refresh}
        />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<Building className="w-8 h-8 text-stone-400" />}
          title={t('empty.title')}
          description={t('empty.desc')}
          actionLabel={search || status !== 'ALL' ? t('empty.resetFilter') : t('empty.cta')}
          onAction={() => {
            if (search || status !== 'ALL') {
              handleClearSearch();
              setStatus('ALL');
            } else {
              window.location.href = '/dashboard/landlord/rooms/new';
            }
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="p-0 overflow-hidden">
              <LandlordRoomTable
                rooms={rooms}
                onToggleVisibility={handleToggleVisibility}
                onOpenDelete={(r) => setSelectedDeleteRoom(r)}
                isTogglingId={togglingId}
              />
            </Card>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden space-y-3">
            {rooms.map((r) => (
              <LandlordRoomCard
                key={r.id}
                room={r}
                onToggleVisibility={handleToggleVisibility}
                onOpenDelete={(room) => setSelectedDeleteRoom(room)}
                isTogglingId={togglingId}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page + 1}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <LandlordRoomDeleteModal
        room={selectedDeleteRoom}
        isOpen={!!selectedDeleteRoom}
        onClose={() => setSelectedDeleteRoom(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
