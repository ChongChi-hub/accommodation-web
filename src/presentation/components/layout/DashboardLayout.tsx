'use client';
import { useTranslations } from 'next-intl';

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useRouter, usePathname } from '@/i18n/routing';
import { Skeleton } from '../ui/Skeleton';
import { Drawer } from '../ui/Drawer';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from '@/i18n/routing';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ('TENANT' | 'LANDLORD' | 'ADMIN' | 'MODERATOR')[];
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const tAuto = useTranslations('autoI18n');
  const { user, isAuthenticated, hasHydrated, initSession } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    void initSession();
  }, [initSession]);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
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
              {tAuto('k0534')}
            </h2>
            <p className="text-xs text-foreground-muted leading-relaxed">
              {tAuto('k0535')}{user?.roles.join(', ')}{tAuto('k0536')}
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => router.replace('/dashboard/admin')}
              >
                {tAuto('k0537')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-clip">
      <DashboardHeader onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      <div className="flex-1 flex w-full min-w-0">
        {/* Desktop Sidebar pinned flush left */}
        <DashboardSidebar />

        {/* Mobile Offcanvas Drawer (<1024px) */}
        <Drawer
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          position="left"
          className="w-72 max-w-[85vw] p-0"
        >
          <DashboardSidebar isMobile onClose={() => setIsMobileSidebarOpen(false)} />
        </Drawer>

        {/* Main Content Area: uses full remaining width, caps gracefully at 1600px on ultrawide */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-clip">
          <div className="w-full max-w-[1600px] mx-auto space-y-6 min-w-0">
            {user?.roles?.includes('LANDLORD') && !user?.faceVerified && !pathname.includes('/kyc/face') && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      Yêu cầu xác thực khuôn mặt (Face Verification)
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5">
                      Bạn đã nâng cấp thành công lên Chủ trọ. Để đảm bảo an toàn và được quyền đăng phòng mới hoặc lập hợp đồng, vui lòng hoàn tất xác thực khuôn mặt.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/landlord/kyc/face"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 transition-colors"
                >
                  <span>Xác thực ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
