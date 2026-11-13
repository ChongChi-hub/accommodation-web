import React from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Bookmark,
  Building,
  Calendar,
  CheckSquare,
  CreditCard,
  FileText,
  FolderTree,
  Gauge,
  History,
  Home,
  LayoutDashboard,
  LogOut as MoveOutIcon,
  MessageSquare,
  PiggyBank,
  PlusCircle,
  Scale,
  Settings,
  ShieldCheck,
  Sliders,
  Star,
  User,
  Users,
  Wrench,
  LifeBuoy,
} from 'lucide-react';
import { DashboardBadges } from '@/domain/repositories/BadgeRepository';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeVariant?: 'brand' | 'warning' | 'danger';
}

export interface SidebarNavSection {
  title: string;
  items: SidebarNavItem[];
}

export function buildSidebarSections(
  role: 'admin' | 'moderator' | 'landlord' | 'tenant',
  badges: DashboardBadges | null,
  pendingAppointments: number
): SidebarNavSection[] {
  if (role === 'admin') {
    return [
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
          { label: 'Thông báo hệ thống', href: '/dashboard/admin/notifications', icon: <Bell className="w-4 h-4" /> },
          { label: 'Cấu hình hệ thống', href: '/dashboard/admin/settings', icon: <Sliders className="w-4 h-4" /> },
        ],
      },
    ];
  }

  if (role === 'moderator') {
    return [
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
          { label: 'Thông báo hệ thống', href: '/dashboard/moderator/notifications', icon: <Bell className="w-4 h-4" /> },
        ],
      },
    ];
  }

  if (role === 'landlord') {
    return [
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
  }

  return [
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
        { label: 'Chỉ số điện nước', href: '/dashboard/tenant/utilities', icon: <Gauge className="w-4 h-4" /> },
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
        { label: 'Thông báo hệ thống', href: '/dashboard/tenant/notifications', icon: <Bell className="w-4 h-4" /> },
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
}

