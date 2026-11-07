'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { ShieldCheck, Eye, Check, X, CreditCard } from 'lucide-react';

export default function AdminKycModerationPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [kycList, setKycList] = useState([
    {
      id: 1,
      name: 'Lê Văn Hoàng',
      email: 'hoang.le@example.com',
      phone: '0934 567 890',
      role: 'LANDLORD',
      roleText: 'Chủ trọ',
      idNumber: '001092008899',
      frontImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      backImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      submittedAt: 'Hôm nay',
    },
    {
      id: 2,
      name: 'Đặng Thùy Trang',
      email: 'trang.dang@example.com',
      phone: '0977 112 233',
      role: 'TENANT',
      roleText: 'Người thuê',
      idNumber: '038198005544',
      frontImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      backImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      submittedAt: 'Hôm qua',
    },
  ]);

  const handleApprove = (id: number) => {
    setKycList((prev) => prev.filter((k) => k.id !== id));
    setSelectedUser(null);
    toast.success('Đã phê duyệt định danh eKYC! Tài khoản được cấp huy hiệu Đã xác thực.');
  };

  const handleReject = (id: number) => {
    setKycList((prev) => prev.filter((k) => k.id !== id));
    setSelectedUser(null);
    toast.info('Đã từ chối và yêu cầu người dùng chụp lại ảnh CCCD rõ nét hơn.');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Duyệt hồ sơ định danh CCCD (eKYC) ({kycList.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Kiểm tra độ chính xác giữa ảnh chụp CCCD hai mặt và thông tin định danh của người dùng.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên / SĐT</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Số CCCD</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead className="text-right">Xem xét CCCD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kycList.map((k) => (
              <TableRow key={k.id}>
                <TableCell>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{k.name}</p>
                  <p className="text-[11px] text-stone-500">{k.phone} • {k.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={k.role === 'LANDLORD' ? 'primary' : 'neutral'} size="sm">
                    {k.roleText}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{k.idNumber}</TableCell>
                <TableCell className="text-xs text-stone-400">{k.submittedAt}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedUser(k)}
                  >
                    Xem CCCD 2 mặt
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {selectedUser && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          title={`Thẩm định CCCD: ${selectedUser.name}`}
          description={`Số CCCD: ${selectedUser.idNumber} • Vai trò: ${selectedUser.roleText}`}
          size="lg"
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Ảnh mặt trước</span>
                <div className="aspect-16/10 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100">
                  <img src={selectedUser.frontImage} alt="Mặt trước CCCD" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Ảnh mặt sau</span>
                <div className="aspect-16/10 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100">
                  <img src={selectedUser.backImage} alt="Mặt sau CCCD" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
              <Button variant="outline" size="sm" onClick={() => handleReject(selectedUser.id)}>
                Yêu cầu chụp lại
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleApprove(selectedUser.id)}>
                Phê duyệt định danh
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
