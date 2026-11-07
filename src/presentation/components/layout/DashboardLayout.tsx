'use client';

import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { DashboardSidebar } from './DashboardSidebar';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useRouter } from '@/i18n/routing';
import { Skeleton } from '../ui/Skeleton';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ('TENANT' | 'LANDLORD' | 'ADMIN' | 'MODERATOR')[];
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, isAuthenticated, initSession } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    initSession();
    const token = typeof window !== 'undefined' ? localStorage.getItem('toam_access_token') : null;
    if (!token && !isAuthenticated) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, initSession, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Check role authorization if specified
  if (allowedRoles && user && !user.roles.some((r) => allowedRoles.includes(r as any))) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="max-w-md bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-rose-600">Truy cập không được phép (403)</h2>
            <p className="text-xs text-stone-500">
              Tài khoản của bạn không có quyền truy cập vào phân hệ này. Vui lòng quay lại khu vực phù hợp.
            </p>
            <button
              onClick={() => router.replace('/')}
              className="text-xs font-semibold px-4 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950 text-stone-800 dark:text-stone-200 flex flex-col">
      <Header />
      <div className="flex-1 flex mx-auto w-full max-w-7xl">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

