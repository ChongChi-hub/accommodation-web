'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';
import { LandlordKycStatusCard } from '@/presentation/components/kyc/LandlordKycStatusCard';
import { LandlordKycForm } from '@/presentation/components/kyc/LandlordKycForm';
import { toast } from '@/presentation/stores/toast.store';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';

export default function TenantKycPage() {
  const t = useTranslations('kyc');
  const [kycStatus, setKycStatus] = useState<LandlordKycStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceShowForm, setForceShowForm] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await container.kyc.landlordKycUseCases.getKycStatus();
      setKycStatus(res);
      setForceShowForm(false);
    } catch {
      toast.error('Lỗi tải trạng thái xác minh danh tính');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmit = async (data: {
    fullNameOnId: string;
    idNumber: string;
    phone?: string;
    dateOfBirth: string;
    issueDate: string;
    issuePlace: string;
    frontImage: File;
    backImage: File;
    consent: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      const updated = await container.kyc.landlordKycUseCases.submitKyc(data);
      setKycStatus(updated);
      setForceShowForm(false);
      toast.success(t('submitSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi nộp hồ sơ xác minh');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showForm =
    forceShowForm ||
    !kycStatus ||
    kycStatus.status === 'NONE' ||
    (kycStatus.status === 'REJECTED' && forceShowForm);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Xác minh danh tính (eKYC)
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Hoàn tất định danh Căn cước công dân để ký hợp đồng thuê trọ điện tử và nhận bảo vệ tiền cọc trên Tổ Ấm
          </p>
        </div>

        {forceShowForm && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => setForceShowForm(false)}
          >
            {t('close')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : showForm ? (
        <LandlordKycForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      ) : (
        <LandlordKycStatusCard
          status={kycStatus!}
          onResubmitClick={() => setForceShowForm(true)}
          role="TENANT"
        />
      )}
    </div>
  );
}
