'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { toast } from '@/presentation/stores/toast.store';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  Maximize2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { CccdQrScannerModal } from './CccdQrScannerModal';
import { decodeQrFromImageFile, ParsedCccdQr } from './cccd-qr-parser';

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

const VIETNAMESE_NAME_REGEX = /^[A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ\s]+$/i;

export function LandlordKycForm({ onSubmit, isSubmitting }: LandlordKycFormProps) {
  const t = useTranslations('kyc');
  const [fullNameOnId, setFullNameOnId] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [issuePlace, setIssuePlace] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<{ src: string; title: string } | null>(null);
  const [consent, setConsent] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview]);

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleApplyQr = (data: ParsedCccdQr) => {
    setFullNameOnId(data.fullName);
    setIdNumber(data.idNumber);
    if (data.dateOfBirth) setDateOfBirth(data.dateOfBirth);
    if (data.issueDate) setIssueDate(data.issueDate);
    if (data.issuePlace) setIssuePlace(data.issuePlace);

    setErrors((prev) => {
      const next = { ...prev };
      delete next.fullNameOnId;
      delete next.idNumber;
      if (data.dateOfBirth) delete next.dateOfBirth;
      if (data.issueDate) delete next.issueDate;
      if (data.issuePlace) delete next.issuePlace;
      return next;
    });
  };

  const handleRemove = (side: 'front' | 'back') => {
    if (side === 'front') {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontImage(null);
      setFrontPreview(null);
      const input = document.getElementById('front-id-file') as HTMLInputElement;
      if (input) input.value = '';
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackImage(null);
      setBackPreview(null);
      const input = document.getElementById('back-id-file') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('uploadTip'));
      return;
    }
    if (side === 'front') {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontImage(file);
      setFrontPreview(URL.createObjectURL(file));
      clearFieldError('frontImage');

      // Tự động quét mã QR nếu có trên ảnh mặt trước CCCD
      decodeQrFromImageFile(file)
        .then((parsed) => {
          if (parsed) {
            handleApplyQr(parsed);
            toast.success(t('autoDetectedToast'));
          }
        })
        .catch(() => {});
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackImage(file);
      setBackPreview(URL.createObjectURL(file));
      clearFieldError('backImage');
    }
  };

  const validateAll = (): { isValid: boolean; newErrors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    // 1. fullNameOnId
    const trimmedName = fullNameOnId.trim();
    if (!trimmedName) {
      newErrors.fullNameOnId = t('errFullNameRequired');
    } else {
      const words = trimmedName.split(/\s+/).filter(Boolean);
      if (words.length < 2) {
        newErrors.fullNameOnId = t('errFullNameMinWords');
      } else if (!VIETNAMESE_NAME_REGEX.test(trimmedName)) {
        newErrors.fullNameOnId = t('errFullNameInvalid');
      } else if (trimmedName.length < 3 || trimmedName.length > 100) {
        newErrors.fullNameOnId = t('errFullNameLength');
      }
    }

    // 2. idNumber
    const trimmedId = idNumber.trim();
    if (!trimmedId) {
      newErrors.idNumber = t('errIdNumberRequired');
    } else if (!/^[0-9]{12}$/.test(trimmedId)) {
      newErrors.idNumber = t('errIdNumberInvalid');
    }

    // 3. dateOfBirth
    if (!dateOfBirth) {
      newErrors.dateOfBirth = t('errDateOfBirthRequired');
    } else {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      if (dob > today) {
        newErrors.dateOfBirth = t('errDateOfBirthFuture');
      } else {
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.dateOfBirth = t('errDateOfBirthUnder18');
        }
      }
    }

    // 4. issueDate
    if (!issueDate) {
      newErrors.issueDate = t('errIssueDateRequired');
    } else {
      const issue = new Date(issueDate);
      const today = new Date();
      if (issue > today) {
        newErrors.issueDate = t('errIssueDateFuture');
      } else if (dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const diffYears = (issue.getTime() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
        if (diffYears < 14) {
          newErrors.issueDate = t('errIssueDateInvalidAge');
        }
      }
    }

    // 5. issuePlace
    const trimmedPlace = issuePlace.trim();
    if (!trimmedPlace) {
      newErrors.issuePlace = t('errIssuePlaceRequired');
    } else if (trimmedPlace.length < 5) {
      newErrors.issuePlace = t('errIssuePlaceMin');
    }

    // 6. frontImage
    if (!frontImage) {
      newErrors.frontImage = t('errFrontImageRequired');
    }

    // 7. backImage
    if (!backImage) {
      newErrors.backImage = t('errBackImageRequired');
    } else if (frontImage && frontImage.name === backImage.name && frontImage.size === backImage.size) {
      newErrors.backImage = t('errDuplicateImages');
    }

    // 8. consent
    if (!consent) {
      newErrors.consent = t('errConsentRequired');
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      newErrors,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, newErrors } = validateAll();
    if (!isValid) {
      setErrors(newErrors);
      toast.error(t('errFormHasErrors'));

      // Tự động cuộn và focus đến trường lỗi đầu tiên
      const firstErrorKey = Object.keys(newErrors)[0];
      const fieldIdMap: Record<string, string> = {
        fullNameOnId: 'input-fullNameOnId',
        idNumber: 'input-idNumber',
        dateOfBirth: 'input-dateOfBirth',
        issueDate: 'input-issueDate',
        issuePlace: 'input-issuePlace',
        frontImage: 'front-upload-container',
        backImage: 'back-upload-container',
        consent: 'kyc-consent-container',
      };
      const elId = fieldIdMap[firstErrorKey];
      if (elId) {
        const el = document.getElementById(elId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if ('focus' in el) (el as HTMLElement).focus();
        }
      }
      return;
    }

    if (!frontImage || !backImage) return;

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
    <>
      <Card className="p-6 border border-border">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* QR Scan Quick-Fill Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/25">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-foreground">{t('scanQrQuickFillTitle')}</h4>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-white rounded">
                    {t('recommendedBadge')}
                  </span>
                </div>
                <p className="text-[11px] text-foreground-muted mt-0.5">
                  {t('scanQrQuickFillDesc')}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsQrModalOpen(true)}
              className="border-primary/40 text-primary hover:bg-primary/10 self-start sm:self-auto flex-shrink-0 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
              {t('scanQrBtn')}
            </Button>
          </div>

          {/* Row 1: Họ tên, Số CCCD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="input-fullNameOnId"
              label={t('fullNameOnId')}
              value={fullNameOnId}
              onChange={(e) => {
                setFullNameOnId(e.target.value.toUpperCase());
                clearFieldError('fullNameOnId');
              }}
              placeholder={t('fullNameOnIdPlaceholder')}
              error={errors.fullNameOnId}
              required
            />
            <Input
              id="input-idNumber"
              label={t('idNumber')}
              value={idNumber}
              maxLength={12}
              onChange={(e) => {
                setIdNumber(e.target.value.replace(/[^0-9]/g, ''));
                clearFieldError('idNumber');
              }}
              placeholder={t('idNumberPlaceholder')}
              error={errors.idNumber}
              required
            />
          </div>

          {/* Row 2: Ngày sinh, Ngày cấp, Nơi cấp */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="input-dateOfBirth"
              label={t('dateOfBirth')}
              type="date"
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                clearFieldError('dateOfBirth');
              }}
              error={errors.dateOfBirth}
              required
            />
            <Input
              id="input-issueDate"
              label={t('issueDate')}
              type="date"
              value={issueDate}
              onChange={(e) => {
                setIssueDate(e.target.value);
                clearFieldError('issueDate');
              }}
              error={errors.issueDate}
              required
            />
            <Input
              id="input-issuePlace"
              label={t('issuePlace')}
              value={issuePlace}
              onChange={(e) => {
                setIssuePlace(e.target.value);
                clearFieldError('issuePlace');
              }}
              placeholder={t('issuePlacePlaceholder')}
              error={errors.issuePlace}
              required
            />
          </div>

          {/* Row 3: Mặt trước & Mặt sau CCCD */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-foreground">
              {t('frontImage')} & {t('backImage')}
            </label>
            <p className="text-xs text-foreground-muted">{t('uploadTip')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* MẶT TRƯỚC CCCD */}
              <div id="front-upload-container">
                <input
                  type="file"
                  id="front-id-file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFile(e, 'front')}
                />
                {frontPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-card group shadow-xs">
                    <div className="relative aspect-[16/10] bg-black/5 dark:bg-black/30 overflow-hidden flex items-center justify-center">
                      <img
                        src={frontPreview}
                        alt={t('frontImage')}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-102"
                      />

                      {/* Top overlay badges and actions */}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 text-white backdrop-blur-xs text-[11px] font-medium shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {t('frontImage')}
                        </span>

                        <div className="flex items-center gap-1.5 pointer-events-auto">
                          <button
                            type="button"
                            onClick={() => setPreviewModalImg({ src: frontPreview, title: t('frontImage') })}
                            className="p-1.5 rounded-lg bg-black/65 hover:bg-black/85 text-white backdrop-blur-xs transition-colors shadow-xs"
                            title={t('viewLargeImage')}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <label
                            htmlFor="front-id-file"
                            className="p-1.5 rounded-lg bg-black/65 hover:bg-black/85 text-white backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                            title={t('changeImage')}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemove('front')}
                            className="p-1.5 rounded-lg bg-black/65 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors shadow-xs"
                            title={t('deleteImage')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom info strip */}
                      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-center justify-between text-white text-[11px]">
                        <span className="truncate max-w-[180px] font-medium drop-shadow-xs">
                          {frontImage?.name}
                        </span>
                        {frontImage?.size && (
                          <span className="text-stone-300 text-[10px] shrink-0 ml-2">
                            {(frontImage.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors bg-card/40 ${
                      errors.frontImage
                        ? 'border-rose-500 bg-rose-500/5 hover:border-rose-600'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <label htmlFor="front-id-file" className="cursor-pointer space-y-2 block">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                          errors.frontImage
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t('frontImage')}</p>
                        <p className="text-[11px] text-foreground-muted mt-0.5">{t('uploadFrontDesc')}</p>
                      </div>
                    </label>
                  </div>
                )}
                {errors.frontImage && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.frontImage}</span>
                  </p>
                )}
              </div>

              {/* MẶT SAU CCCD */}
              <div id="back-upload-container">
                <input
                  type="file"
                  id="back-id-file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFile(e, 'back')}
                />
                {backPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-card group shadow-xs">
                    <div className="relative aspect-[16/10] bg-black/5 dark:bg-black/30 overflow-hidden flex items-center justify-center">
                      <img
                        src={backPreview}
                        alt={t('backImage')}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-102"
                      />

                      {/* Top overlay badges and actions */}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 text-white backdrop-blur-xs text-[11px] font-medium shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {t('backImage')}
                        </span>

                        <div className="flex items-center gap-1.5 pointer-events-auto">
                          <button
                            type="button"
                            onClick={() => setPreviewModalImg({ src: backPreview, title: t('backImage') })}
                            className="p-1.5 rounded-lg bg-black/65 hover:bg-black/85 text-white backdrop-blur-xs transition-colors shadow-xs"
                            title={t('viewLargeImage')}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <label
                            htmlFor="back-id-file"
                            className="p-1.5 rounded-lg bg-black/65 hover:bg-black/85 text-white backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                            title={t('changeImage')}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemove('back')}
                            className="p-1.5 rounded-lg bg-black/65 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors shadow-xs"
                            title={t('deleteImage')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom info strip */}
                      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-center justify-between text-white text-[11px]">
                        <span className="truncate max-w-[180px] font-medium drop-shadow-xs">
                          {backImage?.name}
                        </span>
                        {backImage?.size && (
                          <span className="text-stone-300 text-[10px] shrink-0 ml-2">
                            {(backImage.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors bg-card/40 ${
                      errors.backImage
                        ? 'border-rose-500 bg-rose-500/5 hover:border-rose-600'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <label htmlFor="back-id-file" className="cursor-pointer space-y-2 block">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                          errors.backImage
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t('backImage')}</p>
                        <p className="text-[11px] text-foreground-muted mt-0.5">{t('uploadBackDesc')}</p>
                      </div>
                    </label>
                  </div>
                )}
                {errors.backImage && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.backImage}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Checkbox cam kết */}
          <div
            id="kyc-consent-container"
            className={`p-3.5 rounded-xl border transition-colors ${
              errors.consent
                ? 'bg-rose-500/5 border-rose-500'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="kyc-consent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  clearFieldError('consent');
                }}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                required
              />
              <label htmlFor="kyc-consent" className="text-xs text-foreground cursor-pointer leading-relaxed">
                {t('consentCheckbox')}
              </label>
            </div>
            {errors.consent && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-2 pl-6">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.consent}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      </Card>

      <CccdQrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onApply={handleApplyQr}
      />

      {previewModalImg && (
        <Dialog
          isOpen={!!previewModalImg}
          onClose={() => setPreviewModalImg(null)}
          title={previewModalImg.title}
          size="lg"
        >
          <div className="flex flex-col items-center justify-center p-2">
            <img
              src={previewModalImg.src}
              alt={previewModalImg.title}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-md"
            />
          </div>
        </Dialog>
      )}
    </>
  );
}
