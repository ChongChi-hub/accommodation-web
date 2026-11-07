'use client';

import React from 'react';
import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Bookmark,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  Bell,
  Star,
  Settings,
  Building,
  PlusCircle,
  Users,
  Gauge,
  BarChart3,
  CheckSquare,
  AlertTriangle,
  FolderTree,
  History,
  Sliders,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const role = user?.roles.includes('ADMIN') || user?.roles.includes('MODERATOR')
    ? 'admin'
    : user?.roles.includes('LANDLORD')
    ? 'landlord'
    : 'tenant';

  const tenantItems: NavItem[] = [
    { label: 'Tổng quan', href: '/dashboard/tenant', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Hồ sơ cá nhân', href: '/dashboard/tenant/profile', icon: <User className="w-4 h-4" /> },
    { label: 'Xác minh danh tính', href: '/dashboard/tenant/kyc', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Phòng đã lưu', href: '/dashboard/tenant/saved-rooms', icon: <Bookmark className="w-4 h-4" /> },
    { label: 'Lịch hẹn xem phòng', href: '/dashboard/tenant/appointments', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Yêu cầu thuê', href: '/dashboard/tenant/rental-requests', icon: <FileText className="w-4 h-4" /> },
    { label: 'Hợp đồng thuê', href: '/dashboard/tenant/contracts', icon: <FileText className="w-4 h-4" /> },
    { label: 'Hóa đơn & Tiền phòng', href: '/dashboard/tenant/invoices', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Lịch sử thanh toán', href: '/dashboard/tenant/payments', icon: <History className="w-4 h-4" /> },
    { label: 'Tin nhắn trao đổi', href: '/dashboard/tenant/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Thông báo', href: '/dashboard/tenant/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Đánh giá của tôi', href: '/dashboard/tenant/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Cài đặt tài khoản', href: '/dashboard/tenant/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const landlordItems: NavItem[] = [
    { label: 'Tổng quan', href: '/dashboard/landlord', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Quản lý phòng trọ', href: '/dashboard/landlord/rooms', icon: <Building className="w-4 h-4" /> },
    { label: 'Đăng phòng mới', href: '/dashboard/landlord/rooms/new', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Lịch hẹn xem phòng', href: '/dashboard/landlord/appointments', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Yêu cầu thuê phòng', href: '/dashboard/landlord/rental-requests', icon: <FileText className="w-4 h-4" /> },
    { label: 'Hợp đồng thuê', href: '/dashboard/landlord/contracts', icon: <FileText className="w-4 h-4" /> },
    { label: 'Khách thuê hiện tại', href: '/dashboard/landlord/tenants', icon: <Users className="w-4 h-4" /> },
    { label: 'Ghi chỉ số điện nước', href: '/dashboard/landlord/utilities', icon: <Gauge className="w-4 h-4" /> },
    { label: 'Hóa đơn & Thu tiền', href: '/dashboard/landlord/invoices', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Doanh thu & Báo cáo', href: '/dashboard/landlord/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Đánh giá nhận được', href: '/dashboard/landlord/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Tin nhắn khách', href: '/dashboard/landlord/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Thông báo hệ thống', href: '/dashboard/landlord/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Xác thực chủ nhà (KYC)', href: '/dashboard/landlord/kyc', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Cài đặt tài khoản', href: '/dashboard/landlord/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const adminItems: NavItem[] = [
    { label: 'Tổng quan hệ thống', href: '/dashboard/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Duyệt phòng đăng', href: '/dashboard/admin/rooms', icon: <CheckSquare className="w-4 h-4" /> },
    { label: 'Duyệt hồ sơ KYC', href: '/dashboard/admin/kyc', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Quản lý người dùng', href: '/dashboard/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Báo cáo vi phạm', href: '/dashboard/admin/reports', icon: <AlertTriangle className="w-4 h-4" /> },
    { label: 'Quản lý đánh giá', href: '/dashboard/admin/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Danh mục & Từ điển', href: '/dashboard/admin/dictionaries', icon: <FolderTree className="w-4 h-4" /> },
    { label: 'Thống kê nền tảng', href: '/dashboard/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Nhật ký kiểm toán', href: '/dashboard/admin/audit-logs', icon: <History className="w-4 h-4" /> },
    { label: 'Cấu hình hệ thống', href: '/dashboard/admin/settings', icon: <Sliders className="w-4 h-4" /> },
  ];

  const items = role === 'admin' ? adminItems : role === 'landlord' ? landlordItems : tenantItems;

  return (
    <aside className="w-64 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {role === 'admin'
              ? 'Khu vực quản trị viên'
              : role === 'landlord'
              ? 'Khu vực chủ trọ'
              : 'Khu vực người thuê'}
          </p>
          <p className="text-xs font-semibold text-teal-800 dark:text-teal-400 truncate">
            {user?.fullName || 'Người dùng'}
          </p>
        </div>

        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
              )}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-stone-100 dark:border-stone-800">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

