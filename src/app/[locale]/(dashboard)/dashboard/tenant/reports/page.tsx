'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Construction } from 'lucide-react';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Lịch sử báo cáo vi phạm</h1>
        <p className="text-xs text-foreground-muted mt-0.5">Theo dõi tiến trình xử lý các bài đăng hoặc tài khoản đã báo cáo.</p>
      </div>
      <Card className="p-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600">
          <Construction className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Mô-đun đang hoàn thiện</h2>
        <p className="text-xs text-foreground-muted max-w-md mx-auto">
          Tính năng này đang trong lộ trình phát triển của giai đoạn tiếp theo.
        </p>
      </Card>
    </div>
  );
}
