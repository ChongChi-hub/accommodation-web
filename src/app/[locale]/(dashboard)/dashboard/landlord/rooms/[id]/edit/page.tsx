'use client';

import React, { use, useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { toast } from '@/presentation/stores/toast.store';
import { useRouter } from '@/i18n/routing';
import { Save } from 'lucide-react';

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('Chung cư mini ban công rộng tại Dịch Vọng Hậu');
  const [price, setPrice] = useState('4800000');
  const [status, setStatus] = useState('AVAILABLE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Đã lưu các thay đổi cho căn phòng!');
      router.push('/dashboard/landlord/rooms');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb
        items={[
          { label: 'Quản lý phòng', href: '/dashboard/landlord/rooms' },
          { label: `Chỉnh sửa phòng #${id}` },
        ]}
      />

      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Chỉnh sửa thông tin phòng
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Cập nhật giá thuê, trạng thái hoặc thông số kỹ thuật của căn phòng.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tiêu đề hiển thị"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Giá thuê (VNĐ/tháng)"
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Select
              label="Trạng thái phòng"
              options={[
                { value: 'AVAILABLE', label: 'Còn trống (Hiển thị tìm kiếm)' },
                { value: 'RENTED', label: 'Đang cho thuê' },
                { value: 'MAINTENANCE', label: 'Đang sửa chữa / Tạm ẩn' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

