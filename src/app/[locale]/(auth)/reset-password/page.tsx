'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { toast } from '@/presentation/stores/toast.store';
import Image from 'next/image';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.');
      router.push('/login');
    }, 600);
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl bg-white dark:bg-stone-900 p-8 shadow-xl border border-stone-200/80 dark:border-stone-800">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block mb-2">
          <Image src="/logo.svg" alt="Tổ Ấm" width={130} height={30} />
        </Link>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Đặt lại mật khẩu</h1>
        <p className="text-xs text-stone-500">
          Mã OTP 6 số đã được gửi đến{' '}
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            {emailParam || 'email của bạn'}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Mã OTP xác thực (6 số)"
          required
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          leftIcon={<KeyRound className="w-4 h-4" />}
        />

        <Input
          label="Mật khẩu mới"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tối thiểu 6 ký tự"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          required
          error={error}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={isLoading}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          Lưu mật khẩu mới
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-stone-100 dark:border-stone-800">
        <Link href="/login" className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline">
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-stone-400">Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
