'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { toast } from '@/presentation/stores/toast.store';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn!');
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    }, 600);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white dark:bg-stone-900 p-8 shadow-xl border border-stone-200/80 dark:border-stone-800">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-2">
            <Image src="/logo.svg" alt="Tổ Ấm" width={130} height={30} />
          </Link>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Quên mật khẩu?</h1>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Nhập địa chỉ email đăng ký để nhận mã OTP thiết lập mật khẩu mới.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Địa chỉ Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Gửi mã xác thực OTP
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100 dark:border-stone-800">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

