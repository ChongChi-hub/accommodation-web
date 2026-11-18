'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { sendVerifyEmailOtpEmail } from '@/infrastructure/services/emailjs.service';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import { APP_ROUTES } from '@/shared/routes';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

export function EmailVerificationCard() {
  const { user, refreshMe } = useAuthStore();
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const isVerified = Boolean(user?.emailVerified);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!user?.email || cooldown > 0 || isSending) return;
    setErrorMsg(null);
    setIsSending(true);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);

    try {
      const res = await sendVerifyEmailOtpEmail({
        toName: user.fullName || 'Quý khách',
        toEmail: user.email,
        otpCode: otp,
        expiryMinutes: 10,
      });

      if (res.success) {
        setOtpSent(true);
        setCooldown(60);
        toast.success(`Đã gửi mã xác nhận 6 số đến ${user.email}`);
      } else {
        setErrorMsg(res.error || 'Không thể gửi email. Vui lòng kiểm tra lại dịch vụ EmailJS.');
        toast.error('Gửi email thất bại');
      }
    } catch {
      setErrorMsg('Lỗi gửi email xác nhận. Vui lòng thử lại sau.');
      toast.error('Lỗi gửi email');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanOtp = enteredOtp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã xác thực.');
      return;
    }

    if (cleanOtp !== generatedOtp) {
      setErrorMsg('Mã xác thực không chính xác. Vui lòng kiểm tra lại hòm thư.');
      return;
    }

    setIsVerifying(true);
    try {
      if (container.auth.authRepository.verifyMyEmail) {
        await container.auth.authRepository.verifyMyEmail();
      }
      await refreshMe();
      toast.success('Xác minh email thành công! Bạn đã đủ điều kiện trở thành chủ trọ.');
      setOtpSent(false);
      setEnteredOtp('');
      setGeneratedOtp(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xác minh email thất bại';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
      <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
              isVerified
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            )}
          >
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Xác minh địa chỉ Email
              </h2>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã xác minh
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Chưa xác minh
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Email tài khoản: <strong className="text-stone-700 dark:text-stone-300 font-mono">{user?.email || 'Chưa cập nhật'}</strong>
            </p>
          </div>
        </div>

        {isVerified && (
          <Link
            href={APP_ROUTES.becomeLandlord}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <span>Trở thành chủ trọ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {isVerified ? (
        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Email của bạn đã được xác minh. Bạn đã đáp ứng điều kiện tiên quyết để nộp hồ sơ xin làm chủ trọ trên Tổ Ấm.
          </span>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Để đảm bảo an toàn giao dịch và tuân thủ chính sách kiểm duyệt, bạn cần xác minh địa chỉ email chính chủ trước khi có thể nộp hồ sơ <strong>Trở thành chủ trọ</strong>.
          </p>

          {!otpSent ? (
            <div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isSending || cooldown > 0}
                onClick={handleSendOtp}
                className="gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi mã...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Gửi mã xác nhận qua Email</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Nhập mã OTP 6 số đã được gửi đến email:
                </label>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-44 px-3.5 py-2 text-center text-lg font-mono tracking-widest rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={enteredOtp.trim().length !== 6 || isVerifying}
                    className="gap-1.5"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang kiểm tra...</span>
                      </>
                    ) : (
                      <span>Xác minh</span>
                    )}
                  </Button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errorMsg}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1 text-xs text-stone-500">
                <span>Chưa nhận được mã?</span>
                <button
                  type="button"
                  disabled={cooldown > 0 || isSending}
                  onClick={handleSendOtp}
                  className="font-semibold text-teal-600 hover:text-teal-700 disabled:text-stone-400 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  <RefreshCw className={cn('w-3 h-3', isSending && 'animate-spin')} />
                  <span>{cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại mã'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </Card>
  );
}
