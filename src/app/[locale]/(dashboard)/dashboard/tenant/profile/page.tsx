'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Card } from '@/presentation/components/ui/Card';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { toast } from '@/presentation/stores/toast.store';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';

export default function TenantProfilePage() {
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || 'Nguyễn Văn Thuê');
  const [email, setEmail] = useState(user?.email || 'tenant@toam.vn');
  const [phone, setPhone] = useState(user?.phone || '0987654321');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Cập nhật hồ sơ cá nhân thành công!');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Hồ sơ cá nhân
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Quản lý thông tin liên hệ và cài đặt tài khoản của bạn.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
            <Avatar name={fullName} size="xl" />
            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{fullName}</p>
              <p className="text-xs text-stone-500">Khách thuê phòng được định danh</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Địa chỉ Email"
            type="email"
            value={email}
            disabled
            helperText="Email được dùng để nhận hợp đồng và hóa đơn hàng tháng"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

