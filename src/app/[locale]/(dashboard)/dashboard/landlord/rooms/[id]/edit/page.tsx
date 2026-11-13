'use client';
import { useTranslations } from 'next-intl';

import React, { use, useState, useEffect } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { ImageManager } from '@/presentation/components/rooms/ImageManager';
import { ManagedImage } from '@/presentation/components/rooms/ImageCard';
import { useLandlordRoomDetail } from '@/presentation/hooks/useLandlordRoomDetail';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { useRouter } from '@/i18n/routing';
import { Save, ArrowLeft } from 'lucide-react';

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const tAuto = useTranslations('autoI18n');
  const { id } = use(params);
  const router = useRouter();
  const {
    room,
    images: backendImages,
    isLoading,
    isSaving,
    error,
    updateDetails,
    uploadImages,
    setCover,
    deleteImage,
    reorderImages,
    refresh,
  } = useLandlordRoomDetail(id);

  const [formData, setFormData] = useState({
    title: '', description: '', address: '', area: '', price: '', deposit: '',
    electricityCost: '3500', waterCost: '25000',
    initialElectricityReading: '0', initialWaterReading: '0',
    allowPets: false, allowCooking: true,
  });

  useEffect(() => {
    if (room) {
      setFormData({
        title: room.title || '', description: room.description || '', address: room.address || '',
        area: room.area ? String(room.area) : '', price: room.price ? String(room.price) : '',
        deposit: room.deposit ? String(room.deposit) : '',
        electricityCost: room.electricityCost ? String(room.electricityCost) : '3500',
        waterCost: room.waterCost ? String(room.waterCost) : '25000',
        initialElectricityReading: room.initialElectricityReading !== undefined ? String(room.initialElectricityReading) : '0',
        initialWaterReading: room.initialWaterReading !== undefined ? String(room.initialWaterReading) : '0',
        allowPets: room.allowPets ?? false, allowCooking: room.allowCooking ?? true,
      });
    }
  }, [room]);

  const managedImages: ManagedImage[] = backendImages.map((img) => ({
    id: img.id,
    url: (img.thumbKey && img.thumbKey.startsWith('http'))
      ? img.thumbKey
      : (img.imageUrl || (img.thumbKey ? `/api/v1/media/${img.thumbKey}` : '')),
    isCover: img.cover,
    sortOrder: img.sortOrder,
    name: img.originalFilename,
    sizeBytes: img.sizeBytes,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !formData.title.trim() || !formData.address.trim() || !formData.area || !formData.price) {
      return;
    }

    const ok = await updateDetails({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      address: formData.address.trim(),
      area: parseFloat(formData.area),
      price: parseFloat(formData.price),
      deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
      electricityCost: formData.electricityCost ? parseFloat(formData.electricityCost) : 3500,
      waterCost: formData.waterCost ? parseFloat(formData.waterCost) : 25000,
      initialElectricityReading: formData.initialElectricityReading ? parseFloat(formData.initialElectricityReading) : 0,
      initialWaterReading: formData.initialWaterReading ? parseFloat(formData.initialWaterReading) : 0,
      allowPets: formData.allowPets,
      allowCooking: formData.allowCooking,
      version: room.version,
    });

    if (ok) {
      router.push('/dashboard/landlord/rooms');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
        <Card className="p-6 space-y-4">
          <div className="h-10 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
          <div className="h-20 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
          <div className="h-40 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
        </Card>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-3xl space-y-6">
        <Breadcrumb
          items={[
            { label: 'Quản lý phòng', href: '/dashboard/landlord/rooms' },
            { label: `Chỉnh sửa #${id}` },
          ]}
        />
        <ErrorState
          title="Không tìm thấy phòng trọ"
          message={error || 'Phòng không tồn tại hoặc bạn không có quyền truy cập.'}
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl pb-10">
      <Breadcrumb
        items={[
          { label: 'Quản lý phòng', href: '/dashboard/landlord/rooms' },
          { label: `Chỉnh sửa #${room.id}` },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0226')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0227')}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/landlord/rooms')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          {tAuto('k0228')}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            {tAuto('k0229')}
          </h2>
          <Input
            label="Tiêu đề hiển thị"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            label="Địa chỉ chi tiết"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Diện tích (m²)"
              type="number"
              required
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            />
            <Input
              label="Giá thuê (VNĐ/tháng)"
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <Input
              label="Tiền đặt cọc (VNĐ)"
              type="number"
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Đơn giá điện nước & Chỉ số bàn giao ban đầu
              </span>
              <span className="text-[11px] text-stone-500">
                Chỉ số điện nước cũ làm mốc tính tiêu thụ minh bạch cho hợp đồng thuê.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Đơn giá điện (VNĐ/kWh)"
                required
                type="number"
                value={formData.electricityCost}
                onChange={(e) => setFormData({ ...formData, electricityCost: e.target.value })}
              />
              <Input
                label="Chỉ số điện ban đầu (kWh)"
                required
                type="number"
                step="0.1"
                value={formData.initialElectricityReading}
                onChange={(e) => setFormData({ ...formData, initialElectricityReading: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Đơn giá nước (VNĐ/m³ hoặc người)"
                required
                type="number"
                value={formData.waterCost}
                onChange={(e) => setFormData({ ...formData, waterCost: e.target.value })}
              />
              <Input
                label="Chỉ số nước ban đầu (m³)"
                required
                type="number"
                step="0.1"
                value={formData.initialWaterReading}
                onChange={(e) => setFormData({ ...formData, initialWaterReading: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-6 text-xs text-stone-600 dark:text-stone-300 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowPets}
                onChange={(e) => setFormData({ ...formData, allowPets: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>{tAuto('k0230')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowCooking}
                onChange={(e) => setFormData({ ...formData, allowCooking: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>{tAuto('k0231')}</span>
            </label>
          </div>
        </Card>

        {/* Real-time Image Management */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            {tAuto('k0232')}{managedImages.length}/10)
          </h2>
          <ImageManager
            initialImages={managedImages}
            onUploadAsync={async (files) => {
              await uploadImages(files);
            }}
            onSetCoverAsync={async (imgId) => {
              await setCover(imgId);
            }}
            onDeleteAsync={async (imgId) => {
              await deleteImage(imgId);
            }}
            onReorderAsync={async (updated) => {
              const matchedImages = updated
                .map((u) => backendImages.find((b) => b.id === u.id))
                .filter(Boolean) as any[];
              if (matchedImages.length > 0) {
                await reorderImages(matchedImages);
              }
            }}
          />
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            {tAuto('k0233')}
          </Button>
        </div>
      </form>
    </div>
  );
}
