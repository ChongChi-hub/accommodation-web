'use client';

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useRouter, usePathname } from '@/i18n/routing';
import { Skeleton } from '../ui/Skeleton';
import { Drawer } from '../ui/Drawer';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ('TENANT' | 'LANDLORD' | 'ADMIN' | 'MODERATOR')[];
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, isAuthenticated, initSession } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    initSession();
    const token = typeof window !== 'undefined' ? localStorage.getItem('cozynest_access_token') : null;
    if (!token && !isAuthenticated) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, initSession, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="h-16 border-b border-border bg-surface flex items-center px-6">
          <Skeleton className="h-6 w-32" />
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Moderator RBAC check: moderators cannot access system-level settings, users, dictionaries, audit logs
  const isModerator = user?.roles.includes('MODERATOR') && !user?.roles.includes('ADMIN');
  const adminOnlyRoutes = [
    '/dashboard/admin/users',
    '/dashboard/admin/dictionaries',
    '/dashboard/admin/analytics',
    '/dashboard/admin/audit-logs',
    '/dashboard/admin/settings',
  ];
  const isForbiddenForModerator = isModerator && adminOnlyRoutes.some((route) => pathname.startsWith(route));

  if (isForbiddenForModerator || (allowedRoles && user && !user.roles.some((r) => allowedRoles.includes(r as any)))) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <DashboardHeader onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-surface p-8 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">
              Truy cập không được phép (403)
            </h2>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Tài khoản của bạn ({user?.roles.join(', ')}) không có quyền quản trị phân hệ này. Vui lòng quay lại khu vực được cấp quyền.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => router.replace('/dashboard/admin')}
              >
                Về bảng điều khiển
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
      
      <div className="flex-1 flex mx-auto w-full max-w-7xl">
        {/* Desktop Sidebar */}
        <DashboardSidebar />

        {/* Mobile Offcanvas Drawer */}
        <Drawer
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          position="left"
          className="w-72 max-w-[85vw] p-0"
        >
          <DashboardSidebar isMobile onClose={() => setIsMobileSidebarOpen(false)} />
        </Drawer>

        {/* Main Content Area */}
        <main className="w-full flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
