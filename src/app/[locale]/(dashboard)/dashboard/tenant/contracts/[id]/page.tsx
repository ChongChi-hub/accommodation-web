'use client';
import { useTranslations } from 'next-intl';

import React, { use, useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { toast } from '@/presentation/stores/toast.store';
import { FileText, CheckCircle2, ShieldCheck, Download, PenTool } from 'lucide-react';

export default function TenantContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tAuto = useTranslations('autoI18n');
  const { id } = use(params);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(true);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setIsSigned(true);
      setIsSignModalOpen(false);
      toast.success('Ký hợp đồng điện tử thành công! File PDF đã được lưu trữ.');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb
        items={[
          { label: 'Hợp đồng', href: '/dashboard/tenant/contracts' },
          { label: 'HĐ-2026-0042' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {tAuto('k0267')}
            </h1>
            <Badge variant="success" size="md">
              <CheckCircle2 className="w-3.5 h-3.5" />{' '}{tAuto('k0268')}
            </Badge>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{tAuto('k0269')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => toast.info('Đang tải file PDF hợp đồng có chữ ký số...')}
          >
            {tAuto('k0270')}
          </Button>
          {!isSigned && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PenTool className="w-3.5 h-3.5" />}
              onClick={() => setIsSignModalOpen(true)}
            >
              {tAuto('k0271')}
            </Button>
          )}
        </div>
      </div>

      <Card className="p-8 space-y-6 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-serif bg-stone-50/30">
        <div className="text-center space-y-1 pb-4 border-b border-stone-200 dark:border-stone-800">
          <p className="font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
            {tAuto('k0272')}
          </p>
          <p className="italic">{tAuto('k0273')}</p>
          <h2 className="text-base font-bold uppercase tracking-wide text-stone-900 dark:text-stone-100 pt-3">
            {tAuto('k0274')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-stone-200 dark:border-stone-800 font-sans">
          <div className="space-y-1">
            <p className="font-bold text-stone-900 dark:text-stone-100">{tAuto('k0275')}</p>
            <p>{tAuto('k0276')}</p>
            <p>{tAuto('k0277')}</p>
            <p>{tAuto('k0278')}</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-stone-900 dark:text-stone-100">{tAuto('k0279')}</p>
            <p>{tAuto('k0280')}</p>
            <p>{tAuto('k0281')}</p>
            <p>{tAuto('k0282')}</p>
          </div>
        </div>

        <div className="space-y-3 font-sans text-xs">
          <p>
            <strong>{tAuto('k0283')}</strong>{' '}{tAuto('k0284')}
          </p>
          <p>
            <strong>{tAuto('k0285')}</strong>{' '}{tAuto('k0286')}
          </p>
          <p>
            <strong>{tAuto('k0287')}</strong>{' '}{tAuto('k0288')}
          </p>
          <p>
            <strong>{tAuto('k0289')}</strong>{' '}{tAuto('k0290')}
          </p>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex justify-around text-center font-sans">
          <div>
            <p className="font-bold text-stone-900 dark:text-stone-100">{tAuto('k0291')}</p>
            <p className="text-emerald-600 font-semibold text-[11px] mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />{' '}{tAuto('k0292')}
            </p>
            <p className="text-[10px] text-stone-400">{tAuto('k0293')}</p>
          </div>
          <div>
            <p className="font-bold text-stone-900 dark:text-stone-100">{tAuto('k0294')}</p>
            <p className="text-emerald-600 font-semibold text-[11px] mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />{' '}{tAuto('k0292')}
            </p>
            <p className="text-[10px] text-stone-400">{tAuto('k0295')}</p>
          </div>
        </div>
      </Card>

      <Dialog
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title="Ký xác nhận hợp đồng điện tử"
        description="Mã OTP đã được gửi về số điện thoại định danh của bạn."
      >
        <form onSubmit={handleSign} className="space-y-4 pt-2">
          <Input
            label="Nhập mã OTP 6 số"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSignModalOpen(false)}>
              {tAuto('k0126')}
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSigning}>
              {tAuto('k0296')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

