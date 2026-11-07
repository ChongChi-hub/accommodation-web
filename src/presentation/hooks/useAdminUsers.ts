'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { UserItem } from '@/domain/repositories/AdminRepository';
import { toast } from '@/presentation/stores/toast.store';

export function useAdminUsers() {
  const t = useTranslations('admin.users');
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');

  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TENANT' | 'LANDLORD' | 'MODERATOR' | 'ADMIN'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
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
      setUsers([]);
      return;
    }

    try {
      const data = await container.admin.adminRepository.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [stateParam]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleLock = useCallback(
    async (id: number) => {
      await container.admin.adminRepository.toggleUserLock(id);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === id) {
            const next = u.status === 'ACTIVE' ? ('LOCKED' as const) : ('ACTIVE' as const);
            if (next === 'LOCKED') {
              toast.info(t('toastLocked', { email: u.email }));
            } else {
              toast.success(t('toastUnlocked', { email: u.email }));
            }
            return { ...u, status: next };
          }
          return u;
        })
      );
    },
    [t]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm);
      const matchTab = activeTab === 'ALL' || u.role === activeTab;
      return matchSearch && matchTab;
    });
  }, [users, searchTerm, activeTab]);

  return {
    users: filteredUsers,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    retry: fetchUsers,
    toggleLock,
  };
}

