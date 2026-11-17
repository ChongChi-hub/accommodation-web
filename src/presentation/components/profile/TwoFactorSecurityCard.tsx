'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { toast } from '@/presentation/stores/toast.store';
import { useTwoFactorAuth } from '@/presentation/hooks/useTwoFactorAuth';
import { ShieldCheck, ShieldAlert, Key, Copy, Check } from 'lucide-react';

export function TwoFactorSecurityCard() {
  const { isEnabled, isLoading, setupMutation, verifyMutation, disableMutation } = useTwoFactorAuth();

  const [isSettingUp, setIsSettingUp] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleStartSetup = async () => {
    try {
      await setupMutation.mutateAsync();
      setIsSettingUp(true);
      setVerifyCode('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể khởi tạo 2FA');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      toast.error('Vui lòng nhập mã xác thực 6 chữ số');
      return;
    }
    try {
      await verifyMutation.mutateAsync(verifyCode.trim());
      toast.success('Kích hoạt xác thực 2 lớp thành công');
      setIsSettingUp(false);
      setVerifyCode('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mã xác thực không chính xác');
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCode.trim()) {
      toast.error('Vui lòng nhập mã TOTP hoặc mã dự phòng');
      return;
    }
    try {
      await disableMutation.mutateAsync(disableCode.trim());
      toast.success('Đã vô hiệu hóa bảo mật 2 lớp');
      setIsDisabling(false);
      setDisableCode('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mã xác thực không hợp lệ');
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'codes') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
    toast.success('Đã sao chép vào bộ nhớ tạm');
  };

  const setupData = setupMutation.data;

  return (
    <Card className="p-6 border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isEnabled ? 'bg-success/10 text-success' : 'bg-foreground-muted/10 text-foreground-muted'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">Xác thực hai lớp (2FA TOTP)</h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Bảo vệ tài khoản bằng Google Authenticator hoặc ứng dụng TOTP tương thích.
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          isEnabled ? 'bg-success/15 text-success' : 'bg-foreground-muted/15 text-foreground-muted'
        }`}>
          {isEnabled ? 'Đang bật' : 'Chưa kích hoạt'}
        </span>
      </div>

      {!isEnabled && !isSettingUp && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-primary-50/50 dark:bg-primary-950/20 border border-primary/20 text-xs text-foreground-muted">
            Bật xác thực 2 lớp là tùy chọn giúp tăng cường bảo mật cho tài khoản của bạn. Khi tắt, bạn có thể đăng nhập bình thường bằng mật khẩu mà không cần nhập mã.
          </div>
          <Button onClick={handleStartSetup} isLoading={setupMutation.isPending || isLoading}>
            <Key className="w-4 h-4 mr-2" />
            Bật bảo mật 2 lớp
          </Button>
        </div>
      )}

      {!isEnabled && isSettingUp && setupData && (
        <div className="space-y-5 border-t border-border pt-4">
          <div className="space-y-4 max-w-xl">
            <div className="p-3.5 rounded-lg bg-background-subtle border border-border space-y-2">
              <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Key className="w-4 h-4 text-primary" />
                1. Khóa bí mật Google Authenticator (Base32)
              </p>
              <p className="text-xs text-foreground-muted">
                Thêm khóa bí mật vào Google Authenticator (chọn <strong>Nhập khóa thiết lập</strong> / <strong>Enter a setup key</strong>):
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold bg-background px-3 py-2 rounded-lg border border-border flex-1 select-all break-all tracking-wider text-primary">
                  {setupData.secret}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(setupData.secret, 'secret')}
                >
                  {copiedSecret ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-foreground">2. Mã khôi phục dự phòng (8 mã)</p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'codes')}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  {copiedCodes ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  Sao chép tất cả
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-background rounded-lg border border-border">
                {setupData.backupCodes.map((code, idx) => (
                  <code key={idx} className="text-xs font-mono text-foreground-muted select-all text-center py-1 bg-background-subtle rounded border border-border/50">
                    {code}
                  </code>
                ))}
              </div>
              <p className="text-[11px] text-warning mt-1.5">Lưu lại các mã trên ở nơi an toàn để dùng khi mất thiết bị.</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-3 pt-2">
              <Input
                label="3. Nhập mã xác thực 6 chữ số để hoàn tất"
                placeholder="VD: 123456"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
              <div className="flex items-center gap-2">
                <Button type="submit" isLoading={verifyMutation.isPending}>
                  Xác nhận &amp; Kích hoạt
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsSettingUp(false)}>
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEnabled && !isDisabling && (
        <div className="space-y-4">
          <p className="text-xs text-foreground-muted">
            Tài khoản của bạn đã được bảo vệ bởi mã TOTP. Mã xác thực sẽ được yêu cầu khi đăng nhập hoặc thực hiện các giao dịch quan trọng.
          </p>
          <Button variant="outline" onClick={() => setIsDisabling(true)}>
            Vô hiệu hóa 2FA
          </Button>
        </div>
      )}

      {isEnabled && isDisabling && (
        <form onSubmit={handleDisable} className="space-y-3 max-w-sm border-t border-border pt-4">
          <div className="flex items-center gap-2 text-warning text-xs mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Nhập mã TOTP hiện tại hoặc mã dự phòng để xác nhận tắt 2FA</span>
          </div>
          <Input
            label="Mã xác thực TOTP / Dự phòng"
            placeholder="6 hoặc 8 chữ số"
            maxLength={8}
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/[^0-9]/g, ''))}
            required
          />
          <div className="flex items-center gap-2">
            <Button type="submit" variant="danger" isLoading={disableMutation.isPending}>
              Xác nhận tắt
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsDisabling(false)}>
              Hủy
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
