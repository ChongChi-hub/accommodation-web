'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  ViewingAppointmentItem,
  ViewingAppointmentDetail,
  AppointmentSummary,
  AppointmentStatus,
  CancelReasonCode,
} from '@/domain/entities/ViewingAppointment';
import { Pagination } from '@/domain/repositories/LandlordRoomRepository';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { ApiError } from '@/infrastructure/http/api-client';

export type ViewMode = 'list' | 'by_room' | 'calendar';

export function useLandlordAppointments() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const statusParam = (searchParams.get('status') || 'ALL') as AppointmentStatus | 'ALL';
  const roomIdParam = searchParams.get('roomId') || '';
  const searchParam = searchParams.get('search') || '';
  const viewModeParam = (searchParams.get('view') || 'list') as ViewMode;
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [status, setStatus] = useState<AppointmentStatus | 'ALL'>(statusParam);
  const [roomId, setRoomId] = useState<string>(roomIdParam);
  const [search, setSearch] = useState<string>(searchParam);
  const [viewMode, setViewMode] = useState<ViewMode>(viewModeParam);
  const [page, setPage] = useState<number>(pageParam);

  const [appointments, setAppointments] = useState<ViewingAppointmentItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 1,
  });
  const [summary, setSummary] = useState<AppointmentSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);

  // Modals & Drawer State
  const [selectedDetail, setSelectedDetail] = useState<ViewingAppointmentDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  const [confirmTarget, setConfirmTarget] = useState<ViewingAppointmentItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ViewingAppointmentItem | null>(null);
  const [completeTarget, setCompleteTarget] = useState<ViewingAppointmentItem | null>(null);
  const [conflictWarning, setConflictWarning] = useState<{
    id: string;
    roomTitle: string;
    start: string;
    end: string;
  } | null>(null);

  const updateUrl = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([k, v]) => {
        if (v === undefined || v === '' || v === 'ALL' || (k === 'view' && v === 'list')) {
          params.delete(k);
        } else {
          params.set(k, String(v));
        }
      });
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const fetchSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const res = await container.landlord.appointmentRepository.getSummary();
      setSummary(res);
    } catch {
      // ignore
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await container.landlord.appointmentRepository.getAppointments({
        status: status === 'ALL' ? undefined : status,
        roomId: roomId || undefined,
        search: search || undefined,
        page,
        size: 20,
      });
      setAppointments(res.data);
      setPagination(res.pagination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải danh sách lịch hẹn';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [status, roomId, search, page]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = (newStatus: AppointmentStatus | 'ALL') => {
    setStatus(newStatus);
    setPage(0);
    updateUrl({ status: newStatus, page: 0 });
  };

  const handleRoomChange = (newRoomId: string) => {
    setRoomId(newRoomId);
    setPage(0);
    updateUrl({ roomId: newRoomId, page: 0 });
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(0);
    updateUrl({ search: newSearch, page: 0 });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updateUrl({ view: mode });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  };

  const openDetail = async (id: string) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const detail = await container.landlord.appointmentRepository.getDetail(id);
      setSelectedDetail(detail);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải chi tiết lịch hẹn');
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedDetail(null);
  };

  const executeConfirm = async (force: boolean = false, landlordNote?: string) => {
    if (!confirmTarget) return;
    try {
      await container.landlord.appointmentRepository.confirm(confirmTarget.id, {
        force,
        landlordNote,
        version: confirmTarget.version,
      });
      toast.success('Đã xác nhận lịch hẹn xem phòng!');
      setConfirmTarget(null);
      setConflictWarning(null);
      fetchAppointments();
      fetchSummary();
      if (selectedDetail?.id === confirmTarget.id) {
        openDetail(confirmTarget.id);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.errorCode === 'TIME_CONFLICT') {
        const anyErr = err as ApiError & { data?: { conflictingAppointmentId?: string; conflictingRoomTitle?: string; conflictingStart?: string; conflictingEnd?: string } };
        setConflictWarning({
          id: anyErr.data?.conflictingAppointmentId || '',
          roomTitle: anyErr.data?.conflictingRoomTitle || '',
          start: anyErr.data?.conflictingStart || '',
          end: anyErr.data?.conflictingEnd || '',
        });
      } else {
        toast.error(err instanceof Error ? err.message : 'Xác nhận thất bại');
      }
    }
  };

  const executeCancel = async (reasonCode: CancelReasonCode, reasonNote?: string) => {
    if (!cancelTarget) return;
    try {
      await container.landlord.appointmentRepository.cancel(cancelTarget.id, {
        reasonCode,
        reasonNote,
        version: cancelTarget.version,
      });
      toast.success('Đã hủy lịch hẹn xem phòng!');
      setCancelTarget(null);
      fetchAppointments();
      fetchSummary();
      if (selectedDetail?.id === cancelTarget.id) {
        openDetail(cancelTarget.id);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  const executeComplete = async (outcome: 'COMPLETED' | 'NO_SHOW', note?: string) => {
    if (!completeTarget) return;
    try {
      await container.landlord.appointmentRepository.complete(completeTarget.id, {
        outcome,
        note,
        version: completeTarget.version,
      });
      toast.success(
        outcome === 'COMPLETED' ? 'Đã hoàn thành cuộc hẹn xem phòng!' : 'Đã ghi nhận khách không đến'
      );
      setCompleteTarget(null);
      fetchAppointments();
      fetchSummary();
      if (selectedDetail?.id === completeTarget.id) {
        openDetail(completeTarget.id);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  return {
    status,
    roomId,
    search,
    viewMode,
    page,
    appointments,
    pagination,
    summary,
    isLoading,
    isSummaryLoading,
    selectedDetail,
    isDetailOpen,
    isDetailLoading,
    confirmTarget,
    cancelTarget,
    completeTarget,
    conflictWarning,
    handleStatusChange,
    handleRoomChange,
    handleSearchChange,
    handleViewModeChange,
    handlePageChange,
    openDetail,
    closeDetail,
    setConfirmTarget,
    setCancelTarget,
    setCompleteTarget,
    setConflictWarning,
    executeConfirm,
    executeCancel,
    executeComplete,
    refresh: () => {
      fetchAppointments();
      fetchSummary();
    },
  };
}
