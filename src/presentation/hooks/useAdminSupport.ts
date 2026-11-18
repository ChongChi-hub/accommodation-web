'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { container } from '@/infrastructure/di/container';
import { AdminSupportTicketItem } from '@/domain/repositories/AdminRepository';
import { toast } from '@/presentation/stores/toast.store';

export function useAdminSupport() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [tickets, setTickets] = useState<AdminSupportTicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicketItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
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
      setTickets([]);
      return;
    }

    try {
      const data = await container.admin.adminRepository.getSupportTickets({
        status: activeTab,
        category: categoryFilter,
        search: searchTerm,
      });
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam, activeTab, categoryFilter, searchTerm]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const loadTicketDetail = useCallback(async (id: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await container.admin.adminRepository.getSupportTicketDetail(id);
      setSelectedTicket(detail);
    } catch {
      toast.error('Không thể tải chi tiết phiếu hỗ trợ');
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const sendReply = useCallback(
    async (ticketId: string, message: string) => {
      if (!message.trim()) return;
      setIsReplying(true);
      try {
        const reply = await container.admin.adminRepository.replySupportTicket(ticketId, message);
        setSelectedTicket((prev) => {
          if (!prev) return null;
          const updatedReplies = [...(prev.replies || []), reply];
          return {
            ...prev,
            status: prev.status === 'OPEN' ? 'IN_PROGRESS' : prev.status,
            replies: updatedReplies,
          };
        });
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status: t.status === 'OPEN' ? 'IN_PROGRESS' : t.status,
                  replyCount: (t.replyCount || 0) + 1,
                }
              : t
          )
        );
        toast.success('Đã gửi phản hồi thành công');
      } catch {
        toast.error('Lỗi khi gửi phản hồi');
      } finally {
        setIsReplying(false);
      }
    },
    []
  );

  const updateStatus = useCallback(
    async (ticketId: string, status: string) => {
      try {
        await container.admin.adminRepository.updateSupportTicketStatus(ticketId, status);
        const nextStatus = status as AdminSupportTicketItem['status'];
        setSelectedTicket((prev) => (prev && prev.id === ticketId ? { ...prev, status: nextStatus } : prev));
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
        );
        toast.success('Đã cập nhật trạng thái phiếu hỗ trợ');
      } catch {
        toast.error('Lỗi khi cập nhật trạng thái');
      }
    },
    []
  );

  const metrics = useMemo(() => {
    const total = tickets.length;
    const openCount = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    return {
      total,
      openCount,
      inProgressCount,
      resolvedCount,
    };
  }, [tickets]);

  return {
    tickets,
    metrics,
    selectedTicket,
    setSelectedTicket,
    loadTicketDetail,
    sendReply,
    updateStatus,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    isLoading,
    isDetailLoading,
    isReplying,
    error,
    retry: fetchTickets,
  };
}
