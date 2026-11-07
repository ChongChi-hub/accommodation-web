'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { DashboardBadges } from '@/domain/repositories/BadgeRepository';
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
  X,
  Wrench,
  Scale,
  LifeBuoy,
  Activity,
  ArrowLeftRight,
  Home,
  LogOut as MoveOutIcon,
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeVariant?: 'brand' | 'warning' | 'danger';
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface DashboardSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isMobile = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchRole } = useAuthStore();
  const [badges, setBadges] = useState<DashboardBadges | null>(null);
  const [pendingAppointments, setPendingAppointments] = useState<number>(0);

  const isAdmin = user?.roles?.includes('ADMIN');
  const isModerator = user?.roles?.includes('MODERATOR');
  const isLandlord = user?.roles?.includes('LANDLORD');

  const role = (isAdmin || isModerator) ? (isModerator && !isAdmin ? 'moderator' : 'admin') : isLandlord ? 'landlord' : 'tenant';

  useEffect(() => {
    container.badge.badgeRepository.getBadges(role, user?.id).then(setBadges);
    if (isLandlord) {
      container.landlord.appointmentRepository.getSummary()
        .then((s) => setPendingAppointments(s.totalPending))
        .catch(() => {});
    }
  }, [role, user?.id, isLandlord]);

  // ADMIN SECTIONS
  const adminSections: NavSection[] = [
    {
      title: 'VẬN HÀNH HỆ THỐNG',
      items: [
        { label: 'Tổng quan hệ thống', href: '/dashboard/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Quản lý người dùng', href: '/dashboard/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Danh mục & Từ điển', href: '/dashboard/admin/dictionaries', icon: <FolderTree className="w-4 h-4" /> },
      ],
    },
    {
      title: 'KIỂM DUYỆT & GIẢI QUYẾT',
      items: [
        { label: 'Duyệt phòng đăng', href: '/dashboard/admin/rooms', icon: <CheckSquare className="w-4 h-4" />, badge: badges?.adminPendingRooms, badgeVariant: 'warning' },
        { label: 'Duyệt hồ sơ KYC', href: '/dashboard/admin/kyc', icon: <ShieldCheck className="w-4 h-4" />, badge: badges?.adminPendingKyc, badgeVariant: 'brand' },
        { label: 'Báo cáo vi phạm', href: '/dashboard/admin/reports', icon: <AlertTriangle className="w-4 h-4" />, badge: badges?.adminPendingReports, badgeVariant: 'danger' },
        { label: 'Quản lý đánh giá', href: '/dashboard/admin/reviews', icon: <Star className="w-4 h-4" /> },
        { label: 'Giải quyết tranh chấp', href: '/dashboard/admin/disputes', icon: <Scale className="w-4 h-4" />, badge: badges?.adminPendingDisputes, badgeVariant: 'warning' },
        { label: 'Phiếu hỗ trợ kỹ thuật', href: '/dashboard/admin/support', icon: <LifeBuoy className="w-4 h-4" />, badge: badges?.adminPendingSupport, badgeVariant: 'brand' },
      ],
    },
    {
      title: 'TÀI CHÍNH & HỢP ĐỒNG',
      items: [
        { label: 'Quản lý hợp đồng', href: '/dashboard/admin/contracts', icon: <FileText className="w-4 h-4" /> },
        { label: 'Giao dịch & Đối soát', href: '/dashboard/admin/transactions', icon: <CreditCard className="w-4 h-4" /> },
      ],
    },
    {
      title: 'GIÁM SÁT & CẤU HÌNH',
      items: [
        { label: 'Thống kê nền tảng', href: '/dashboard/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Tình trạng hệ thống', href: '/dashboard/admin/system-health', icon: <Activity className="w-4 h-4" /> },
        { label: 'Nhật ký kiểm toán', href: '/dashboard/admin/audit-logs', icon: <History className="w-4 h-4" /> },
        { label: 'Cấu hình hệ thống', href: '/dashboard/admin/settings', icon: <Sliders className="w-4 h-4" /> },
      ],
    },
  ];

  // MODERATOR SECTIONS
  const moderatorSections: NavSection[] = [
    {
      title: 'HÀNG ĐỢI KIỂM DUYỆT',
      items: [
        { label: 'Tổng quan kiểm duyệt', href: '/dashboard/moderator', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Duyệt bài đăng phòng', href: '/dashboard/admin/rooms', icon: <CheckSquare className="w-4 h-4" />, badge: badges?.adminPendingRooms, badgeVariant: 'warning' },
        { label: 'Duyệt hồ sơ định danh KYC', href: '/dashboard/admin/kyc', icon: <ShieldCheck className="w-4 h-4" />, badge: badges?.adminPendingKyc, badgeVariant: 'brand' },
        { label: 'Báo cáo vi phạm phòng', href: '/dashboard/admin/reports', icon: <AlertTriangle className="w-4 h-4" />, badge: badges?.adminPendingReports, badgeVariant: 'danger' },
        { label: 'Kiểm duyệt đánh giá', href: '/dashboard/admin/reviews', icon: <Star className="w-4 h-4" /> },
        { label: 'Khiếu nại & Tranh chấp', href: '/dashboard/admin/disputes', icon: <Scale className="w-4 h-4" />, badge: badges?.adminPendingDisputes, badgeVariant: 'warning' },
        { label: 'Xử lý yêu cầu hỗ trợ', href: '/dashboard/admin/support', icon: <LifeBuoy className="w-4 h-4" />, badge: badges?.adminPendingSupport, badgeVariant: 'brand' },
      ],
    },
  ];

  // LANDLORD SECTIONS
  const landlordSections: NavSection[] = [
    {
      title: 'VẬN HÀNH PHÒNG TRỌ',
      items: [
        { label: 'Tổng quan chủ trọ', href: '/dashboard/landlord', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Quản lý phòng trọ', href: '/dashboard/landlord/rooms', icon: <Building className="w-4 h-4" /> },
        { label: 'Đăng phòng mới', href: '/dashboard/landlord/rooms/new', icon: <PlusCircle className="w-4 h-4" /> },
        { label: 'Lịch hẹn xem phòng', href: '/dashboard/landlord/appointments', icon: <Calendar className="w-4 h-4" />, badge: pendingAppointments, badgeVariant: 'warning' },
        { label: 'Yêu cầu thuê phòng', href: '/dashboard/landlord/rental-requests', icon: <FileText className="w-4 h-4" />, badge: badges?.landlordRentalRequests, badgeVariant: 'brand' },
      ],
    },
    {
      title: 'HỢP ĐỒNG & THU TIỀN',
      items: [
        { label: 'Hợp đồng cho thuê', href: '/dashboard/landlord/contracts', icon: <FileText className="w-4 h-4" /> },
        { label: 'Khách thuê hiện tại', href: '/dashboard/landlord/tenants', icon: <Users className="w-4 h-4" /> },
        { label: 'Ghi chỉ số điện nước', href: '/dashboard/landlord/utilities', icon: <Gauge className="w-4 h-4" /> },
        { label: 'Hóa đơn & Thu tiền', href: '/dashboard/landlord/invoices', icon: <CreditCard className="w-4 h-4" />, badge: badges?.landlordUnpaidInvoices, badgeVariant: 'warning' },
        { label: 'Tiền cọc & Giữ chỗ', href: '/dashboard/landlord/deposits', icon: <PiggyBank className="w-4 h-4" /> },
        { label: 'Doanh thu & Báo cáo', href: '/dashboard/landlord/analytics', icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    {
      title: 'DỊCH VỤ & GIAO TIẾP',
      items: [
        { label: 'Bảo trì & Sửa chữa', href: '/dashboard/landlord/maintenance', icon: <Wrench className="w-4 h-4" />, badge: badges?.landlordMaintenanceRequests, badgeVariant: 'danger' },
        { label: 'Tin nhắn khách thuê', href: '/dashboard/landlord/messages', icon: <MessageSquare className="w-4 h-4" />, badge: badges?.landlordUnreadMessages, badgeVariant: 'brand' },
        { label: 'Đánh giá nhận được', href: '/dashboard/landlord/reviews', icon: <Star className="w-4 h-4" /> },
        { label: 'Thông báo hệ thống', href: '/dashboard/landlord/notifications', icon: <Bell className="w-4 h-4" /> },
      ],
    },
    {
      title: 'TÀI KHOẢN',
      items: [
        { label: 'Hồ sơ chủ trọ', href: '/dashboard/landlord/profile', icon: <User className="w-4 h-4" /> },
        { label: 'Xác thực chủ nhà (KYC)', href: '/dashboard/landlord/kyc', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Cài đặt tài khoản', href: '/dashboard/landlord/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  // TENANT SECTIONS
  const tenantSections: NavSection[] = [
    {
      title: 'NƠI Ở CỦA TÔI',
      items: [
        { label: 'Tổng quan', href: '/dashboard/tenant', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Phòng đang thuê', href: '/dashboard/tenant/my-room', icon: <Home className="w-4 h-4" /> },
        { label: 'Hợp đồng thuê', href: '/dashboard/tenant/contracts', icon: <FileText className="w-4 h-4" /> },
        { label: 'Lịch hẹn xem phòng', href: '/dashboard/tenant/appointments', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Yêu cầu thuê đã gửi', href: '/dashboard/tenant/rental-requests', icon: <FileText className="w-4 h-4" /> },
        { label: 'Phòng đã lưu', href: '/dashboard/tenant/saved-rooms', icon: <Bookmark className="w-4 h-4" /> },
      ],
    },
    {
      title: 'TÀI CHÍNH & TIỀN PHÒNG',
      items: [
        { label: 'Hóa đơn tiền phòng', href: '/dashboard/tenant/invoices', icon: <CreditCard className="w-4 h-4" />, badge: badges?.tenantUnpaidInvoices, badgeVariant: 'warning' },
        { label: 'Tiền cọc thuê phòng', href: '/dashboard/tenant/deposits', icon: <PiggyBank className="w-4 h-4" /> },
        { label: 'Lịch sử thanh toán', href: '/dashboard/tenant/payments', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      title: 'TRỢ GIÚP & BẢO TRÌ',
      items: [
        { label: 'Báo hỏng & Sửa chữa', href: '/dashboard/tenant/maintenance', icon: <Wrench className="w-4 h-4" /> },
        { label: 'Trả phòng & Quyết toán', href: '/dashboard/tenant/move-out', icon: <MoveOutIcon className="w-4 h-4" /> },
        { label: 'Báo cáo vi phạm', href: '/dashboard/tenant/reports', icon: <AlertTriangle className="w-4 h-4" /> },
        { label: 'Tin nhắn trao đổi', href: '/dashboard/tenant/messages', icon: <MessageSquare className="w-4 h-4" />, badge: badges?.tenantUnreadMessages, badgeVariant: 'brand' },
        { label: 'Đánh giá của tôi', href: '/dashboard/tenant/reviews', icon: <Star className="w-4 h-4" /> },
      ],
    },
    {
      title: 'CÀI ĐẶT & HỒ SƠ',
      items: [
        { label: 'Hồ sơ cá nhân', href: '/dashboard/tenant/profile', icon: <User className="w-4 h-4" /> },
        { label: 'Xác minh danh tính (KYC)', href: '/dashboard/tenant/kyc', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Cài đặt tài khoản', href: '/dashboard/tenant/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const sections: NavSection[] =
    role === 'admin'
      ? adminSections
      : role === 'moderator'
      ? moderatorSections
      : role === 'landlord'
      ? landlordSections
      : tenantSections;

  const content = (
    <div className="flex flex-col h-full justify-between">
      <div className="p-4 space-y-4">
        {isMobile && (
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-sm font-bold text-teal-800 dark:text-teal-400">Tổ Ấm Dashboard</span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* User Role Card & Fast Role Switcher */}
        <div className="p-3 bg-surface-muted rounded-xl space-y-2 border border-border/60">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
              {isAdmin
                ? 'Quản trị viên cấp cao'
                : isModerator
                ? 'Kiểm duyệt viên (Moderator)'
                : isLandlord
                ? 'Chủ trọ / Cho thuê'
                : 'Người tìm phòng / Thuê trọ'}
            </p>
            <p className="text-xs font-semibold text-teal-800 dark:text-teal-400 truncate mt-0.5">
              {user?.fullName || 'Người dùng'}
            </p>
          </div>

          {/* Quick Switch role for non-admin/mod users */}
          {!isAdmin && !isModerator && (
            <button
              onClick={() => {
                const nextRole = isLandlord ? 'TENANT' : 'LANDLORD';
                switchRole(nextRole);
                if (isMobile && onClose) onClose();
                router.push(nextRole === 'LANDLORD' ? '/dashboard/landlord' : '/dashboard/tenant');
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface border border-border text-[11px] font-medium text-foreground hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-300 transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <ArrowLeftRight className="w-3 h-3 text-foreground-muted" />
                <span>Đổi sang {isLandlord ? 'Người thuê' : 'Chủ trọ'}</span>
              </span>
              <span className="text-[10px] bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-1 py-0.2 rounded font-semibold">
                Switch
              </span>
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-5">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-foreground-muted/80">
                {section.title}
              </h5>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group',
                        isActive
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold shadow-xs'
                          : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cn(
                          'transition-colors',
                          isActive ? 'text-teal-700 dark:text-teal-300' : 'text-foreground-muted group-hover:text-foreground'
                        )}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-1 ring-inset',
                            item.badgeVariant === 'danger'
                              ? 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:ring-rose-800'
                              : item.badgeVariant === 'warning'
                              ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:ring-amber-800'
                              : 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-950/60 dark:text-teal-400 dark:ring-teal-800'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border mt-4">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-border bg-surface flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {content}
    </aside>
  );
}
