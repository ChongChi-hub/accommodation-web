'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoomDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useRouter, usePathname } from '@/i18n/routing';

export function useBookmarks() {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.bookmark.bookmarkRepository.getMyBookmarks();
      setRooms(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách phòng đã lưu';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const removeBookmark = useCallback(async (roomId: number) => {
    setRooms((curr) => curr.filter((r) => r.id !== roomId));
    try {
      await container.bookmark.bookmarkRepository.removeBookmark(roomId);
    } catch (err) {
      fetchBookmarks();
      throw err;
    }
  }, [fetchBookmarks]);

  return {
    rooms,
    isLoading,
    error,
    refetch: fetchBookmarks,
    removeBookmark,
  };
}

export function useBookmarkToggle(roomId: number, initialBookmarked = false, initialCount = 0) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  useEffect(() => {
    setBookmarkCount(initialCount);
  }, [initialCount]);

  const toggle = useCallback(async () => {
    if (!user) {
      const redirectUrl = `${pathname}?action=bookmark&roomId=${roomId}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    if (isPending) return;
    setIsPending(true);

    const prevBookmarked = isBookmarked;
    const prevCount = bookmarkCount;

    const nextBookmarked = !prevBookmarked;
    const nextCount = nextBookmarked ? prevCount + 1 : Math.max(0, prevCount - 1);
    setIsBookmarked(nextBookmarked);
    setBookmarkCount(nextCount);

    try {
      if (nextBookmarked) {
        const res = await container.bookmark.bookmarkRepository.addBookmark(roomId);
        setIsBookmarked(res.isBookmarked);
        setBookmarkCount(res.bookmarkCount);
      } else {
        const res = await container.bookmark.bookmarkRepository.removeBookmark(roomId);
        setIsBookmarked(res.isBookmarked);
        setBookmarkCount(res.bookmarkCount);
      }
    } catch {
      setIsBookmarked(prevBookmarked);
      setBookmarkCount(prevCount);
    } finally {
      setIsPending(false);
    }
  }, [user, roomId, isPending, isBookmarked, bookmarkCount, pathname, router]);

  return {
    isBookmarked,
    bookmarkCount,
    isPending,
    toggle,
  };
}
