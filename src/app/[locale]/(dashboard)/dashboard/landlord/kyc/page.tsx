'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';
import { LandlordKycStatusCard } from '@/presentation/components/kyc/LandlordKycStatusCard';
import { LandlordKycForm } from '@/presentation/components/kyc/LandlordKycForm';
import { toast } from '@/presentation/stores/toast.store';
import { ShieldCheck, ArrowLeft, UserCheck, FileCheck } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { PropertyOwnershipKycSection } from '@/presentation/components/kyc/PropertyOwnershipKycSection';

export default function LandlordKycPage() {
  const t = useTranslations('kyc');
  const [kycStatus, setKycStatus] = useState<LandlordKycStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceShowForm, setForceShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'property'>('identity');

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await container.kyc.landlordKycUseCases.getKycStatus();
      setKycStatus(res);
      setForceShowForm(false);
    } catch {
      toast.error('Loi tai trang thai xac minh danh tinh');
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
      toast.error(err instanceof Error ? err.message : 'Loi nop ho so xac minh');
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
            {t('landlordTitle')}
          </h1>
          <p className="text-xs text-foreground-muted mt-1">{t('landlordSubtitle')}</p>
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

      <div className="flex border-b border-border gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'identity'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          1. Định danh cá nhân (CCCD)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('property')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'property'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          2. Xác minh quyền cho thuê (Sổ đỏ / KYC-03)
        </button>
      </div>

      {activeTab === 'property' ? (
        <PropertyOwnershipKycSection />
      ) : (
        !isLoading && (
          <>
            {showForm ? (
              <LandlordKycForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            ) : (
              <LandlordKycStatusCard
                status={kycStatus!}
                onResubmitClick={() => setForceShowForm(true)}
              />
            )}
          </>
        )
      )}
    </div>
  );
}
