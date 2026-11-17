'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { FileUpload } from '@/presentation/components/ui/FileUpload';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';
import { toast } from '@/presentation/stores/toast.store';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Clock,
  ShieldAlert,
  RotateCcw,
  FileCheck2,
} from 'lucide-react';

export default function TenantKycPage() {
  const tAuto = useTranslations('autoI18n');
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<LandlordKycStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceEdit, setForceEdit] = useState(false);

  // Form inputs for new submission
  const [fullNameOnId, setFullNameOnId] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [issuePlace, setIssuePlace] = useState('Cục Cảnh sát QLHC về TTXH');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [consent, setConsent] = useState(true);

  const fetchKycStatus = async () => {
    setIsLoading(true);
    try {
      const res = await container.kyc.landlordKycUseCases.getKycStatus();
      setKycStatus(res);
      if (res?.fullNameOnId) {
        setFullNameOnId(res.fullNameOnId);
      } else if (user?.fullName) {
        setFullNameOnId(user.fullName);
      }
    } catch {
      // If error or fresh user with no profile, fallback gracefully
      setKycStatus(null);
      if (user?.fullName) setFullNameOnId(user.fullName);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, [user?.fullName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber || !/^[0-9]{12}$/.test(idNumber.trim())) {
      toast.error('Số Căn cước công dân phải đúng 12 chữ số');
      return;
    }
    if (!fullNameOnId.trim()) {
      toast.error('Vui lòng nhập họ và tên trên CCCD');
      return;
    }
    if (!dateOfBirth) {
      toast.error('Vui lòng chọn ngày sinh trên CCCD');
      return;
    }
    if (!issueDate) {
      toast.error('Vui lòng chọn ngày cấp CCCD');
      return;
    }
    if (!frontImage || !backImage) {
      toast.error('Vui lòng tải lên cả 2 mặt ảnh CCCD');
      return;
    }
    if (!consent) {
      toast.error('Bạn cần đồng ý với điều khoản xác thực dữ liệu cá nhân');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await container.kyc.landlordKycUseCases.submitKyc({
        fullNameOnId: fullNameOnId.trim(),
        idNumber: idNumber.trim(),
        dateOfBirth: dateOfBirth || '2000-01-01',
        issueDate: issueDate || '2021-01-01',
        issuePlace: issuePlace.trim(),
        frontImage,
        backImage,
        consent,
      });
      setKycStatus(updated);
      setForceEdit(false);
      toast.success('Hồ sơ CCCD đã được gửi thành công! Đội ngũ kiểm duyệt sẽ xử lý trong vòng 2-4 giờ.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gửi hồ sơ xác minh thất bại, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-60 rounded" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const isApproved = kycStatus?.status === 'APPROVED';
  const isPending = kycStatus?.status === 'PENDING';
  const isRejected = kycStatus?.status === 'REJECTED';
  const showForm = forceEdit || (!isApproved && !isPending && !isRejected) || (isRejected && forceEdit);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0340')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0341')}
          </p>
        </div>
        {isApproved ? (
          <Badge variant="success" size="md">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
            {tAuto('k0342')}
          </Badge>
        ) : isPending ? (
          <Badge variant="warning" size="md">
            <Clock className="w-4 h-4 mr-1 text-amber-600" />
            Đang chờ duyệt
          </Badge>
        ) : isRejected ? (
          <Badge variant="danger" size="md">
            <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
            Bị từ chối
          </Badge>
        ) : (
          <Badge variant="neutral" size="md">
            <ShieldAlert className="w-4 h-4 mr-1 text-stone-400" />
            Chưa xác minh
          </Badge>
        )}
      </div>

      {/* Trạng thái đã duyệt (APPROVED) */}
      {isApproved && (
        <Card className="p-6 space-y-4 border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Xác minh danh tính thành công
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Hồ sơ Căn cước công dân của bạn đã được kiểm duyệt và đối soát hợp lệ.
                Bạn có thể ký hợp đồng điện tử và nhận bảo hiểm tiền cọc khi thuê phòng.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
            <div>
              <span className="text-stone-500">Họ và tên trên CCCD:</span>
              <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {kycStatus.fullNameOnId || user?.fullName || '---'}
              </p>
            </div>
            <div>
              <span className="text-stone-500">Số Căn cước công dân:</span>
              <p className="font-mono font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {kycStatus.idNumberMasked || '•••• •••• ••••'}
              </p>
            </div>
            {kycStatus.issueDate && (
              <div>
                <span className="text-stone-500">Ngày cấp:</span>
                <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{kycStatus.issueDate}</p>
              </div>
            )}
            {kycStatus.issuePlace && (
              <div>
                <span className="text-stone-500">Nơi cấp:</span>
                <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{kycStatus.issuePlace}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Trạng thái đang chờ duyệt (PENDING) */}
      {isPending && (
        <Card className="p-6 space-y-4 border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Hồ sơ đang trong quá trình kiểm duyệt
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Hồ sơ xác minh CCCD của bạn đã được gửi và đang chờ nhân viên kiểm duyệt đối chiếu.
                Thời gian xử lý thông thường từ 2 - 4 giờ làm việc.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
            <p className="text-stone-500">Thông tin đã nộp:</p>
            <p className="font-semibold text-stone-900 dark:text-stone-100 mt-1">
              {kycStatus?.fullNameOnId || user?.fullName} • {kycStatus?.idNumberMasked || '••••'}
            </p>
          </div>
        </Card>
      )}

      {/* Trạng thái bị từ chối (REJECTED) */}
      {isRejected && !forceEdit && (
        <Card className="p-6 space-y-4 border-red-500/20 bg-red-50/20 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Hồ sơ xác minh chưa được duyệt
              </h2>
              <p className="text-xs text-red-700 dark:text-red-300">
                Lý do: {kycStatus?.rejectReasonNote || 'Ảnh chụp bị mờ, lóa hoặc thông tin trên CCCD không trùng khớp.'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setForceEdit(true)}
          >
            Nộp lại hồ sơ xác minh
          </Button>
        </Card>
      )}

      {/* Form nộp KYC mới (cho tài khoản mới hoặc khi nộp lại) */}
      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên trên CCCD"
                required
                value={fullNameOnId}
                onChange={(e) => setFullNameOnId(e.target.value)}
                placeholder="NGUYỄN VĂN A"
              />
              <Input
                label="Số Căn cước công dân (12 số)"
                required
                maxLength={12}
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="001202000000"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Ngày sinh"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              <Input
                label="Ngày cấp CCCD"
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
              <Input
                label="Nơi cấp"
                required
                value={issuePlace}
                onChange={(e) => setIssuePlace(e.target.value)}
                placeholder="Cục Cảnh sát QLHC về TTXH"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FileUpload
                  label="Ảnh mặt trước CCCD"
                  accept="image/*"
                  onFilesSelected={(files) => {
                    if (files && files[0]) {
                      setFrontImage(files[0]);
                      toast.info('Đã chọn ảnh mặt trước CCCD');
                    }
                  }}
                />
                {frontImage && (
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-1 flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5" /> {frontImage.name}
                  </p>
                )}
              </div>

              <div>
                <FileUpload
                  label="Ảnh mặt sau CCCD"
                  accept="image/*"
                  onFilesSelected={(files) => {
                    if (files && files[0]) {
                      setBackImage(files[0]);
                      toast.info('Đã chọn ảnh mặt sau CCCD');
                    }
                  }}
                />
                {backImage && (
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-1 flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5" /> {backImage.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                id="tenant-kyc-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="tenant-kyc-consent" className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                Tôi cam kết thông tin và hình ảnh CCCD cung cấp là chính xác, đồng ý cho hệ thống xử lý nhằm phục vụ mục đích xác minh danh tính và ký hợp đồng thuê trọ.
              </label>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-700" />
              <p className="leading-relaxed">
                {tAuto('k0343')}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800 gap-3">
              {forceEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForceEdit(false)}
                >
                  Hủy bỏ
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                {tAuto('k0344')}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
