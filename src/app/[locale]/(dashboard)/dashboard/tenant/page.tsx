'use client';

import React from 'react';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import {
  FileText,
  CreditCard,
  Calendar,
  Search,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';

export default function TenantOverviewPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Chào mừng trở lại, {user?.fullName || 'Bạn'}!
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Quản lý hợp đồng, hóa đơn và các lịch hẹn thuê phòng của bạn.
          </p>
        </div>
        <Link href="/rooms">
          <Button variant="primary" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
            Tìm phòng mới
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2 border-teal-700/20 bg-teal-50/40 dark:bg-teal-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Hợp đồng hiện tại</span>
            <Badge variant="success" size="sm">Đang thuê</Badge>
          </div>
          <p className="text-base font-bold text-stone-900 dark:text-stone-100">
            HĐ-2026-0042
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Phòng 302, Tòa nhà Dịch Vọng Hậu, Cầu Giấy
          </p>
          <div className="pt-2">
            <Link href="/dashboard/tenant/contracts/1" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              Xem chi tiết hợp đồng <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Hóa đơn cần thanh toán</span>
            <Badge variant="warning" size="sm">Chờ thanh toán</Badge>
          </div>
          <p className="text-base font-bold text-stone-900 dark:text-stone-100">
            5.280.000 đ
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Kỳ tháng 11/2026 • Hạn: 15/11/2026
          </p>
          <div className="pt-2">
            <Link href="/dashboard/tenant/invoices/1" className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1">
              Thanh toán ngay <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Lịch hẹn xem phòng</span>
            <Badge variant="primary" size="sm">1 lịch hẹn</Badge>
          </div>
          <p className="text-base font-bold text-stone-900 dark:text-stone-100">
            09:30, Thứ Bảy (09/11)
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
            Studio Quan Hoa view công viên
          </p>
          <div className="pt-2">
            <Link href="/dashboard/tenant/appointments" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              Xem tất cả lịch hẹn <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Trạng thái an toàn tài khoản</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">Xác thực CCCD (KYC)</p>
              <p className="text-stone-500 text-[11px]">Hồ sơ đã được kiểm duyệt bởi Admin</p>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">Chữ ký điện tử</p>
              <p className="text-stone-500 text-[11px]">Đã kích hoạt phương thức ký OTP</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
