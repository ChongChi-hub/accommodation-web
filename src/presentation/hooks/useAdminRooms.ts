'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { PendingRoomItem } from '@/domain/repositories/AdminRepository';
import { toast } from '@/presentation/stores/toast.store';

export function useAdminRooms() {
  const t = useTranslations('admin.rooms');
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [rooms, setRooms] = useState<PendingRoomItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (stateParam === 'loading') {
      setIsLoading(true);
      return;
    }
    if (stateParam === 'error') {
      setIsLoading(false);
      setError('SIMULATED_ERROR');
      return;
    }
    if (stateParam === 'empty') {
      setIsLoading(false);
      setRooms([]);
      return;
    }

    try {
      const data = await container.admin.adminRepository.getPendingRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleApprove = useCallback(
    async (id: number) => {
      await container.admin.adminRepository.approveRoom(id);
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const } : r))
      );
      toast.success(t('toastApproved', { id }));
    },
    [t]
  );

  const handleOpenReject = (id: number) => {
    setSelectedRoomId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = useCallback(async () => {
    if (!selectedRoomId) return;
    if (!rejectReason.trim()) {
      toast.error(t('rejectReasonRequired'));
      return;
    }
    await container.admin.adminRepository.rejectRoom(selectedRoomId, rejectReason);
    setRooms((prev) =>
      prev.map((r) => (r.id === selectedRoomId ? { ...r, status: 'REJECTED' as const } : r))
    );
    setRejectModalOpen(false);
    toast.info(t('toastRejected', { id: selectedRoomId }));
  }, [selectedRoomId, rejectReason, t]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.landlordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTab = activeTab === 'ALL' || r.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [rooms, searchTerm, activeTab]);

  return {
    rooms: filteredRooms,
    rawCount: rooms.length,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    retry: fetchRooms,
    handleApprove,
    handleOpenReject,
    handleConfirmReject,
    rejectModalOpen,
    setRejectModalOpen,
    rejectReason,
    setRejectReason,
  };
}

