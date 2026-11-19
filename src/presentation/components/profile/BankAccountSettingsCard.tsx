'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { container } from '@/infrastructure/di/container';
import { POPULAR_VIETNAM_BANKS, UserBankAccount } from '@/domain/entities/BankAccount';
import { toast } from '@/presentation/stores/toast.store';
import { CreditCard, QrCode, Save, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface Props {
  userRole?: 'TENANT' | 'LANDLORD' | 'ADMIN';
}

export function BankAccountSettingsCard({ userRole = 'TENANT' }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankAccount, setBankAccount] = useState<UserBankAccount | null>(null);

  const [bankCode, setBankCode] = useState('VCB');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [customQrUrl, setCustomQrUrl] = useState('');

  useEffect(() => {
    let active = true;
    container.bankAccount.bankAccountRepository
      .getMyBankAccount()
      .then((acc) => {
        if (!active) return;
        if (acc) {
          setBankAccount(acc);
          setBankCode(acc.bankCode || 'VCB');
          setAccountNumber(acc.accountNumber || '');
          setAccountHolder(acc.accountHolder || '');
          setCustomQrUrl(acc.qrCodeUrl || '');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedBank = POPULAR_VIETNAM_BANKS.find((b) => b.code === bankCode) || POPULAR_VIETNAM_BANKS[0];

  const previewQrUrl =
    accountNumber.trim() && accountHolder.trim()
      ? `https://img.vietqr.io/image/${bankCode}-${accountNumber.trim()}-compact.png?accountName=${encodeURIComponent(
          accountHolder.trim().toUpperCase()
        )}`
      : customQrUrl || null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountHolder.trim()) {
      toast.error('Vui lòng nhập đầy đủ số tài khoản và tên chủ tài khoản');
      return;
    }
    setSaving(true);
    try {
      const saved = await container.bankAccount.bankAccountRepository.saveMyBankAccount({
        bankCode,
        bankName: selectedBank.shortName,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim().toUpperCase(),
        qrCodeUrl: customQrUrl.trim() || previewQrUrl || undefined,
      });
      setBankAccount(saved);
      toast.success('Đã lưu thông tin tài khoản ngân hàng và mã QR thành công!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu thông tin tài khoản');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Tài khoản ngân hàng &amp; Mã QR nhận tiền
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {userRole === 'LANDLORD'
                ? 'Cung cấp số tài khoản và mã QR để Admin giải ngân tiền cọc khi đủ điều kiện bàn giao và dọn vào.'
                : 'Cung cấp số tài khoản và mã QR để Admin hoàn tiền cọc ký quỹ cho bạn khi hợp đồng kết thúc hoặc hủy.'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bảo mật 100%</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Ngân hàng thụ hưởng
            </label>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {POPULAR_VIETNAM_BANKS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.shortName} - {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Số tài khoản ngân hàng
            </label>
            <Input
              type="text"
              placeholder="VD: 1042701900"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Tên chủ tài khoản (Viết hoa không dấu, khớp tên KYC)
            </label>
            <Input
              type="text"
              placeholder="VD: NGUYEN VAN A"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-semibold">Lưu ý quan trọng:</p>
            <p className="text-[11px] leading-relaxed">
              Tên chủ tài khoản ngân hàng nên trùng khớp với tên hồ sơ định danh KYC để giao dịch giải ngân hoặc hoàn cọc
              được duyệt tự động và chính xác nhất.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={saving}
            disabled={loading || saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Lưu thông tin tài khoản &amp; QR
          </Button>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-dashed border-stone-200 dark:border-stone-700 text-center space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
            <QrCode className="w-4 h-4 text-teal-600" />
            <span>Mã VietQR nhận tiền tự động</span>
          </div>

          {previewQrUrl ? (
            <div className="p-3 bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col items-center">
              <img
                src={previewQrUrl}
                alt="VietQR Payout"
                className="w-48 h-48 object-contain rounded-lg"
              />
              <p className="text-[11px] font-semibold text-stone-800 mt-2">{selectedBank.shortName}</p>
              <p className="text-[11px] font-mono text-stone-600">{accountNumber}</p>
              <p className="text-[11px] font-bold text-teal-700">{accountHolder}</p>
            </div>
          ) : (
            <div className="w-48 h-48 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center text-stone-400 text-xs p-4">
              <QrCode className="w-12 h-12 stroke-1 mb-2 text-stone-300" />
              <span>Nhập số tài khoản và tên để xem trước mã QR</span>
            </div>
          )}

          <p className="text-[11px] text-stone-500 max-w-xs">
            Mã QR chuẩn Napas247 giúp Admin chỉ cần dùng app ngân hàng quét là chuyển tiền đúng số tiền và tài khoản.
          </p>
        </div>
      </form>
    </Card>
  );
}
