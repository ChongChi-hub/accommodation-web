'use client';

import React from 'react';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { ProvinceDto, WardDto } from '@/application/dto/listing.dto';

interface NewRoomFormStepsProps {
  currentStep: number;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  provinces: ProvinceDto[];
  wards: WardDto[];
}

export function NewRoomFormSteps({
  currentStep,
  formData,
  setFormData,
  provinces,
  wards,
}: NewRoomFormStepsProps) {
  if (currentStep === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">Bước 1: Địa chỉ và loại hình</h2>
        <Input
          label="Tiêu đề bài đăng"
          required
          placeholder="VD: Chung cư mini ban công thoáng ngõ 92 Trần Thái Tông"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Loại phòng"
            options={[
              { value: 'MINI_APARTMENT', label: 'Chung cư mini' },
              { value: 'STUDIO', label: 'Căn hộ Studio' },
              { value: 'APARTMENT', label: 'Căn hộ nguyên căn' },
              { value: 'HOMESTAY', label: 'Phòng trọ cao cấp' },
            ]}
            value={formData.roomType}
            onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
          />
          <Select
            label="Tỉnh / Thành phố"
            options={
              provinces.length > 0
                ? provinces.map((p) => ({ value: p.code, label: p.name }))
                : [
                    { value: 'HN', label: 'Hà Nội' },
                    { value: 'HCM', label: 'Hồ Chí Minh' },
                    { value: 'DNG', label: 'Đà Nẵng' },
                  ]
            }
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
          />
        </div>
        <Select
          label="Phường / Xã"
          options={
            wards.length > 0
              ? wards.map((w) => ({ value: w.code, label: w.name }))
              : [{ value: 'HN_DVH', label: 'Phường Dịch Vọng Hậu' }]
          }
          value={formData.ward}
          onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
        />
        <Input
          label="Địa chỉ chi tiết (số nhà, ngõ, tên đường theo mô hình 2 cấp)"
          required
          placeholder="VD: Số 15 ngõ 92 Trần Thái Tông, Phường Dịch Vọng Hậu, Hà Nội"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">Bước 2: Diện tích & Chi phí</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Diện tích sử dụng (m²)"
            required
            type="number"
            placeholder="VD: 32"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
          />
          <Input
            label="Sức chứa tối đa (người)"
            required
            type="number"
            value={formData.maxOccupants}
            onChange={(e) => setFormData({ ...formData, maxOccupants: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Giá thuê mỗi tháng (VNĐ)"
            required
            type="number"
            placeholder="VD: 4800000"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
          <Input
            label="Tiền đặt cọc (VNĐ)"
            type="number"
            placeholder="VD: 4800000"
            value={formData.deposit}
            onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">Bước 3: Tiện ích & Quy định</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {['Điều hòa 2 chiều', 'Bình nóng lạnh', 'Máy giặt riêng', 'Tủ lạnh Inverter', 'Thang máy thẻ từ', 'Ban công thoáng'].map((item) => (
            <label key={item} className="flex items-center gap-2 p-3 rounded-xl border border-border cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <div className="pt-2 flex gap-6 text-xs text-foreground-muted">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowPets}
              onChange={(e) => setFormData({ ...formData, allowPets: e.target.checked })}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Cho phép nuôi thú cưng</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowCooking}
              onChange={(e) => setFormData({ ...formData, allowCooking: e.target.checked })}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Cho phép nấu ăn trong phòng</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
}

