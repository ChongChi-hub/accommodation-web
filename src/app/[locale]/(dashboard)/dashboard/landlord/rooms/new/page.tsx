'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Stepper } from '@/presentation/components/ui/Stepper';
import { Button } from '@/presentation/components/ui/Button';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { ImageManager } from '@/presentation/components/rooms/ImageManager';
import { ManagedImage } from '@/presentation/components/rooms/ImageCard';
import { NewRoomFormSteps } from '@/presentation/components/rooms/NewRoomFormSteps';
import { ProvinceDto, WardDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, ArrowRight, CheckCircle2, Save, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function NewRoomPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [kycApproved, setKycApproved] = useState(true);

  const [formData, setFormData] = useState({
    title: '', roomType: 'MINI_APARTMENT', province: 'HN', ward: 'HN_DVH',
    address: '', area: '', price: '', deposit: '', maxOccupants: '2',
    allowPets: false, allowCooking: true,
  });

  useEffect(() => {
    container.listing.getLocationsUseCase.getProvinces().then(setProvinces).catch(() => {});
    container.kyc.landlordKycUseCases.getKycStatus().then((k) => setKycApproved(k.status === 'APPROVED')).catch(() => {});
  }, []);

  useEffect(() => {
    if (formData.province) {
      container.listing.getLocationsUseCase.getWards(formData.province)
        .then((wds) => {
          setWards(wds);
          if (wds.length > 0 && !wds.some((w) => w.code === formData.ward)) {
            setFormData((prev) => ({ ...prev, ward: wds[0].code }));
          }
        })
        .catch(() => setWards([]));
    }
  }, [formData.province]);

  const steps = [
    { id: 1, title: 'Địa chỉ & Loại phòng' },
    { id: 2, title: 'Diện tích & Giá cả' },
    { id: 3, title: 'Tiện ích & Quy định' },
    { id: 4, title: 'Hình ảnh & Xác nhận' },
  ];

  const handleCreateRoom = async (submitForReview: boolean) => {
    if (!formData.title.trim() || !formData.address.trim() || !formData.area || !formData.price) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }
    if (submitForReview && !kycApproved) {
      toast.error('Chủ trọ cần hoàn tất xác minh danh tính (KYC) trước khi gửi duyệt bài đăng.');
      router.push('/dashboard/landlord/kyc');
      return;
    }
    const validImages = images.filter((img) => !img.error && img.file);
    if (submitForReview && validImages.length < 3) {
      toast.error('Cần tối thiểu 3 ảnh thực tế hợp lệ để gửi duyệt bài đăng.');
      return;
    }

    setIsSubmitting(true);
    let createdRoomId: string | number | null = null;
    try {
      const selectedWard = wards.find((w) => w.code === formData.ward);
      const newRoom = await container.landlord.landlordRoomRepository.createRoom({
        title: formData.title.trim(), address: formData.address.trim(),
        provinceCode: formData.province, wardCode: formData.ward,
        wardId: selectedWard?.id, roomTypeCode: formData.roomType,
        area: parseFloat(formData.area), maxOccupants: parseInt(formData.maxOccupants, 10) || 2,
        price: parseFloat(formData.price), deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
        allowPets: formData.allowPets, allowCooking: formData.allowCooking,
        submitForReview: false,
      });
      createdRoomId = newRoom.id;

      if (validImages.length > 0) {
        await container.landlord.landlordRoomRepository.uploadImages(newRoom.id, validImages.map((i) => i.file as File));
      }

      if (submitForReview) {
        await container.landlord.landlordRoomRepository.submitForReview(newRoom.id);
        toast.success('Gửi duyệt phòng trọ thành công!');
      } else {
        toast.success('Đã lưu bản nháp bài đăng thành công.');
      }
      router.push('/dashboard/landlord/rooms');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (createdRoomId) {
        toast.error(`Bài đăng đã lưu bản nháp (#${createdRoomId}), nhưng chưa thể gửi duyệt: ${msg}`);
        router.push('/dashboard/landlord/rooms');
      } else {
        toast.error(msg || 'Lỗi khi lưu phòng trọ');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-10">
      <Breadcrumb items={[{ label: 'Quản lý phòng', href: '/dashboard/landlord/rooms' }, { label: 'Đăng phòng mới' }]} />
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Đăng tin cho thuê phòng trọ</h1>
        <p className="text-xs text-foreground-muted mt-0.5">Điền đầy đủ các thông tin minh bạch để tin đăng được duyệt nhanh nhất.</p>
      </div>
      <Stepper steps={steps} currentStep={currentStep} />
      <Card className="p-6">
        <NewRoomFormSteps currentStep={currentStep} formData={formData} setFormData={setFormData} provinces={provinces} wards={wards} />
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Bước 4: Hình ảnh thực tế phòng trọ</h2>
            {!kycApproved && (
              <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/20 text-xs text-warning-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-warning" />
                  <span>Bạn chưa xác minh danh tính chủ trọ. Bài đăng chỉ có thể lưu ở dạng bản nháp (DRAFT).</span>
                </div>
                <Link href="/dashboard/landlord/kyc" className="font-semibold underline ml-2">Xác minh</Link>
              </div>
            )}
            <ImageManager initialImages={images} onChange={setImages} disabled={isSubmitting} />
          </div>
        )}
        <div className="pt-6 border-t border-border flex items-center justify-between gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0 || isSubmitting} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Quay lại</Button>
          <div className="flex items-center gap-2">
            {currentStep === 3 && (
              <Button type="button" variant="outline" size="sm" onClick={() => handleCreateRoom(false)} disabled={isSubmitting} leftIcon={<Save className="w-3.5 h-3.5" />}>Lưu nháp</Button>
            )}
            <Button type="button" variant="primary" size="sm" onClick={() => (currentStep < 3 ? setCurrentStep((s) => s + 1) : handleCreateRoom(true))} isLoading={isSubmitting} rightIcon={currentStep === 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}>
              {currentStep === 3 ? 'Gửi duyệt tin đăng' : 'Tiếp tục'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
