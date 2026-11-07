'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { FolderTree, Plus, MapPin, Sparkles, Building } from 'lucide-react';

export default function AdminDictionariesPage() {
  const [activeTab, setActiveTab] = useState('room_types');

  const tabItems = [
    { id: 'room_types', label: 'Loại phòng trọ', icon: <Building className="w-4 h-4" /> },
    { id: 'amenities', label: 'Tiện ích & Nội thất', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'locations', label: 'Tỉnh thành & Quận huyện', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Danh mục & Từ điển hệ thống
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Cấu hình các loại phòng, danh sách tiện nghi và danh mục địa bàn hành chính.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => toast.info('Tính năng thêm danh mục mới sẽ ra mắt trong bản cập nhật kế tiếp!')}
        >
          Thêm danh mục
        </Button>
      </div>

      <Tabs items={tabItems} activeId={activeTab} onChange={setActiveTab} />

      {activeTab === 'room_types' && (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên loại phòng</TableHead>
                <TableHead>Mô tả quy chuẩn</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">MINI_APARTMENT</TableCell>
                <TableCell className="font-bold">Chung cư mini</TableCell>
                <TableCell className="text-xs text-stone-500">Phòng khép kín đầy đủ đồ tiện nghi hiện đại</TableCell>
                <TableCell><Badge variant="success" size="sm">Hoạt động</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">STUDIO</TableCell>
                <TableCell className="font-bold">Căn hộ Studio</TableCell>
                <TableCell className="text-xs text-stone-500">Không gian mở kết hợp phòng ngủ và bếp</TableCell>
                <TableCell><Badge variant="success" size="sm">Hoạt động</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">APARTMENT</TableCell>
                <TableCell className="font-bold">Căn hộ nguyên căn</TableCell>
                <TableCell className="text-xs text-stone-500">Căn hộ gia đình 2-3 phòng ngủ</TableCell>
                <TableCell><Badge variant="success" size="sm">Hoạt động</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'amenities' && (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã tiện ích</TableHead>
                <TableHead>Tên hiển thị</TableHead>
                <TableHead>Phân nhóm</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">wifi</TableCell>
                <TableCell className="font-bold">Wifi tốc độ cao</TableCell>
                <TableCell className="text-xs text-stone-500">Tiện ích cơ bản</TableCell>
                <TableCell><Badge variant="success" size="sm">Hoạt động</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">air_conditioner</TableCell>
                <TableCell className="font-bold">Điều hòa 2 chiều</TableCell>
                <TableCell className="text-xs text-stone-500">Tiện ích cơ bản</TableCell>
                <TableCell><Badge variant="success" size="sm">Hoạt động</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">water_heater</TableCell>
                <TableCell className="font-bold">Bình nóng lạnh</TableCell>
                <TableCell className="text-xs text-stone-500">Tiện ích cơ bản</TableCell>
                <TableCell><Badge variant="success" size="sm">Hoạt động</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'locations' && (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã tỉnh</TableHead>
                <TableHead>Tên Tỉnh / Thành phố</TableHead>
                <TableHead>Số quận/huyện hỗ trợ</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">HN</TableCell>
                <TableCell className="font-bold">Thành phố Hà Nội</TableCell>
                <TableCell className="text-xs text-stone-500">5 quận trọng điểm</TableCell>
                <TableCell><Badge variant="success" size="sm">Phủ sóng</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">HCM</TableCell>
                <TableCell className="font-bold">Thành phố Hồ Chí Minh</TableCell>
                <TableCell className="text-xs text-stone-500">3 quận trọng điểm</TableCell>
                <TableCell><Badge variant="success" size="sm">Phủ sóng</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
