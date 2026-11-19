'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { UserBankAccount } from '@/domain/entities/BankAccount';
import { AlertTriangle, CheckCircle2, CreditCard } from 'lucide-react';

interface Props {
  bankAccount: UserBankAccount | null;
  role: 'TENANT' | 'LANDLORD';
}

export function MandatoryBankAccountBanner({ bankAccount, role }: Props) {
  const isValid = Boolean(bankAccount && bankAccount.accountNumber && bankAccount.qrCodeUrl);
  const href = role === 'LANDLORD' ? '/dashboard/landlord/bank-account' : '/dashboard/tenant/bank-account';

  if (isValid && bankAccount) {
    return (
      <Card className="p-3.5 border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Tài khoản ngân hàng &amp; Mã QR nhận tiền từ Sàn đã xác thực: <strong>{bankAccount.bankCode} - {bankAccount.accountNumber} ({bankAccount.accountHolder})</strong>
          </span>
        </div>
        <Link href={href} className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline">
          Cập nhật TK &amp; QR
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start gap-2.5 text-rose-900 dark:text-rose-200">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Bắt buộc cung cấp Số tài khoản ngân hàng &amp; Mã VietQR cá nhân</p>
          <p className="text-[11px] text-rose-800 dark:text-rose-300">
            {role === 'LANDLORD'
              ? 'Để Admin Sàn Tổ Ấm có thông tin chuyển tiền giải ngân cọc hoặc rút doanh thu cho bạn, việc cung cấp Số tài khoản ngân hàng và Mã QR là bắt buộc.'
              : 'Để Sàn Tổ Ấm có thông tin đối soát, bảo vệ cọc hoặc hoàn trả tiền cọc cho bạn, việc cung cấp Số tài khoản ngân hàng và Mã QR là bắt buộc.'}
          </p>
        </div>
      </div>
      <Link href={href} className="shrink-0">
        <Button variant="primary" size="sm" leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
          Cung cấp STK &amp; Mã QR ngay
        </Button>
      </Link>
    </Card>
  );
}

