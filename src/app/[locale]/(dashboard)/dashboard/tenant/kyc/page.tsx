'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { FileUpload } from '@/presentation/components/ui/FileUpload';
import { toast } from '@/presentation/stores/toast.store';
import { ShieldCheck, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export default function TenantKycPage() {
  const [idNumber, setIdNumber] = useState('001202012345');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsVerified(true);
      toast.success('Hồ sơ CCCD đã được gửi! Đội ngũ kiểm duyệt sẽ xử lý trong vòng 2-4 giờ.');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Xác minh danh tính (eKYC)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Xác thực Căn cước công dân để được ký hợp đồng điện tử và nhận bảo hiểm tiền cọc.
          </p>
        </div>
        {isVerified && (
          <Badge variant="success" size="md">
            <ShieldCheck className="w-4 h-4" /> Đã xác thực
          </Badge>
        )}
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Số Căn cước công dân (12 số)"
            required
            maxLength={12}
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="0012..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileUpload
              label="Ảnh mặt trước CCCD"
              accept="image/*"
              onFilesSelected={() => toast.info('Đã tải lên ảnh mặt trước CCCD')}
            />
            <FileUpload
              label="Ảnh mặt sau CCCD"
              accept="image/*"
              onFilesSelected={() => toast.info('Đã tải lên ảnh mặt sau CCCD')}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-700" />
            <p className="leading-relaxed">
              Thông tin CCCD của bạn được mã hóa an toàn theo tiêu chuẩn an ninh mạng quốc gia, chỉ dùng cho mục đích xác lập hợp đồng thuê trọ hợp pháp.
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Cập nhật hồ sơ xác minh
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

