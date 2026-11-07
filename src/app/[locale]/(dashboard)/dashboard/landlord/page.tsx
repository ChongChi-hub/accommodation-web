'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import {
  Building,
  PlusCircle,
  Calendar,
  CreditCard,
  Users,
  Gauge,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function LandlordOverviewPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Khu vực Chủ trọ - {user?.fullName || 'Trần Minh Tuấn'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Tổng quan tài chính, tình trạng lấp đầy phòng và các công việc cần xử lý hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/landlord/rooms/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              Đăng phòng mới
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartCard
          title="Doanh thu tháng 11/2026"
          value="24.500.000 đ"
          change="+12.5%"
          isPositive={true}
          description="Đã thu 85% tổng công nợ"
          dataPoints={[18, 20, 22, 21, 24, 23, 25]}
        />

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">Tỉ lệ lấp đầy phòng</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">5 / 6 phòng</span>
              <Badge variant="success" size="sm">83.3%</Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Còn 1 phòng trống đang đăng tin</p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link href="/dashboard/landlord/rooms" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              Quản lý danh sách phòng <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">Lịch hẹn khách xem phòng</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">2 lịch hẹn</span>
              <Badge variant="warning" size="sm">Chờ duyệt</Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Gần nhất: 09:30 Thứ Bảy (09/11)</p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link href="/dashboard/landlord/appointments" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              Xử lý lịch hẹn <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">Ghi chỉ số điện nước</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">Kỳ tháng 11</span>
              <Badge variant="primary" size="sm">Đến kỳ chốt</Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Hạn chốt chỉ số: Ngày 15 hàng tháng</p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link href="/dashboard/landlord/utilities" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              Nhập chỉ số công tơ <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" /> Việc cần xử lý khẩn cấp hôm nay
        </h2>
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                Nguyễn Văn Thuê gửi yêu cầu hẹn xem phòng Studio Quan Hoa
              </p>
              <p className="text-stone-400 text-[11px] mt-0.5">Thời gian đề xuất: 15:00 Thứ Ba tuần sau</p>
            </div>
            <Link href="/dashboard/landlord/appointments">
              <Button variant="outline" size="sm">Duyệt lịch hẹn</Button>
            </Link>
          </div>

          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                Lập hóa đơn tiền phòng tháng 11 cho Phòng 401
              </p>
              <p className="text-stone-400 text-[11px] mt-0.5">Đã có chỉ số điện nước, chờ gửi hóa đơn cho khách</p>
            </div>
            <Link href="/dashboard/landlord/invoices">
              <Button variant="primary" size="sm">Tạo hóa đơn</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
