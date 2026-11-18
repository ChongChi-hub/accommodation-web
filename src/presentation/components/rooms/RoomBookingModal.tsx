'use client';
import { useTranslations } from 'next-intl';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { DatePicker } from '@/presentation/components/ui/DatePicker';
import { container } from '@/infrastructure/di/container';
import { ApiError } from '@/infrastructure/http/api-client';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { toast } from '@/presentation/stores/toast.store';
import { generateIdempotencyKey } from '@/shared/utils/format-vnd';
import { APP_ROUTES } from '@/shared/routes';
import { Link, useRouter } from '@/i18n/routing';
import { AlertCircle, ArrowRight, Calendar, Clock, Send } from 'lucide-react';

export interface RoomBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  roomAddress?: string;
  roomCoverThumbKey?: string;
  roomId?: number | string;
  landlordId?: number | string;
  type: 'appointment' | 'rental';
}

function getLocalDateString(daysOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeTimeHHMM(rawTime: string): string {
  const match = rawTime.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '09:00';
  const hh = match[1].padStart(2, '0');
  const mm = match[2];
  return `${hh}:${mm}`;
}

export function RoomBookingModal({
  isOpen,
  onClose,
  roomTitle,
  roomAddress,
  roomCoverThumbKey,
  roomId,
  landlordId,
  type,
}: RoomBookingModalProps) {
  const tAuto = useTranslations('autoI18n');
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const todayStr = getLocalDateString(0);
  const tomorrowStr = getLocalDateString(1);

  const [date, setDate] = useState(tomorrowStr);
  const [time, setTime] = useState('09:00');
  const [numOccupants, setNumOccupants] = useState('1');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const isAppointment = type === 'appointment';

  useEffect(() => {
    if (isOpen) {
      setDate(getLocalDateString(1));
      setTime('09:00');
      setNumOccupants('1');
      setNote('');
      setErrorMsg(null);
      setErrorCode(null);
      setIsSubmitting(false);
    }
  }, [isOpen, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);
    setErrorCode(null);

    if (!date) {
      const msg = 'Vui lòng chọn ngày dự kiến.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    const hasRoomId = roomId !== undefined && roomId !== null && String(roomId).trim() !== '';
    const hasLandlordId = landlordId !== undefined && landlordId !== null && String(landlordId).trim() !== '';
    if (!hasRoomId || !hasLandlordId) {
      const msg = 'Thiếu thông tin phòng hoặc chủ nhà.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (isAppointment) {
      const safeTime = normalizeTimeHHMM(time || '09:00');
      const parsedDate = new Date(`${date}T${safeTime}:00+07:00`);
      if (Number.isNaN(parsedDate.getTime())) {
        const msg = 'Ngày hoặc giờ xem phòng không hợp lệ.';
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      if (parsedDate.getTime() < Date.now() - 60_000) {
        const msg = 'Thời gian đặt lịch xem phòng phải ở thời điểm trong tương lai.';
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      setIsSubmitting(true);
      try {
        await container.appointment.appointmentRepository.createAppointment({
          roomId: String(roomId),
          landlordId: String(landlordId),
          scheduledStart: parsedDate.toISOString(),
          roomTitle,
          roomAddress: roomAddress || undefined,
          roomCoverThumbKey: roomCoverThumbKey || undefined,
          contactName: user?.fullName || undefined,
          contactPhone: user?.phone || undefined,
          contactEmail: user?.email || undefined,
          tenantNote: note.trim() || undefined,
        });
        toast.success('Đã đặt lịch hẹn xem phòng thành công!');
        onClose();
      } catch (err: unknown) {
        if (err instanceof ApiError && err.statusCode === 401) {
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
          onClose();
          const returnUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : '';
          router.push(`/login${returnUrl ? `?returnUrl=${returnUrl}` : ''}`);
          return;
        }
        const msg = err instanceof Error && err.message ? err.message : 'Không thể đặt lịch xem phòng lúc này.';
        const code = err instanceof ApiError ? err.errorCode : null;
        setErrorMsg(msg);
        setErrorCode(code);
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (date < todayStr) {
      const msg = 'Ngày dọn vào phải từ hôm nay trở đi.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      await container.rentalRequest.rentalRequestRepository.createRequest({
        roomId: String(roomId),
        landlordId: String(landlordId),
        proposedMoveInDate: date,
        numOccupants: Math.max(1, Math.min(10, Number(numOccupants) || 1)),
        message: note.trim() || undefined,
        idempotencyKey: generateIdempotencyKey('rent'),
      });
      toast.success('Đã gửi yêu cầu thuê phòng thành công! Chủ trọ sẽ xét duyệt trong 24 giờ.');
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 401) {
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
        onClose();
        const returnUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : '';
        router.push(`/login${returnUrl ? `?returnUrl=${returnUrl}` : ''}`);
        return;
      }
      const msg = err instanceof Error && err.message ? err.message : 'Không thể gửi yêu cầu thuê phòng lúc này.';
      const code = err instanceof ApiError ? err.errorCode : null;
      setErrorMsg(msg);
      setErrorCode(code);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isAppointment ? 'Đặt lịch hẹn xem phòng' : 'Gửi yêu cầu thuê phòng'}
      description={roomTitle}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
        <DatePicker
          label={isAppointment ? 'Ngày xem phòng dự kiến' : 'Ngày bắt đầu dọn vào'}
          min={todayStr}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errorMsg) {
              setErrorMsg(null);
              setErrorCode(null);
            }
          }}
        />

        {isAppointment ? (
          <Input
            label="Khung giờ xem phòng"
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              if (errorMsg) {
                setErrorMsg(null);
                setErrorCode(null);
              }
            }}
            leftIcon={<Clock className="w-4 h-4" />}
          />
        ) : (
          <Input
            label="Số lượng người ở dự kiến"
            type="number"
            min={1}
            max={10}
            value={numOccupants}
            onChange={(e) => {
              setNumOccupants(e.target.value);
              if (errorMsg) {
                setErrorMsg(null);
                setErrorCode(null);
              }
            }}
          />
        )}

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            {tAuto('k0564')}
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isAppointment
                ? 'Ví dụ: Em muốn qua xem phòng và hỏi thêm về chỗ để xe...'
                : 'Ví dụ: Em đi làm văn phòng, ở sạch sẽ và muốn thuê lâu dài...'
            }
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-700 dark:text-rose-300 space-y-2"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
            {errorCode === 'KYC_NOT_VERIFIED' && (
              <div className="pl-6">
                <Link
                  href={APP_ROUTES.tenantKyc}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  <span>Xác thực CCCD (KYC) ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            {errorCode === 'EMAIL_NOT_VERIFIED' && (
              <div className="pl-6">
                <Link
                  href={APP_ROUTES.tenantSecurity}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  <span>Xác minh Email ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            {tAuto('k0469')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={isAppointment ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          >
            {isSubmitting
              ? 'Đang gửi...'
              : isAppointment
                ? 'Xác nhận đặt lịch'
                : 'Gửi yêu cầu thuê'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
