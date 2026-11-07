'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { History, Shield, User, CheckCircle } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const logs = [
    {
      id: 1,
      actor: 'Admin Hệ Thống (admin@toam.vn)',
      action: 'APPROVE_KYC',
      description: 'Phê duyệt hồ sơ eKYC cho tài khoản landlord@toam.vn',
      ip: '14.232.208.45',
      time: '11:20:15 Hôm nay',
    },
    {
      id: 2,
      actor: 'Kiểm duyệt viên (moderator@toam.vn)',
      action: 'APPROVE_ROOM',
      description: 'Duyệt xuất bản phòng trọ ID #1 tại Cầu Giấy',
      ip: '118.70.190.12',
      time: '10:45:00 Hôm nay',
    },
    {
      id: 3,
      actor: 'Hệ thống tự động',
      action: 'GENERATE_INVOICE',
      description: 'Tự động tạo hóa đơn tiền phòng tháng 11 cho hợp đồng HĐ-2026-0042',
      ip: '127.0.0.1 (Internal)',
      time: '00:01:00 01/11/2026',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Nhật ký kiểm toán & Giám sát hệ thống ({logs.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Ghi nhận toàn bộ vết hành động quản trị, bảo mật và thay đổi trạng thái nhạy cảm.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Chi tiết</TableHead>
              <TableHead>Địa chỉ IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="text-xs text-stone-400 font-mono">{l.time}</TableCell>
                <TableCell className="text-xs font-semibold">{l.actor}</TableCell>
                <TableCell>
                  <Badge variant="primary" size="sm">{l.action}</Badge>
                </TableCell>
                <TableCell className="text-xs text-stone-600 dark:text-stone-300 max-w-[280px]">
                  {l.description}
                </TableCell>
                <TableCell className="text-xs text-stone-400 font-mono">{l.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
