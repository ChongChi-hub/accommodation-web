'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { Card } from '@/presentation/components/ui/Card';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Badge } from '@/presentation/components/ui/Badge';
import { toast } from '@/presentation/stores/toast.store';
import { User as UserIcon, Mail, Phone, Save, ShieldCheck, Calendar } from 'lucide-react';

export interface UserProfileViewProps {
  role: 'TENANT' | 'LANDLORD' | 'ADMIN' | 'MODERATOR';
}

export function UserProfileView({ role }: UserProfileViewProps) {
  const { user, initSession } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const getRoleTitle = () => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên cấp cao';
      case 'MODERATOR':
        return 'Kiểm duyệt viên nội dung & an toàn';
      case 'LANDLORD':
        return 'Chủ nhà trọ / Người cho thuê';
      case 'TENANT':
        return 'Khách thuê phòng được định danh';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error('Họ tên và số điện thoại không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await container.auth.authRepository.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      useAuthStore.setState({ user: updatedUser });
      toast.success('Cập nhật hồ sơ cá nhân thành công!');
    } catch {
      toast.error('Không thể cập nhật hồ sơ, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Hồ sơ cá nhân
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Quản lý thông tin định danh, số điện thoại và email liên hệ trên Tổ Ấm.
        </p>
      </div>

      <Card className="p-6 border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-border">
            <Avatar name={fullName || 'Người dùng'} size="xl" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-foreground">{fullName || 'Chưa đặt tên'}</p>
                <Badge variant={role === 'ADMIN' ? 'danger' : role === 'MODERATOR' ? 'warning' : 'primary'}>
                  {getRoleTitle()}
                </Badge>
              </div>
              <p className="text-xs text-foreground-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Trạng thái định danh: Đã xác minh CCCD/CMND</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              leftIcon={<UserIcon className="w-4 h-4 text-foreground-muted" />}
            />
            <Input
              label="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0987654321"
              required
              leftIcon={<Phone className="w-4 h-4 text-foreground-muted" />}
            />
          </div>

          <Input
            label="Địa chỉ Email"
            type="email"
            value={email}
            disabled
            helperText="Email dùng để đăng nhập và nhận thông báo hợp đồng quan trọng"
            leftIcon={<Mail className="w-4 h-4 text-foreground-muted" />}
          />

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div className="text-[11px] text-foreground-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tham gia: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '2026'}</span>
            </div>

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

