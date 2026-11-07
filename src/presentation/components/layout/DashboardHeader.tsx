'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Menu, Bell, Globe, User, LogOut, KeyRound, Shield, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';

export interface DashboardHeaderProps {
  onToggleMobileSidebar: () => void;
}

export function DashboardHeader({ onToggleMobileSidebar }: DashboardHeaderProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleLocale = () => {
    const nextLocale = locale === 'vi' ? 'en' : 'vi';
    router.replace(pathname, { locale: nextLocale });
  };

  const notifications = [
    { id: 1, title: 'Có 3 phòng mới chờ duyệt', time: '10 phút trước', unread: true },
    { id: 2, title: '1 yêu cầu KYC CCCD mới', time: '1 giờ trước', unread: true },
    { id: 3, title: 'Báo cáo vi phạm #RP-104 đã xử lý', time: 'Hôm qua', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted transition cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Tổ Ấm" width={120} height={28} priority />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted transition cursor-pointer"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-surface" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-surface border border-border shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Thông báo hệ thống</h4>
                  <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">{unreadCount} mới</span>
                </div>
                <div className="divide-y divide-border/60 py-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1 flex items-start gap-2.5 hover:bg-surface-muted/50 rounded-lg">
                      <div className="p-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                        <p className="text-[10px] text-foreground-muted mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border text-center">
                  <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold cursor-pointer hover:underline">
                    Xem tất cả thông báo
                  </span>
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />

          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 text-xs font-semibold uppercase px-2.5 py-1.5 rounded-xl border border-border text-foreground hover:bg-surface-muted transition cursor-pointer"
            title="Đổi ngôn ngữ"
          >
            <Globe size={14} />
            <span>{locale}</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-border hover:bg-surface-muted transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-semibold text-foreground max-w-[100px] truncate hidden sm:inline">
                {user?.fullName || 'Người dùng'}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs font-bold text-foreground truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-foreground-muted truncate">{user?.email}</p>
                </div>
                <Link
                  href="/dashboard/tenant/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-muted transition"
                >
                  <User className="w-4 h-4 text-foreground-muted" />
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link
                  href="/dashboard/tenant/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-muted transition"
                >
                  <KeyRound className="w-4 h-4 text-foreground-muted" />
                  <span>Đổi mật khẩu</span>
                </Link>
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
