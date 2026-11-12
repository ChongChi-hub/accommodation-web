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
import { PlusCircle, BellRing, Eye, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function LandlordInvoicesPage() {
  const tAuto = useTranslations('autoI18n');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      invoiceCode: 'INV-2026-11',
      room: 'Phòng 302 (Dịch Vọng Hậu)',
      tenant: 'Nguyễn Văn Thuê',
      total: '5.280.000 đ',
      dueDate: '15/11/2026',
      status: 'UNPAID',
      statusText: 'Chưa thu',
    },
    {
      id: 2,
      invoiceCode: 'INV-2026-10',
      room: 'Phòng 302 (Dịch Vọng Hậu)',
      tenant: 'Nguyễn Văn Thuê',
      total: '5.210.000 đ',
      dueDate: '15/10/2026',
      status: 'PAID',
      statusText: 'Đã thu tiền',
    },
  ]);

  const handleRemind = (code: string) => {
    toast.success(`Đã gửi thông báo nhắc nợ hóa đơn ${code} qua tin nhắn SMS & Email cho khách thuê!`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateModalOpen(false);
    toast.success('Đã tạo và gửi hóa đơn thành công!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0143')}{invoices.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0144')}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          {tAuto('k0145')}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tAuto('k0121')}</TableHead>
              <TableHead>{tAuto('k0146')}</TableHead>
              <TableHead>{tAuto('k0147')}</TableHead>
              <TableHead>{tAuto('k0148')}</TableHead>
              <TableHead>{tAuto('k0048')}</TableHead>
              <TableHead className="text-right">{tAuto('k0078')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs font-semibold">{inv.invoiceCode}</TableCell>
                <TableCell>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">{inv.room}</p>
                  <p className="text-[11px] text-stone-500">{inv.tenant}</p>
                </TableCell>
                <TableCell className="font-bold text-teal-800 dark:text-teal-400">{inv.total}</TableCell>
                <TableCell className="text-xs text-stone-500">{inv.dueDate}</TableCell>
                <TableCell>
                  <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'} size="sm">
                    {inv.statusText}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/dashboard/tenant/invoices/${inv.id}`}>
                      <Button variant="ghost" size="sm" aria-label="Xem">
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                      </Button>
                    </Link>
                    {inv.status === 'UNPAID' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemind(inv.invoiceCode)}
                        aria-label="Nhắc nợ"
                        title="Gửi nhắc nợ"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-600" />
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
        title="Lập hóa đơn tiền phòng & dịch vụ"
        description="Chọn phòng trọ và nhập các thông số tính tiền."
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Select
            label="Chọn phòng trọ"
            options={[
              { value: '1', label: 'Phòng 302 - Nguyễn Văn Thuê' },
              { value: '2', label: 'Phòng 501 - Lê Thị Mai' },
            ]}
          />
          <Input label="Tiền phòng (VNĐ)" defaultValue="4800000" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tiền điện (VNĐ)" defaultValue="285000" />
            <Input label="Tiền nước (VNĐ)" defaultValue="90000" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              {tAuto('k0126')}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {tAuto('k0149')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

