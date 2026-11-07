'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { BarChart3, TrendingUp, Users, MapPin } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Thống kê & Đo lường nền tảng
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Báo cáo tốc độ tăng trưởng, tỷ lệ khớp phòng thành công và phân bổ theo khu vực.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ChartCard
          title="Tỷ lệ thuê thành công sau khi xem phòng"
          value="74.5%"
          change="+6.2%"
          isPositive={true}
          description="Khách ký HĐ sau khi xem"
          dataPoints={[60, 65, 68, 70, 71, 73, 75]}
        />
        <ChartCard
          title="Thời gian trung bình để lấp đầy phòng"
          value="4.2 ngày"
          change="-1.5 ngày"
          isPositive={true}
          description="Rút ngắn thời gian phòng trống"
          dataPoints={[9, 8, 7, 6, 5, 5, 4]}
        />
        <ChartCard
          title="Tổng lượt tìm kiếm phòng / tháng"
          value="128.000"
          change="+24.8%"
          isPositive={true}
          description="Lưu lượng từ Hà Nội và TP.HCM"
          dataPoints={[80, 88, 95, 102, 110, 120, 128]}
        />
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          Top khu vực có nhu cầu tìm phòng cao nhất
        </h2>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between py-1">
              <span className="font-semibold text-stone-800 dark:text-stone-200">1. Cầu Giấy, Hà Nội</span>
              <span className="font-bold text-teal-700">38% tổng lượt tìm kiếm</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-700 h-full rounded-full" style={{ width: '38%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between py-1">
              <span className="font-semibold text-stone-800 dark:text-stone-200">2. Đống Đa, Hà Nội</span>
              <span className="font-bold text-teal-700">24% tổng lượt tìm kiếm</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-700 h-full rounded-full" style={{ width: '24%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between py-1">
              <span className="font-semibold text-stone-800 dark:text-stone-200">3. Bình Thạnh, TP.HCM</span>
              <span className="font-bold text-teal-700">19% tổng lượt tìm kiếm</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-700 h-full rounded-full" style={{ width: '19%' }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
