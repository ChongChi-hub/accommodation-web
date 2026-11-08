'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import {
  Menu,
  Bell,
  Globe,
  User,
  LogOut,
  KeyRound,
  Shield,
  CheckCircle,
  Search,
  ArrowLeftRight,
  LifeBuoy,
} from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { CommandPalette } from './CommandPalette';
import { container } from '@/infrastructure/di/container';
import { Notification } from '@/domain/entities/Notification';

export interface DashboardHeaderProps {
  onToggleMobileSidebar: () => void;
}

export function DashboardHeader({ onToggleMobileSidebar }: DashboardHeaderProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchRole } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications from repository
  useEffect(() => {
    container.notification.notificationRepository.getNotifications(user?.id).then((data) => {
      setNotifications(data);
    });
  }, [user?.id]);

  const handleMarkAllRead = async () => {
    await container.notification.notificationRepository.markAllAsRead(user?.id);
    const updated = await container.notification.notificationRepository.getNotifications(user?.id);
    setNotifications(updated);
  };

  const handleNotificationClick = async (notif: Notification) => {
    await container.notification.notificationRepository.markAsRead(notif.id);
    const updated = await container.notification.notificationRepository.getNotifications(user?.id);
    setNotifications(updated);
    setShowNotifications(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLocale = () => {
    const nextLocale = locale === 'vi' ? 'en' : 'vi';
    router.replace(pathname, { locale: nextLocale });
  };

  const isLandlord = user?.roles?.includes('LANDLORD');
  const isTenant = user?.roles?.includes('TENANT') || !isLandlord;
  const isAdminOrMod = user?.roles?.some((r) => r === 'ADMIN' || r === 'MODERATOR');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
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
              <Image src="/logo.svg" alt="Tổ Ấm" width={120} height={28} style={{ width: 'auto', height: 'auto' }} priority />
            </Link>
          </div>

          {/* Quick Search Ctrl+K Button */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-border bg-surface-muted/50 hover:bg-surface-muted hover:border-border text-foreground-muted hover:text-foreground text-xs transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-foreground-muted" />
                <span>Tìm kiếm thao tác nhanh...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-surface border border-border text-foreground-muted shadow-xs">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="md:hidden p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted transition cursor-pointer"
              title="Tìm kiếm nhanh (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
            </button>

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
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-border shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Thông báo hệ thống
                      </h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border/60 py-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-foreground-muted">Không có thông báo nào</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`py-2.5 px-2 flex items-start gap-2.5 rounded-xl cursor-pointer transition ${
                            n.isRead ? 'hover:bg-surface-muted/50 opacity-80' : 'bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-50 dark:hover:bg-teal-950/50 font-medium'
                          }`}
                        >
                          <div className={`p-1.5 rounded-full mt-0.5 shrink-0 ${
                            n.type === 'ALERT'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                              : n.type === 'WARNING'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400'
                          }`}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                              {!n.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-foreground-muted mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-foreground-muted/80 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2 border-t border-border text-center">
                    <Link
                      href={isLandlord ? '/dashboard/landlord/notifications' : '/dashboard/tenant/notifications'}
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold cursor-pointer hover:underline block"
                    >
                      Xem tất cả thông báo
                    </Link>
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
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-surface border border-border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{user?.fullName}</p>
                    <p className="text-[11px] text-foreground-muted truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300">
                      {isAdminOrMod ? 'Quản trị viên' : isLandlord ? 'Chủ cho thuê' : 'Người thuê trọ'}
                    </span>
                  </div>

                  {/* Switch Role Quick Action if non-admin */}
                  {!isAdminOrMod && (
                    <div className="px-1 py-1 border-b border-border mb-1">
                      <button
                        onClick={() => {
                          const nextRole = isLandlord ? 'TENANT' : 'LANDLORD';
                          switchRole(nextRole);
                          setShowUserMenu(false);
                          router.push(nextRole === 'LANDLORD' ? '/dashboard/landlord' : '/dashboard/tenant');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>Chuyển sang {isLandlord ? 'Người thuê' : 'Chủ trọ'}</span>
                        </div>
                        <span className="text-[10px] bg-teal-100 dark:bg-teal-900 px-1.5 py-0.5 rounded">Đổi</span>
                      </button>
                    </div>
                  )}

                  <Link
                    href={isLandlord ? '/dashboard/landlord/profile' : '/dashboard/tenant/profile'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-muted transition"
                  >
                    <User className="w-4 h-4 text-foreground-muted" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>

                  <Link
                    href="/support"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-muted transition"
                  >
                    <LifeBuoy className="w-4 h-4 text-foreground-muted" />
                    <span>Trung tâm hỗ trợ</span>
                  </Link>

                  <Link
                    href={isLandlord ? '/dashboard/landlord/settings' : '/dashboard/tenant/settings'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-muted transition"
                  >
                    <KeyRound className="w-4 h-4 text-foreground-muted" />
                    <span>Cài đặt & Bảo mật</span>
                  </Link>

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
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

      {/* Command Palette Modal */}
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
    </>
  );
}

