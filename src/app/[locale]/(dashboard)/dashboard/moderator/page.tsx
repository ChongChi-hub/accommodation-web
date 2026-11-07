'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function ModeratorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-teal-700 dark:text-teal-400" />
          Bảng điều khiển kiểm duyệt viên
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Giám sát và kiểm duyệt tin đăng phòng trọ, xác minh danh tính và xử lý báo cáo vi phạm.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Chờ duyệt tin đăng</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">8</p>
          <p className="text-xs text-stone-400">Tin đăng phòng mới cần rà soát PCCC</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Hồ sơ KYC chờ duyệt</span>
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">5</p>
          <p className="text-xs text-stone-400">CCCD chủ trọ và người thuê mới</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Báo cáo vi phạm</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">2</p>
          <p className="text-xs text-stone-400">Khiếu nại giá hoặc thông tin ảo</p>
        </Card>
      </div>
    </div>
  );
}

