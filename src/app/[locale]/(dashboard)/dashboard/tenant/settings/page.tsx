'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { Bell, Lock, Globe, Shield, Save } from 'lucide-react';

export default function TenantSettingsPage() {
  const [emailNotify, setEmailNotify] = useState(true);
  const [smsNotify, setSmsNotify] = useState(true);
  const [appNotify, setAppNotify] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Cập nhật cài đặt tài khoản thành công!');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Cài đặt tài khoản
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Tùy chỉnh thông báo, bảo mật và quyền riêng tư trên Tổ Ấm.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-700" /> Tùy chọn thông báo
          </h2>
          <div className="space-y-3 pt-3 text-xs">
            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer">
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">Thông báo hóa đơn tiền phòng</p>
                <p className="text-stone-400 text-[11px]">Nhắc nhở hạn chót thanh toán và chốt điện nước</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer">
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">Thông báo lịch hẹn xem phòng</p>
                <p className="text-stone-400 text-[11px]">Nhận SMS và chuông khi chủ nhà xác nhận lịch</p>
              </div>
              <input
                type="checkbox"
                checked={smsNotify}
                onChange={(e) => setSmsNotify(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-700" /> Bảo mật 2 lớp & Đăng nhập
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Bảo vệ tài khoản bằng mã OTP xác thực qua số điện thoại mỗi khi thực hiện ký hợp đồng.
          </p>
        </div>

        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSave}
          >
            Lưu cài đặt
          </Button>
        </div>
      </Card>
    </div>
  );
}

