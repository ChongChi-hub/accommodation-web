'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { ShieldCheck, Upload, FileCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface OwnershipDoc {
  id: string;
  roomTitle: string;
  docType: string;
  maskedNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason?: string;
  submittedAt: string;
}

export function PropertyOwnershipKycSection() {
  const [docs, setDocs] = useState<OwnershipDoc[]>([
    {
      id: 'DOC-01',
      roomTitle: 'Phòng 302, Chung cư mini Dịch Vọng Hậu',
      docType: 'Giấy chứng nhận QSDĐ (Sổ đỏ)',
      maskedNumber: 'GCN***789',
      status: 'APPROVED',
      submittedAt: '25/10/2026',
    },
    {
      id: 'DOC-02',
      roomTitle: 'Phòng 401, Nhà trọ Quan Hoa',
      docType: 'Hợp đồng ủy quyền cho thuê',
      maskedNumber: 'UQ***112',
      status: 'PENDING',
      submittedAt: '08/11/2026',
    },
  ]);

  const [roomId, setRoomId] = useState('1');
  const [docType, setDocType] = useState('SO_DO');
  const [rawNumber, setRawNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawNumber.trim()) {
      toast.error('Vui lòng nhập số hiệu giấy tờ');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const masked = rawNumber.length > 5 ? rawNumber.substring(0, 3) + '***' + rawNumber.substring(rawNumber.length - 3) : '***';
      const newDoc: OwnershipDoc = {
        id: `DOC-0${docs.length + 1}`,
        roomTitle: 'Phòng trọ mới đăng ký',
        docType: docType === 'SO_DO' ? 'Sổ đỏ / Sổ hồng' : docType === 'UY_QUYEN' ? 'Hợp đồng ủy quyền' : 'Hợp đồng thuê lại',
        maskedNumber: masked,
        status: 'PENDING',
        submittedAt: 'Hôm nay',
      };
      setDocs((prev) => [newDoc, ...prev]);
      setRawNumber('');
      toast.success('Đã tải lên giấy tờ xác minh quyền cho thuê! Kiểm duyệt viên sẽ xét duyệt trong 24h.');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <Card className="p-5 border border-teal-100 dark:border-teal-900/40 bg-teal-50/30 dark:bg-teal-950/20">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-stone-900 dark:text-stone-100">
              Quy chuẩn KYC-03: Xác minh quyền cho thuê và huy hiệu Tin đã xác thực
            </p>
            <p className="text-stone-600 dark:text-stone-300">
              Chặn rủi ro lừa đảo cho thuê nhà không chính chủ. Tin đăng sau khi được duyệt giấy tờ sẽ nhận được huy hiệu
              <strong className="text-emerald-700 dark:text-emerald-400"> "Tin đã xác thực" </strong>
              và được ưu tiên hiển thị ở vị trí hàng đầu trên trang tìm kiếm. Giấy tờ được lưu trữ mã hóa an toàn và số liệu luôn được che bảo mật.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Gửi giấy tờ xác minh cho phòng trọ</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Chọn phòng trọ cần xác minh"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              options={[
                { value: '1', label: 'Phòng 302, Dịch Vọng Hậu' },
                { value: '2', label: 'Studio Quan Hoa view sông' },
                { value: '3', label: 'Căn hộ mini Láng Hạ' },
              ]}
            />
            <Select
              label="Loại giấy tờ sở hữu / ủy quyền"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              options={[
                { value: 'SO_DO', label: 'Sổ đỏ / Sổ hồng (Giấy chứng nhận QSDĐ)' },
                { value: 'UY_QUYEN', label: 'Hợp đồng ủy quyền cho thuê công chứng' },
                { value: 'THUE_LAI', label: 'Hợp đồng thuê lại từ chủ nhà' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Số hiệu văn bản / Giấy chứng nhận"
              required
              placeholder="VD: GCN 8492019"
              value={rawNumber}
              onChange={(e) => setRawNumber(e.target.value)}
              helperText="Hệ thống sẽ tự động che số liệu (VD: GCN***019) để bảo mật thông tin."
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Tập tin chứng minh (Ảnh hoặc PDF)
              </label>
              <div className="border border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-3 text-center cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/40">
                <Upload className="w-4 h-4 mx-auto text-stone-400" />
                <span className="text-[11px] text-stone-500 mt-1 block">Nhấp để tải ảnh chụp hoặc file scan</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<FileCheck className="w-4 h-4" />}>
              Gửi kiểm duyệt giấy tờ
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phòng trọ</TableHead>
              <TableHead>Loại văn bản</TableHead>
              <TableHead>Số hiệu (đã che)</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-semibold text-xs text-stone-900 dark:text-stone-100">{doc.roomTitle}</TableCell>
                <TableCell className="text-xs text-stone-600 dark:text-stone-300">{doc.docType}</TableCell>
                <TableCell className="font-mono text-xs text-stone-500">{doc.maskedNumber}</TableCell>
                <TableCell className="text-xs text-stone-400">{doc.submittedAt}</TableCell>
                <TableCell>
                  <Badge variant={doc.status === 'APPROVED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'danger'} size="sm">
                    {doc.status === 'APPROVED' ? 'Tin đã xác thực' : doc.status === 'PENDING' ? 'Đang xét duyệt' : 'Bị từ chối'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

