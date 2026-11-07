'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { Lock, Unlock, Shield, User } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn Thuê',
      email: 'tenant@toam.vn',
      phone: '0987 654 321',
      role: 'TENANT',
      roleText: 'Người thuê',
      status: 'ACTIVE',
      joinedAt: '01/01/2026',
    },
    {
      id: 2,
      name: 'Trần Minh Tuấn',
      email: 'landlord@toam.vn',
      phone: '0912 345 678',
      role: 'LANDLORD',
      roleText: 'Chủ trọ',
      status: 'ACTIVE',
      joinedAt: '15/12/2025',
    },
    {
      id: 3,
      name: 'Hoàng Thị Thảo',
      email: 'moderator@toam.vn',
      phone: '0933 888 999',
      role: 'MODERATOR',
      roleText: 'Kiểm duyệt viên',
      status: 'ACTIVE',
      joinedAt: '10/11/2025',
    },
  ]);

  const toggleLock = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
          toast.info(`Tài khoản ${u.email} đã được chuyển sang trạng thái: ${next === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}`);
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Quản lý người dùng hệ thống ({users.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Theo dõi tài khoản, phân quyền và khóa các tài khoản có hành vi gian lận.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email / SĐT</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-bold text-stone-900 dark:text-stone-100">{u.name}</TableCell>
                <TableCell>
                  <p className="text-xs">{u.email}</p>
                  <p className="text-[11px] text-stone-400">{u.phone}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'LANDLORD' ? 'primary' : 'neutral'} size="sm">
                    {u.roleText}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-stone-500">{u.joinedAt}</TableCell>
                <TableCell>
                  <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                    {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLock(u.id)}
                    leftIcon={u.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                  >
                    {u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
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
