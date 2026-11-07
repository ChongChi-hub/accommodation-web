'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { FileUpload } from '@/presentation/components/ui/FileUpload';
import { toast } from '@/presentation/stores/toast.store';
import { ShieldCheck, CheckCircle2, Send } from 'lucide-react';

export default function LandlordKycPage() {
  const [idNumber, setIdNumber] = useState('001085004321');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsVerified(true);
      toast.success('Hồ sơ định danh chủ trọ đã được cập nhật thành công!');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Xác thực chủ nhà trọ uy tín
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Xác minh CCCD và giấy tờ nhà đất để nhận huy hiệu Chủ trọ xác thực 100%.
          </p>
        </div>
        {isVerified && (
          <Badge variant="success" size="md">
            <ShieldCheck className="w-4 h-4" /> Đã xác thực CCCD
          </Badge>
        )}
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Số Căn cước công dân của chủ nhà (12 số)"
            required
            maxLength={12}
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileUpload
              label="Mặt trước CCCD"
              accept="image/*"
              onFilesSelected={() => toast.info('Đã tải ảnh mặt trước CCCD')}
            />
            <FileUpload
              label="Mặt sau CCCD"
              accept="image/*"
              onFilesSelected={() => toast.info('Đã tải ảnh mặt sau CCCD')}
            />
          </div>

          <FileUpload
            label="Giấy chứng nhận quyền sử dụng đất / Giấy phép kinh doanh (Tùy chọn)"
            accept="image/*,application/pdf"
            onFilesSelected={() => toast.info('Đã nhận giấy tờ sở hữu bất động sản')}
          />

          <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Cập nhật hồ sơ KYC
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

