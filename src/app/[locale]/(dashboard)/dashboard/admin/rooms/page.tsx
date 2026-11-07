'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { Link } from '@/i18n/routing';
import { Check, X, Eye, ShieldAlert } from 'lucide-react';

export default function AdminRoomsModerationPage() {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [pendingRooms, setPendingRooms] = useState([
    {
      id: 101,
      title: 'Phòng khép kín ban công cực thoáng gần ĐH Bách Khoa',
      landlord: 'Trần Minh Tuấn',
      address: 'Số 12 ngõ 40 Tạ Quang Bửu, Hai Bà Trưng',
      price: '3.800.000 đ',
      area: 25,
      submittedAt: '10:15 hôm nay',
      status: 'PENDING',
    },
    {
      id: 102,
      title: 'Studio full đồ cao cấp view hồ Tây',
      landlord: 'Phạm Thanh Sơn',
      address: 'Đường Trích Sài, Bưởi, Tây Hồ',
      price: '6.500.000 đ',
      area: 35,
      submittedAt: '09:40 hôm nay',
      status: 'PENDING',
    },
  ]);

  const handleApprove = (id: number) => {
    setPendingRooms((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Đã duyệt xuất bản phòng #${id}! Tin đăng hiện đã hiển thị trên sàn.`);
  };

  const handleReject = () => {
    if (!selectedRoomId) return;
    setPendingRooms((prev) => prev.filter((r) => r.id !== selectedRoomId));
    setRejectModalOpen(false);
    toast.info(`Đã từ chối tin đăng #${selectedRoomId}. Đã gửi lý do cho chủ nhà.`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Kiểm duyệt tin đăng phòng trọ ({pendingRooms.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Thẩm định tính chân thực của hình ảnh, địa chỉ và biểu phí niêm yết.
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã / Tiêu đề phòng</TableHead>
              <TableHead>Chủ nhà</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Giá thuê</TableHead>
              <TableHead>Thời gian gửi</TableHead>
              <TableHead className="text-right">Duyệt tin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingRooms.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="font-bold text-stone-900 dark:text-stone-100">#{r.id}</p>
                  <p className="text-[11px] text-stone-500 truncate max-w-[220px]">{r.title}</p>
                </TableCell>
                <TableCell className="text-xs font-semibold">{r.landlord}</TableCell>
                <TableCell className="text-xs text-stone-500 max-w-[180px] truncate">{r.address}</TableCell>
                <TableCell className="font-bold text-teal-800 dark:text-teal-400">{r.price}</TableCell>
                <TableCell className="text-xs text-stone-400">{r.submittedAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(r.id)}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Duyệt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRoomId(r.id);
                        setRejectModalOpen(true);
                      }}
                      leftIcon={<X className="w-3.5 h-3.5 text-rose-600" />}
                    >
                      Từ chối
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Từ chối duyệt tin đăng phòng"
        description="Nhập lý do chi tiết để chủ nhà sửa đổi thông tin."
      >
        <div className="space-y-4 pt-2">
          <textarea
            rows={3}
            placeholder="Ví dụ: Hình ảnh chưa rõ ràng, giá điện cao hơn quy định tối đa..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 p-3 text-xs bg-white dark:bg-stone-900 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" size="sm" onClick={handleReject}>
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
