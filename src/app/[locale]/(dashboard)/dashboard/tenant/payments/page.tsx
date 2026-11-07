'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';

export default function TenantPaymentsPage() {
  const transactions = [
    {
      id: 'TX-20261014-089',
      invoiceCode: 'INV-2026-10',
      description: 'Thanh toán tiền phòng & dịch vụ tháng 10/2026',
      amount: '5.210.000 đ',
      method: 'VietQR / Chuyển khoản',
      date: '14/10/2026 10:24',
      status: 'SUCCESS',
    },
    {
      id: 'TX-20260912-045',
      invoiceCode: 'INV-2026-09',
      description: 'Thanh toán tiền phòng & dịch vụ tháng 09/2026',
      amount: '5.180.000 đ',
      method: 'VietQR / Chuyển khoản',
      date: '12/09/2026 16:45',
      status: 'SUCCESS',
    },
    {
      id: 'TX-20260810-012',
      invoiceCode: 'INV-2026-08',
      description: 'Thanh toán tiền phòng & dịch vụ tháng 08/2026',
      amount: '5.250.000 đ',
      method: 'Thẻ ATM nội địa',
      date: '10/08/2026 09:15',
      status: 'SUCCESS',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Lịch sử thanh toán ({transactions.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Danh sách các biên lai điện tử đã thanh toán thành công qua hệ thống Tổ Ấm.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã giao dịch</TableHead>
              <TableHead>Hóa đơn / Nội dung</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Biên lai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-xs font-semibold">{tx.id}</TableCell>
                <TableCell>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">{tx.invoiceCode}</p>
                  <p className="text-[11px] text-stone-400">{tx.description}</p>
                </TableCell>
                <TableCell className="text-xs">{tx.method}</TableCell>
                <TableCell className="text-xs text-stone-500">{tx.date}</TableCell>
                <TableCell className="font-bold text-teal-800 dark:text-teal-400">{tx.amount}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => toast.info(`Đang tải biên lai cho giao dịch ${tx.id}...`)}
                  >
                    Tải
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
