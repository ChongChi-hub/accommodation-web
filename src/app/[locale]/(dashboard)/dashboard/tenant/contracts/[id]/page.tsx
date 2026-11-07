'use client';

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
              Hợp đồng thuê phòng số HĐ-2026-0042
            </h1>
            <Badge variant="success" size="md">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã ký số
            </Badge>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">Giá trị pháp lý theo Bộ luật Dân sự 2015</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => toast.info('Đang tải file PDF hợp đồng có chữ ký số...')}
          >
            Tải PDF
          </Button>
          {!isSigned && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PenTool className="w-3.5 h-3.5" />}
              onClick={() => setIsSignModalOpen(true)}
            >
              Ký điện tử
            </Button>
          )}
        </div>
      </div>

      <Card className="p-8 space-y-6 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-serif bg-stone-50/30">
        <div className="text-center space-y-1 pb-4 border-b border-stone-200 dark:border-stone-800">
          <p className="font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="italic">Độc lập - Tự do - Hạnh phúc</p>
          <h2 className="text-base font-bold uppercase tracking-wide text-stone-900 dark:text-stone-100 pt-3">
            HỢP ĐỒNG THUÊ PHÒNG TRỌ
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-stone-200 dark:border-stone-800 font-sans">
          <div className="space-y-1">
            <p className="font-bold text-stone-900 dark:text-stone-100">BÊN CHO THUÊ (BÊN A):</p>
            <p>Họ tên: Trần Minh Tuấn</p>
            <p>CCCD: 001085004321</p>
            <p>SĐT: 0912 345 678</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-stone-900 dark:text-stone-100">BÊN THUÊ (BÊN B):</p>
            <p>Họ tên: Nguyễn Văn Thuê</p>
            <p>CCCD: 001202012345</p>
            <p>SĐT: 0987 654 321</p>
          </div>
        </div>

        <div className="space-y-3 font-sans text-xs">
          <p>
            <strong>Điều 1. Đối tượng hợp đồng:</strong> Phòng 302, diện tích 32m², địa chỉ Số 15 ngõ 92 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội.
          </p>
          <p>
            <strong>Điều 2. Giá thuê & Thanh toán:</strong> Giá thuê 4.800.000 đ/tháng. Tiền cọc: 4.800.000 đ. Tiền thuê thanh toán định kỳ từ ngày 1 đến ngày 5 hàng tháng.
          </p>
          <p>
            <strong>Điều 3. Chi phí dịch vụ:</strong> Điện 3.800 đ/kWh theo chỉ số công tơ; Nước sinh hoạt 30.000 đ/khối; Internet 100.000 đ/phòng; Phí vệ sinh 50.000 đ/người.
          </p>
          <p>
            <strong>Điều 4. Thời hạn hợp đồng:</strong> 12 tháng, kể từ ngày 01/11/2026 đến hết ngày 31/10/2027.
          </p>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex justify-around text-center font-sans">
          <div>
            <p className="font-bold text-stone-900 dark:text-stone-100">Đại diện Bên A</p>
            <p className="text-emerald-600 font-semibold text-[11px] mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã ký số điện tử
            </p>
            <p className="text-[10px] text-stone-400">Trần Minh Tuấn (30/10/2026)</p>
          </div>
          <div>
            <p className="font-bold text-stone-900 dark:text-stone-100">Đại diện Bên B</p>
            <p className="text-emerald-600 font-semibold text-[11px] mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã ký số điện tử
            </p>
            <p className="text-[10px] text-stone-400">Nguyễn Văn Thuê (30/10/2026)</p>
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
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSigning}>
              Ký số ngay
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

