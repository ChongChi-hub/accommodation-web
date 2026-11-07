'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import {
  Users,
  Building,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Trung tâm Điều hành & Quản trị Hệ thống
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Quản lý kiểm duyệt nội dung, định danh người dùng và an toàn vận hành sàn.
          </p>
        </div>
        <Badge variant="primary" size="md">
          {user?.roles?.includes('ADMIN') ? 'Quản trị viên cấp cao' : 'Kiểm duyệt viên'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartCard
          title="Tổng người dùng hoạt động"
          value="4.850"
          change="+15.2%"
          isPositive={true}
          description="Người thuê & Chủ trọ đã KYC"
          dataPoints={[3200, 3500, 3800, 4100, 4400, 4600, 4850]}
        />

        <ChartCard
          title="Phòng trọ đang niêm yết"
          value="1.240"
          change="+8.4%"
          isPositive={true}
          description="Tại Hà Nội, TP.HCM & Đà Nẵng"
          dataPoints={[800, 920, 1010, 1080, 1150, 1200, 1240]}
        />

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">Phòng trọ chờ duyệt</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">8 tin</span>
              <Badge variant="warning" size="sm">Cần xử lý</Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Thời gian xử lý trung bình: 18 phút</p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link href="/dashboard/admin/rooms" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              Duyệt tin đăng <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">Hồ sơ eKYC chờ thẩm định</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">5 hồ sơ</span>
              <Badge variant="warning" size="sm">Chờ xác thực</Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Xác minh CCCD 2 mặt</p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link href="/dashboard/admin/kyc" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              Thẩm định CCCD <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Báo cáo vi phạm gần đây
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">Báo cáo phòng ảo ngõ 105 Láng Hạ</p>
                <p className="text-stone-400 text-[11px]">Người báo cáo: Nguyễn Văn Thuê • 1 giờ trước</p>
              </div>
              <Link href="/dashboard/admin/reports">
                <Button variant="outline" size="sm">Xử lý</Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tình trạng sức khỏe hệ thống
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500">API Gateway</span>
              <span className="font-bold text-emerald-600">Hoạt động bình thường (Cổng 8080)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500">Identity Service</span>
              <span className="font-bold text-emerald-600">Hoạt động bình thường (Cổng 8081)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Listing Service</span>
              <span className="font-bold text-emerald-600">Hoạt động bình thường (Cổng 8082)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
