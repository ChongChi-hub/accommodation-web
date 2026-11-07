'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Link } from '@/i18n/routing';
import { PlusCircle, Edit, Eye, Building, Star, CheckCircle } from 'lucide-react';
import { toast } from '@/presentation/stores/toast.store';

export default function LandlordRoomsPage() {
  const [rooms, setRooms] = useState([
    {
      id: 1,
      code: 'P-302',
      title: 'Chung cư mini ban công rộng tại Dịch Vọng Hậu',
      address: 'Số 15 ngõ 92 Trần Thái Tông, Cầu Giấy',
      area: 32,
      price: '4.800.000 đ',
      status: 'RENTED',
      statusText: 'Đã cho thuê',
      currentTenant: 'Nguyễn Văn Thuê',
      rating: 4.9,
    },
    {
      id: 2,
      code: 'P-201',
      title: 'Studio ngập tràn ánh sáng view công viên Quan Hoa',
      address: 'Ngõ 118 Nguyễn Khánh Toàn, Quan Hoa',
      area: 28,
      price: '4.200.000 đ',
      status: 'AVAILABLE',
      statusText: 'Còn trống',
      currentTenant: 'Chưa có',
      rating: 4.8,
    },
    {
      id: 3,
      code: 'P-501',
      title: 'Căn hộ mini trung tâm Láng Hạ gần rạp chiếu phim',
      address: 'Số 42 ngõ 105 Láng Hạ, Đống Đa',
      area: 35,
      price: '5.500.000 đ',
      status: 'RENTED',
      statusText: 'Đã cho thuê',
      currentTenant: 'Lê Thị Mai',
      rating: 5.0,
    },
  ]);

  const formatStatus = (s: string) => {
    return s === 'AVAILABLE' ? (
      <Badge variant="success" size="sm">Còn trống</Badge>
    ) : (
      <Badge variant="primary" size="sm">Đang thuê</Badge>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Quản lý phòng trọ ({rooms.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Danh sách tất cả các phòng trọ bạn đang quản lý và cho thuê.
          </p>
        </div>
        <Link href="/dashboard/landlord/rooms/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
            Đăng phòng mới
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã phòng / Tên phòng</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Giá thuê</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Khách thuê</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{r.code}</p>
                  <p className="text-[11px] text-stone-500 truncate max-w-[200px]">{r.title}</p>
                </TableCell>
                <TableCell className="text-xs text-stone-500 max-w-[180px] truncate">{r.address}</TableCell>
                <TableCell className="font-semibold text-teal-800 dark:text-teal-400">{r.price}</TableCell>
                <TableCell>{formatStatus(r.status)}</TableCell>
                <TableCell className="text-xs font-medium">{r.currentTenant}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/rooms/${r.id}`}>
                      <Button variant="ghost" size="sm" aria-label="Xem">
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/landlord/rooms/${r.id}/edit`}>
                      <Button variant="ghost" size="sm" aria-label="Sửa">
                        <Edit className="w-3.5 h-3.5 text-teal-700" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

