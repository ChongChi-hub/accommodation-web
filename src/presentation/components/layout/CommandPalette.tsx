'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import {
  Search,
  LayoutDashboard,
  Building,
  Users,
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Star,
  FolderTree,
  BarChart3,
  History,
  Sliders,
  CreditCard,
  Wrench,
  FileText,
  LifeBuoy,
  LogOut,
  Calendar,
  MessageSquare,
  Home,
} from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [query, setQuery] = useState('');

  const isAdmin = user?.roles?.includes('ADMIN');
  const isModerator = user?.roles?.includes('MODERATOR');
  const isLandlord = user?.roles?.includes('LANDLORD');
  const isTenant = user?.roles?.includes('TENANT') || !isLandlord;

  const allCommands: CommandItem[] = [
    // Common
    { id: 'home', title: 'Trang chủ tìm phòng', category: 'Điều hướng chung', href: '/', icon: <Home className="w-4 h-4" /> },
    { id: 'rooms', title: 'Khám phá tất cả phòng trọ', category: 'Điều hướng chung', href: '/rooms', icon: <Building className="w-4 h-4" /> },
    { id: 'support', title: 'Trung tâm trợ giúp & gửi phiếu hỗ trợ', category: 'Điều hướng chung', href: '/support', icon: <LifeBuoy className="w-4 h-4" /> },

    // Admin & Mod
    { id: 'adm-ov', title: 'Tổng quan quản trị sàn', category: 'Quản trị hệ thống', href: '/dashboard/admin', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['ADMIN', 'MODERATOR'] },
    { id: 'adm-rooms', title: 'Duyệt bài đăng phòng trọ mới', category: 'Quản trị hệ thống', href: '/dashboard/admin/rooms', icon: <CheckSquare className="w-4 h-4" />, roles: ['ADMIN', 'MODERATOR'] },
    { id: 'adm-kyc', title: 'Duyệt hồ sơ định danh eKYC CCCD', category: 'Quản trị hệ thống', href: '/dashboard/admin/kyc', icon: <ShieldCheck className="w-4 h-4" />, roles: ['ADMIN', 'MODERATOR'] },
    { id: 'adm-users', title: 'Quản lý tài khoản người dùng', category: 'Quản trị hệ thống', href: '/dashboard/admin/users', icon: <Users className="w-4 h-4" />, roles: ['ADMIN'] },
    { id: 'adm-reports', title: 'Xử lý báo cáo vi phạm phòng & chủ trọ', category: 'Quản trị hệ thống', href: '/dashboard/admin/reports', icon: <AlertTriangle className="w-4 h-4" />, roles: ['ADMIN', 'MODERATOR'] },
    { id: 'adm-contracts', title: 'Quản lý hợp đồng toàn sàn', category: 'Quản trị hệ thống', href: '/dashboard/admin/contracts', icon: <FileText className="w-4 h-4" />, roles: ['ADMIN'] },
    { id: 'adm-trans', title: 'Giao dịch, nạp cọc & đối soát sàn', category: 'Quản trị hệ thống', href: '/dashboard/admin/transactions', icon: <CreditCard className="w-4 h-4" />, roles: ['ADMIN'] },
    { id: 'adm-disp', title: 'Giải quyết khiếu nại & tranh chấp cọc', category: 'Quản trị hệ thống', href: '/dashboard/admin/disputes', icon: <LifeBuoy className="w-4 h-4" />, roles: ['ADMIN', 'MODERATOR'] },
    { id: 'adm-audit', title: 'Xem nhật ký kiểm toán hệ thống (Audit Logs)', category: 'Quản trị hệ thống', href: '/dashboard/admin/audit-logs', icon: <History className="w-4 h-4" />, roles: ['ADMIN'] },
    { id: 'adm-dict', title: 'Từ điển & danh mục tiện nghi, loại phòng', category: 'Quản trị hệ thống', href: '/dashboard/admin/dictionaries', icon: <FolderTree className="w-4 h-4" />, roles: ['ADMIN'] },
    { id: 'adm-settings', title: 'Cấu hình thông số toàn sàn', category: 'Quản trị hệ thống', href: '/dashboard/admin/settings', icon: <Sliders className="w-4 h-4" />, roles: ['ADMIN'] },

    // Landlord
    { id: 'll-ov', title: 'Bảng điều khiển chủ trọ', category: 'Chủ trọ', href: '/dashboard/landlord', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['LANDLORD'] },
    { id: 'll-rooms', title: 'Quản lý danh sách phòng cho thuê', category: 'Chủ trọ', href: '/dashboard/landlord/rooms', icon: <Building className="w-4 h-4" />, roles: ['LANDLORD'] },
    { id: 'll-new-room', title: 'Đăng tin phòng trọ mới', category: 'Chủ trọ', href: '/dashboard/landlord/rooms/new', icon: <Building className="w-4 h-4" />, roles: ['LANDLORD'] },
    { id: 'll-invoices', title: 'Lập & quản lý hóa đơn tiền phòng', category: 'Chủ trọ', href: '/dashboard/landlord/invoices', icon: <CreditCard className="w-4 h-4" />, roles: ['LANDLORD'] },
    { id: 'll-maint', title: 'Xử lý báo hỏng & sửa chữa phòng trọ', category: 'Chủ trọ', href: '/dashboard/landlord/maintenance', icon: <Wrench className="w-4 h-4" />, roles: ['LANDLORD'] },
    { id: 'll-contracts', title: 'Quản lý hợp đồng cho thuê', category: 'Chủ trọ', href: '/dashboard/landlord/contracts', icon: <FileText className="w-4 h-4" />, roles: ['LANDLORD'] },

    // Tenant
    { id: 'tn-ov', title: 'Bảng điều khiển người thuê', category: 'Người thuê', href: '/dashboard/tenant', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['TENANT'] },
    { id: 'tn-my-room', title: 'Phòng đang thuê & nội quy', category: 'Người thuê', href: '/dashboard/tenant/my-room', icon: <Building className="w-4 h-4" />, roles: ['TENANT'] },
    { id: 'tn-invoices', title: 'Hóa đơn tiền nhà hàng tháng', category: 'Người thuê', href: '/dashboard/tenant/invoices', icon: <CreditCard className="w-4 h-4" />, roles: ['TENANT'] },
    { id: 'tn-maint', title: 'Báo sự cố thiết bị cần sửa chữa', category: 'Người thuê', href: '/dashboard/tenant/maintenance', icon: <Wrench className="w-4 h-4" />, roles: ['TENANT'] },
    { id: 'tn-contracts', title: 'Hợp đồng thuê phòng của tôi', category: 'Người thuê', href: '/dashboard/tenant/contracts', icon: <FileText className="w-4 h-4" />, roles: ['TENANT'] },
  ];

  // Filter commands by user roles
  const filteredCommands = allCommands.filter((cmd) => {
    if (!cmd.roles) return true;
    return cmd.roles.some((r) => user?.roles?.includes(r as any));
  }).filter((cmd) => {
    if (!query) return true;
    return cmd.title.toLowerCase().includes(query.toLowerCase()) || cmd.category.toLowerCase().includes(query.toLowerCase());
  });

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tìm kiếm tác vụ nhanh (Command Palette)"
      description="Nhập từ khóa để điều hướng nhanh đến trang tính năng tương ứng"
      size="md"
    >
      <div className="space-y-4 pt-1">
        <Input
          placeholder="Nhập tên trang hoặc thao tác... (VD: Duyệt phòng, Hợp đồng, Hóa đơn)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          autoFocus
        />

        <div className="max-h-72 overflow-y-auto divide-y divide-border/60 rounded-xl border border-border">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs text-foreground-muted">
              Không tìm thấy lệnh hoặc trang phù hợp với "{query}"
            </div>
          ) : (
            filteredCommands.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="w-full p-3 text-left flex items-center justify-between gap-3 hover:bg-surface-muted transition text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-surface-muted group-hover:bg-teal-50 dark:group-hover:bg-teal-950/60 text-foreground-muted group-hover:text-teal-700 transition">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-foreground truncate">{item.title}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-muted shrink-0">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}
