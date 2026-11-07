'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([
    {
      id: 1,
      targetType: 'PHÒNG TRỌ',
      targetName: 'Căn hộ mini trung tâm Láng Hạ',
      reporterName: 'Nguyễn Văn Thuê',
      reason: 'Giá điện thực tế khi liên hệ là 4.500 đ, khác giá niêm yết 4.000 đ',
      submittedAt: 'Hôm nay',
      status: 'PENDING',
    },
    {
      id: 2,
      targetType: 'CHỦ TRỌ',
      targetName: 'Lê Văn Hoàng',
      reporterName: 'Lê Thị Mai',
      reason: 'Chủ trọ từ chối hoàn trả cọc giữ phòng không có lý do chính đáng',
      submittedAt: '2 ngày trước',
      status: 'RESOLVED',
    },
  ]);

  const handleResolve = (id: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'RESOLVED' } : r))
    );
    toast.success('Đã xử lý khiếu nại vi phạm và gửi biên bản cho các bên liên quan!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Khiếu nại & Báo cáo vi phạm ({reports.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Tiếp nhận và xử lý các báo cáo về tin ảo, tranh chấp tiền cọc hoặc sai lệch giá cả.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Người báo cáo</TableHead>
              <TableHead>Nội dung vi phạm</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{r.targetName}</p>
                  <Badge variant="warning" size="sm">{r.targetType}</Badge>
                </TableCell>
                <TableCell className="text-xs font-medium">{r.reporterName}</TableCell>
                <TableCell className="text-xs text-stone-600 dark:text-stone-400 max-w-[280px]">
                  {r.reason}
                </TableCell>
                <TableCell className="text-xs text-stone-400">{r.submittedAt}</TableCell>
                <TableCell>
                  <Badge variant={r.status === 'RESOLVED' ? 'success' : 'danger'} size="sm">
                    {r.status === 'RESOLVED' ? 'Đã giải quyết' : 'Cần xử lý'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {r.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleResolve(r.id)}
                      leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                    >
                      Xử lý
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

