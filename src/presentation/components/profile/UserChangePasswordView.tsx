'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { toast } from '@/presentation/stores/toast.store';
import { container } from '@/infrastructure/di/container';
import { KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export function UserChangePasswordView() {
  const t = useTranslations('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      await container.profile.profileUseCases.changePassword(currentPassword, newPassword, confirmPassword);
      toast.success(t('changePasswordSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error changing password');
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
            <span>Bạn đăng nhập bằng tài khoản Google và chưa có mật khẩu riêng? </span>
            <Link href="/forgot-password" className="font-semibold underline hover:text-teal-900 dark:hover:text-teal-100">
              Dùng Quên mật khẩu để đặt mật khẩu
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

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            {t('saveChanges')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
