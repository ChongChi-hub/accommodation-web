'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { MailCheck, RotateCw, ArrowRight } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { toast } from '@/presentation/stores/toast.store';
import Image from 'next/image';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || 'bạn';

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Xác thực địa chỉ email thành công! Đang chuyển đến Đăng nhập.');
      router.push('/login');
    }, 600);
  };

  const handleResend = () => {
    toast.info('Đã gửi lại mã OTP vào hộp thư đến của bạn!');
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl bg-white dark:bg-stone-900 p-8 shadow-xl border border-stone-200/80 dark:border-stone-800 text-center">
      <Link href="/" className="inline-block mb-1">
        <Image src="/logo.svg" alt="Tổ Ấm" width={130} height={30} style={{ width: 'auto', height: 'auto' }} priority />
      </Link>

      <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400">
        <MailCheck className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Xác thực tài khoản</h1>
        <p className="text-xs text-stone-500">
          Vui lòng nhập mã kích hoạt gồm 6 chữ số gửi tới email{' '}
          <span className="font-semibold text-stone-800 dark:text-stone-200">{emailParam}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          required
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Mã OTP 6 số"
          className="text-center text-lg tracking-widest font-mono"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Kích hoạt tài khoản
        </Button>
      </form>

      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
        <span>Chưa nhận được mã?</span>
        <button
          type="button"
          onClick={handleResend}
          className="text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCw className="w-3 h-3" /> Gửi lại mã
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-stone-400">Đang tải...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
