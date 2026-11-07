'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { Home, Search } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-2xl mb-4">
        404
      </div>
      <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
        Không tìm thấy trang yêu cầu
      </h1>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
        Trang bạn đang tìm kiếm có thể đã bị di chuyển, xóa hoặc đường dẫn không còn tồn tại.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link href="/">
          <Button size="sm" variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Trang chủ
          </Button>
        </Link>
        <Link href="/rooms">
          <Button size="sm" variant="outline" leftIcon={<Search className="w-4 h-4" />}>
            Tìm phòng trọ
          </Button>
        </Link>
      </div>
    </div>
  );
}
