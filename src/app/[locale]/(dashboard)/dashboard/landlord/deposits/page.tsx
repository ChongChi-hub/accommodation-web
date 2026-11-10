'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { ShieldCheck, ArrowDownLeft, CheckCircle2, Clock, Landmark } from 'lucide-react';

export default function LandlordDepositsPage() {
  const [deposits, setDeposits] = useState([
    {
      id: 'DEP-2026-0081',
      roomTitle: 'Phòng 302, Dịch Vọng Hậu',
      tenantName: 'Nguyễn Văn Thuê',
      amount: '2.000.000 đ',
      status: 'HELD_IN_ESCROW',
      statusText: 'Đang phong tỏa (Escrow)',
      receivedAt: '30/10/2026',
    },
    {
      id: 'DEP-2025-0104',
      roomTitle: 'Phòng 401, Nguyễn Khánh Toàn',
      tenantName: 'Lê Văn Hoàng',
      amount: '1.500.000 đ',
      status: 'DISBURSED',
      statusText: 'Đã giải ngân vào ví',
      receivedAt: '28/09/2025',
    },
  ]);

  const handleClaim = (id: string) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'DISBURSED', statusText: 'Đã giải ngân vào ví' } : d))
    );
    toast.success('Đã giải ngân tiền cọc giữ chỗ vào số dư ví của chủ trọ thành công!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          Quản lý tiền cọc giữ chỗ (Escrow)
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Tiền đặt cọc của khách thuê được bảo vệ trong tài khoản ký quỹ trung gian theo Nghị định 52/2024/NĐ-CP.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-400">Đang giữ trong Escrow</p>
          <p className="text-xl font-black text-amber-600">2.000.000 đ</p>
          <p className="text-[10px] text-stone-400">1 khoản cọc chờ kích hoạt hợp đồng</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-400">Đã giải ngân vào ví</p>
          <p className="text-xl font-black text-teal-800 dark:text-teal-400">1.500.000 đ</p>
          <p className="text-[10px] text-stone-400">Có thể yêu cầu rút tiền về ngân hàng</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-stone-400">Đã hoàn trả khách</p>
          <p className="text-xl font-black text-stone-700 dark:text-stone-300">0 đ</p>
          <p className="text-[10px] text-stone-400">Khi từ chối yêu cầu thuê hoặc quá hạn</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã cọc</TableHead>
              <TableHead>Phòng trọ</TableHead>
              <TableHead>Khách thuê</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Ngày ghi nhận</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs font-semibold">{d.id}</TableCell>
                <TableCell className="text-xs font-medium text-stone-900 dark:text-stone-100">{d.roomTitle}</TableCell>
                <TableCell className="text-xs">{d.tenantName}</TableCell>
                <TableCell className="font-bold text-teal-800 dark:text-teal-400">{d.amount}</TableCell>
                <TableCell className="text-xs text-stone-500">{d.receivedAt}</TableCell>
                <TableCell>
                  <Badge variant={d.status === 'HELD_IN_ESCROW' ? 'warning' : 'success'} size="sm">
                    {d.statusText}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {d.status === 'HELD_IN_ESCROW' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<ArrowDownLeft className="w-3.5 h-3.5" />}
                      onClick={() => handleClaim(d.id)}
                    >
                      Giải ngân
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
