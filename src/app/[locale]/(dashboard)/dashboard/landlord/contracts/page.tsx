'use client';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { Link } from '@/i18n/routing';
import { PlusCircle, FileText, CheckCircle2, Eye, Ban } from 'lucide-react';

export default function LandlordContractsPage() {
  const tAuto = useTranslations('autoI18n');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contracts, setContracts] = useState([
    {
      id: 1,
      contractNumber: 'HĐ-2026-0042',
      roomTitle: 'Phòng 302, Dịch Vọng Hậu',
      tenantName: 'Nguyễn Văn Thuê',
      price: '4.800.000 đ',
      period: '01/11/2026 - 31/10/2027',
      status: 'ACTIVE',
      statusText: 'Đang hiệu lực',
    },
    {
      id: 2,
      contractNumber: 'HĐ-2025-0189',
      roomTitle: 'Phòng 401, Quan Hoa',
      tenantName: 'Lê Văn Hoàng',
      price: '3.600.000 đ',
      period: '01/10/2025 - 30/09/2026',
      status: 'EXPIRED',
      statusText: 'Đã kết thúc',
    },
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateModalOpen(false);
    toast.success('Khởi tạo hợp đồng mới thành công! Đã gửi thông báo cho khách thuê ký số.');
  };

  const handleTerminate = (id: number) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'TERMINATED', statusText: 'Đã thanh lý' } : c))
    );
    toast.info('Đã lập biên bản thanh lý hợp đồng thuê.');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0118')}{contracts.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0119')}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          {tAuto('k0120')}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tAuto('k0121')}</TableHead>
              <TableHead>{tAuto('k0122')}</TableHead>
              <TableHead>{tAuto('k0123')}</TableHead>
              <TableHead>{tAuto('k0124')}</TableHead>
              <TableHead>{tAuto('k0125')}</TableHead>
              <TableHead>{tAuto('k0048')}</TableHead>
              <TableHead className="text-right">{tAuto('k0078')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs font-semibold">{c.contractNumber}</TableCell>
                <TableCell className="text-xs font-medium text-stone-900 dark:text-stone-100">{c.roomTitle}</TableCell>
                <TableCell className="text-xs">{c.tenantName}</TableCell>
                <TableCell className="font-semibold text-teal-800 dark:text-teal-400">{c.price}</TableCell>
                <TableCell className="text-xs text-stone-500">{c.period}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                    {c.statusText}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/dashboard/tenant/contracts/${c.id}`}>
                      <Button variant="ghost" size="sm" aria-label="Xem">
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                      </Button>
                    </Link>
                    {c.status === 'ACTIVE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTerminate(c.id)}
                        aria-label="Thanh lý"
                        title="Thanh lý hợp đồng"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Khởi tạo hợp đồng thuê điện tử"
        description="Điền thông tin căn bản để lập hợp đồng gửi cho khách thuê ký OTP."
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Select
            label="Chọn phòng trọ"
            options={[
              { value: '1', label: 'Phòng 302 - Chung cư mini Dịch Vọng Hậu' },
              { value: '2', label: 'Phòng 201 - Studio Quan Hoa' },
            ]}
          />
          <Input label="Họ tên khách thuê" required placeholder="Nguyễn Văn A" />
          <Input label="Số CCCD khách thuê (12 số)" required placeholder="0012..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Giá thuê (VNĐ/tháng)" required placeholder="4800000" />
            <Input label="Tiền cọc (VNĐ)" required placeholder="4800000" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              {tAuto('k0126')}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {tAuto('k0127')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

