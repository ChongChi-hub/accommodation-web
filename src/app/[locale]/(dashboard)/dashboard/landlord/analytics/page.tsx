'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function LandlordAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Doanh thu & Báo cáo tài chính
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Theo dõi dòng tiền, tỉ lệ lấp đầy phòng và tăng trưởng doanh thu qua từng tháng.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ChartCard
          title="Tổng doanh thu năm 2026"
          value="268.400.000 đ"
          change="+18.4%"
          isPositive={true}
          description="Tăng so với cùng kỳ năm 2025"
          dataPoints={[20, 22, 23, 24, 25, 26, 28]}
        />
        <ChartCard
          title="Tỉ lệ thanh toán đúng hạn"
          value="96.2%"
          change="+3.1%"
          isPositive={true}
          description="Khách thanh toán trước ngày 15"
          dataPoints={[90, 92, 94, 91, 95, 96, 96]}
        />
        <ChartCard
          title="Doanh thu dịch vụ (điện nước)"
          value="32.800.000 đ"
          change="+5.0%"
          isPositive={true}
          description="Thu đúng biểu phí niêm yết"
          dataPoints={[10, 12, 11, 13, 14, 15, 16]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Cơ cấu nguồn thu tháng 11/2026</h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between py-1">
                <span className="text-stone-600 dark:text-stone-300">Tiền thuê phòng nguyên bản</span>
                <span className="font-bold text-teal-800 dark:text-teal-400">82% (20.090.000 đ)</span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-700 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between py-1">
                <span className="text-stone-600 dark:text-stone-300">Tiền điện theo chỉ số</span>
                <span className="font-bold text-amber-600">11% (2.695.000 đ)</span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '11%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between py-1">
                <span className="text-stone-600 dark:text-stone-300">Nước sinh hoạt & Internet & Rác</span>
                <span className="font-bold text-cyan-600">7% (1.715.000 đ)</span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '7%' }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Dự báo dòng tiền tháng 12</h2>
          <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl space-y-2 text-xs text-teal-900 dark:text-teal-300">
            <p className="font-bold text-sm">Dự kiến thu: 25.200.000 đ</p>
            <p className="leading-relaxed">
              Tất cả các phòng đang có hợp đồng hoạt động ổn định. Không có hợp đồng nào hết hạn trong tháng 12/2026.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
