'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { toast } from '@/presentation/stores/toast.store';
import { container } from '@/infrastructure/di/container';
import { KeyRound, ShieldAlert, Eye, EyeOff, Mail, CheckCircle2 } from 'lucide-react';

export function UserChangePasswordView() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    if (otpCooldown > 0) return;
    setIsSendingOtp(true);
    try {
      await container.profile.profileUseCases.sendChangePasswordOtp();
      toast.success('Mã OTP xác thực 6 số đã được gửi đến email của bạn.');
      setOtpCooldown(60);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi mã OTP qua email.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const calculateStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(newPassword);
  const strengthLabels = [
    t('passwordStrengthWeak'),
    t('passwordStrengthWeak'),
    t('passwordStrengthFair'),
    t('passwordStrengthGood'),
    t('passwordStrengthStrong'),
  ];
  const strengthColors = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-primary', 'bg-success'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t('passwordMismatch'));
      return;
    }
    if (!otp || otp.trim().length !== 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số mã OTP xác nhận từ email.');
      return;
    }
    setIsSubmitting(true);
    try {
      await container.profile.profileUseCases.changePassword(currentPassword, newPassword, confirmPassword, otp);
      toast.success(t('changePasswordSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setOtpCooldown(0);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi đổi mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 border border-border">
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div className="p-3.5 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span>{tAuto('k0540')}{' '}</span>
            <Link href="/forgot-password" className="font-semibold underline hover:text-teal-900 dark:hover:text-teal-100">
              {tAuto('k0541')}
            </Link>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-warning/10 border border-warning/20 flex gap-3 text-xs text-warning-foreground">
          <ShieldAlert className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p>{t('passwordSessionNotice')}</p>
        </div>

        <div className="relative">
          <Input
            label={t('currentPassword')}
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('currentPasswordPlaceholder')}
            required
            leftIcon={<KeyRound className="w-4 h-4 text-foreground-muted" />}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-foreground-muted hover:text-foreground"
            onClick={() => setShowCurrent(!showCurrent)}
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label={t('newPassword')}
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('newPasswordPlaceholder')}
            required
            leftIcon={<KeyRound className="w-4 h-4 text-foreground-muted" />}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-foreground-muted hover:text-foreground"
            onClick={() => setShowNew(!showNew)}
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {newPassword && (
          <div className="space-y-1.5">
            <div className="flex gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 rounded-full transition-colors ${
                    strength >= step ? strengthColors[strength] : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-foreground-muted font-medium">
              {strengthLabels[strength]}
            </p>
          </div>
        )}

        <Input
          label={t('confirmNewPassword')}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t('confirmNewPasswordPlaceholder')}
          required
          leftIcon={<KeyRound className="w-4 h-4 text-foreground-muted" />}
        />

        {/* OTP Verification Section */}
        <div className="p-4 rounded-xl border border-primary-200/60 dark:border-primary-900/40 bg-primary-50/30 dark:bg-primary-950/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Mã xác thực OTP qua Email</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendOtp}
              isLoading={isSendingOtp}
              disabled={otpCooldown > 0 || isSendingOtp}
            >
              {otpCooldown > 0 ? `Gửi lại (${otpCooldown}s)` : 'Gửi mã OTP qua email'}
            </Button>
          </div>

          <Input
            label="Nhập mã 6 chữ số từ email"
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="Ví dụ: 123456"
            required
            leftIcon={<CheckCircle2 className="w-4 h-4 text-foreground-muted" />}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!currentPassword || !newPassword || !confirmPassword || otp.trim().length !== 6}
          >
            {t('saveChanges')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
