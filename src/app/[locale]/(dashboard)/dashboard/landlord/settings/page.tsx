'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { Building, CreditCard, Zap, Save } from 'lucide-react';

export default function LandlordSettingsPage() {
  const [bankName, setBankName] = useState('MB Bank - Ngân hàng Quân Đội');
  const [accountNumber, setAccountNumber] = useState('091234567899');
  const [accountHolder, setAccountHolder] = useState('TRAN MINH TUAN');
  const [defaultElec, setDefaultElec] = useState('3800');
  const [defaultWater, setDefaultWater] = useState('30000');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Đã lưu cấu hình tài khoản và biểu phí mặc định!');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Cài đặt & Tài khoản thanh toán
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Tài khoản nhận tiền phòng qua mã VietQR và biểu phí dịch vụ áp dụng tự động.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-700" /> Tài khoản ngân hàng nhận tiền
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ngân hàng thụ hưởng"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <Input
                label="Số tài khoản ngân hàng"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <Input
              label="Tên chủ tài khoản (in hoa không dấu)"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Biểu phí điện nước mặc định khi đăng phòng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Đơn giá điện (VNĐ/kWh)"
                type="number"
                value={defaultElec}
                onChange={(e) => setDefaultElec(e.target.value)}
              />
              <Input
                label="Đơn giá nước (VNĐ/khối)"
                type="number"
                value={defaultWater}
                onChange={(e) => setDefaultWater(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Lưu cấu hình
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
