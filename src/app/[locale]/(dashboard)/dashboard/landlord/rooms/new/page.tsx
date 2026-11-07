'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Stepper } from '@/presentation/components/ui/Stepper';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { FileUpload } from '@/presentation/components/ui/FileUpload';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { toast } from '@/presentation/stores/toast.store';
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, ArrowRight, CheckCircle2, Upload } from 'lucide-react';

export default function NewRoomPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    roomType: 'MINI_APARTMENT',
    province: 'HN',
    district: 'HN-CG',
    address: '',
    area: '',
    price: '',
    deposit: '',
    maxOccupants: '2',
    allowPets: false,
    allowCooking: true,
  });

  const steps = [
    { id: 1, title: 'Địa chỉ & Loại phòng' },
    { id: 2, title: 'Diện tích & Giá cả' },
    { id: 3, title: 'Tiện ích & Quy định' },
    { id: 4, title: 'Hình ảnh & Xác nhận' },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        toast.success('Đăng tin phòng trọ thành công! Tin sẽ được duyệt trong vòng 2 giờ.');
        router.push('/dashboard/landlord/rooms');
      }, 700);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb
        items={[
          { label: 'Quản lý phòng', href: '/dashboard/landlord/rooms' },
          { label: 'Đăng phòng mới' },
        ]}
      />

      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Đăng tin cho thuê phòng trọ
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Điền đầy đủ các thông tin minh bạch để tin đăng được duyệt nhanh nhất.
        </p>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <Card className="p-6">
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Bước 1: Địa chỉ và loại hình</h2>
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
                options={[
                  { value: 'HN', label: 'Hà Nội' },
                  { value: 'HCM', label: 'Hồ Chí Minh' },
                  { value: 'DNG', label: 'Đà Nẵng' },
                ]}
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              />
            </div>
            <Input
              label="Địa chỉ chi tiết (số nhà, ngõ, tên đường)"
              required
              placeholder="Số 15 ngõ 92 Trần Thái Tông, Dịch Vọng Hậu"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Bước 2: Diện tích & Chi phí</h2>
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
                required
                type="number"
                placeholder="VD: 4800000"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Bước 3: Tiện ích & Quy định</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {['Điều hòa 2 chiều', 'Bình nóng lạnh', 'Máy giặt riêng', 'Tủ lạnh Inverter', 'Thang máy thẻ từ', 'Ban công thoáng'].map((item) => (
                <label key={item} className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <div className="pt-2 flex gap-6 text-xs text-stone-600 dark:text-stone-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowPets}
                  onChange={(e) => setFormData({ ...formData, allowPets: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Cho phép nuôi thú cưng</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowCooking}
                  onChange={(e) => setFormData({ ...formData, allowCooking: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Cho phép nấu ăn trong phòng</span>
              </label>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Bước 4: Hình ảnh thực tế phòng trọ</h2>
            <FileUpload
              label="Tải lên ít nhất 3 ảnh thực tế của căn phòng"
              multiple
              accept="image/*"
              onFilesSelected={() => toast.info('Đã nhận diện các ảnh tải lên')}
            />
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-xs text-teal-800 dark:text-teal-300">
              Ảnh chụp rõ ràng ban công, giường ngủ, khu vực bếp và nhà vệ sinh sẽ giúp phòng được duyệt và có khách liên hệ nhanh hơn 3 lần.
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Quay lại
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleNext}
            isLoading={isSubmitting}
            rightIcon={currentStep === 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          >
            {currentStep === 3 ? 'Gửi duyệt tin đăng' : 'Tiếp tục'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

