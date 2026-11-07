'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface LandlordKycFormProps {
  onSubmit: (data: {
    fullNameOnId: string;
    idNumber: string;
    dateOfBirth: string;
    issueDate: string;
    issuePlace: string;
    frontImage: File;
    backImage: File;
    consent: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function LandlordKycForm({ onSubmit, isSubmitting }: LandlordKycFormProps) {
  const t = useTranslations('kyc');
  const [fullNameOnId, setFullNameOnId] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [issuePlace, setIssuePlace] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('uploadTip'));
      return;
    }
    if (side === 'front') setFrontImage(file);
    else setBackImage(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage || !backImage) {
      toast.error('Vui long tai len ca 2 mat CCCD');
      return;
    }
    if (!consent) {
      toast.error('Ban can dong y voi dieu khoan xu ly du lieu');
      return;
    }
    onSubmit({
      fullNameOnId: fullNameOnId.trim(),
      idNumber: idNumber.trim(),
      dateOfBirth,
      issueDate,
      issuePlace: issuePlace.trim(),
      frontImage,
      backImage,
      consent,
    });
  };

  return (
    <Card className="p-6 border border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('fullNameOnId')}
            value={fullNameOnId}
            onChange={(e) => setFullNameOnId(e.target.value.toUpperCase())}
            placeholder={t('fullNameOnIdPlaceholder')}
            required
          />
          <Input
            label={t('idNumber')}
            value={idNumber}
            maxLength={12}
            onChange={(e) => setIdNumber(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder={t('idNumberPlaceholder')}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={t('dateOfBirth')}
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
          <Input
            label={t('issueDate')}
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
          <Input
            label={t('issuePlace')}
            value={issuePlace}
            onChange={(e) => setIssuePlace(e.target.value)}
            placeholder={t('issuePlacePlaceholder')}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground">
            {t('frontImage')} & {t('backImage')}
          </label>
          <p className="text-xs text-foreground-muted">{t('uploadTip')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="front-id-file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFile(e, 'front')}
              />
              <label htmlFor="front-id-file" className="cursor-pointer space-y-2 block">
                {frontImage ? (
                  <div className="flex items-center justify-center gap-2 text-success text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="truncate max-w-[200px]">{frontImage.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-foreground-muted mx-auto" />
                    <p className="text-xs font-semibold text-foreground">{t('frontImage')}</p>
                  </>
                )}
              </label>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="back-id-file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFile(e, 'back')}
              />
              <label htmlFor="back-id-file" className="cursor-pointer space-y-2 block">
                {backImage ? (
                  <div className="flex items-center justify-center gap-2 text-success text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="truncate max-w-[200px]">{backImage.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-foreground-muted mx-auto" />
                    <p className="text-xs font-semibold text-foreground">{t('backImage')}</p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex items-start gap-3">
          <input
            type="checkbox"
            id="kyc-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded border-border text-primary focus:ring-primary"
            required
          />
          <label htmlFor="kyc-consent" className="text-xs text-foreground cursor-pointer leading-relaxed">
            {t('consentCheckbox')}
          </label>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!consent || !frontImage || !backImage || idNumber.length !== 12}
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

