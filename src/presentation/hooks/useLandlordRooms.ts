'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import {
  LandlordRoomItem,
  LandlordRoomSummary,
  LandlordRoomFilterParams,
} from '@/domain/entities/LandlordRoom';
import { Pagination } from '@/domain/repositories/LandlordRoomRepository';
import { toast } from '@/presentation/stores/toast.store';

const DEFAULT_SUMMARY: LandlordRoomSummary = {
  total: 0,
  published: 0,
  hidden: 0,
  pendingReview: 0,
  draft: 0,
  rejected: 0,
  rented: 0,
};

const DEFAULT_PAGINATION: Pagination = {
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 1,
};

export function useLandlordRooms() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const stateParam = searchParams.get('state');
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialSort = searchParams.get('sort') || 'createdAt,desc';
  const initialPage = parseInt(searchParams.get('page') || '0', 10);

  const [rooms, setRooms] = useState<LandlordRoomItem[]>([]);
  const [summary, setSummary] = useState<LandlordRoomSummary>(DEFAULT_SUMMARY);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearchState] = useState(initialSearch);
  const [status, setStatusState] = useState(initialStatus);
  const [sort, setSortState] = useState(initialSort);
  const [page, setPageState] = useState(initialPage);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateUrl = useCallback((newParams: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '' || (k === 'page' && v === 0) || (k === 'status' && v === 'ALL')) {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}` as any);
    });
  }, [pathname, router, searchParams]);

  const fetchRooms = useCallback(async () => {
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
      setPagination({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const res = await container.landlord.landlordRoomRepository.getRooms({
        search: search.trim() || undefined,
        status: status !== 'ALL' ? status : undefined,
        sort,
        page,
        size: 10,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setRooms(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách phòng');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [stateParam, search, status, sort, page]);

  const fetchSummary = useCallback(async () => {
    if (stateParam === 'loading' || stateParam === 'error' || stateParam === 'empty') {
      return;
    }
    try {
      const sum = await container.landlord.landlordRoomRepository.getSummary();
      setSummary(sum);
    } catch {
      // Non-critical, ignore
    }
  }, [stateParam]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const setSearch = (val: string) => {
    setSearchState(val);
    setPageState(0);
    updateUrl({ search: val, page: 0 });
  };

  const setStatus = (val: string) => {
    setStatusState(val);
    setPageState(0);
    updateUrl({ status: val, page: 0 });
  };

  const setSort = (val: string) => {
    setSortState(val);
    setPageState(0);
    updateUrl({ sort: val, page: 0 });
  };

  const setPage = (val: number) => {
    setPageState(val);
    updateUrl({ page: val });
  };

  const toggleVisibility = async (roomId: number, currentHidden: boolean): Promise<boolean> => {
    const makeVisible = currentHidden;
    // Optimistic update
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: makeVisible ? 'PUBLISHED' : 'HIDDEN',
              hiddenReason: makeVisible ? null : r.hiddenReason,
              hiddenBy: makeVisible ? null : 'OWNER',
            }
          : r
      )
    );

    try {
      await container.landlord.landlordRoomRepository.toggleVisibility(roomId, makeVisible);
      toast.success(makeVisible ? 'Đã mở lại bài đăng phòng' : 'Đã tạm ẩn bài đăng');
      fetchSummary();
      return true;
    } catch (err: any) {
      // Revert
      await fetchRooms();
      toast.error(err?.message || 'Không thể thay đổi trạng thái ẩn/hiện');
      return false;
    }
  };

  const deleteRoom = async (roomId: number): Promise<boolean> => {
    try {
      await container.landlord.landlordRoomRepository.deleteRoom(roomId);
      toast.success('Đã xóa phòng trọ thành công');
      fetchRooms();
      fetchSummary();
      return true;
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa phòng');
      return false;
    }
  };

  return {
    rooms,
    summary,
    pagination,
    isLoading,
    error,
    search,
    status,
    sort,
    page,
    setSearch,
    setStatus,
    setSort,
    setPage,
    toggleVisibility,
    deleteRoom,
    refresh: fetchRooms,
  };
}
