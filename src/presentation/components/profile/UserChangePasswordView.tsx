'use client';

import React, { useState } from 'react';
import { container } from '@/infrastructure/di/container';
import { Card } from '@/presentation/components/ui/Card';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { Lock, KeyRound, ShieldAlert, CheckCircle, Eye, EyeOff } from 'lucide-react';

export function UserChangePasswordView() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setIsSaving(true);
    try {
      await container.auth.authRepository.changePassword(oldPassword, newPassword);
      toast.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Mật khẩu cũ không chính xác hoặc có lỗi xảy ra.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Bảo mật & Đổi mật khẩu
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Thay đổi mật khẩu định kỳ giúp bảo vệ tài khoản của bạn khỏi rủi ro truy cập trái phép.
        </p>
      </div>

      <Card className="p-6 border border-border">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Input
              label="Mật khẩu hiện tại"
              type={showPass ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu đang dùng"
              required
              leftIcon={<KeyRound className="w-4 h-4 text-foreground-muted" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mật khẩu mới"
              type={showPass ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              leftIcon={<Lock className="w-4 h-4 text-foreground-muted" />}
            />

            <Input
              label="Xác nhận mật khẩu mới"
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              leftIcon={<Lock className="w-4 h-4 text-foreground-muted" />}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-foreground-muted hover:text-foreground flex items-center gap-1.5 cursor-pointer"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
            </button>
            <span className="text-foreground-muted text-[11px]">Nên kết hợp chữ cái và số</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-muted text-xs text-foreground-muted border border-border/80 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>
              Sau khi đổi mật khẩu thành công, các phiên làm việc trên các thiết bị khác sẽ được yêu cầu đăng nhập lại để đảm bảo an toàn.
            </span>
          </div>

          <div className="pt-2 border-t border-border flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
