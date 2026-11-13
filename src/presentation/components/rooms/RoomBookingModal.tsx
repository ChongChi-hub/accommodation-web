'use client';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { DatePicker } from '@/presentation/components/ui/DatePicker';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { generateIdempotencyKey } from '@/shared/utils/format-vnd';
import { downloadAppointmentIcs } from '@/shared/utils/appointment-ics';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { Calendar, Clock, Send, Phone, CheckCircle2 } from 'lucide-react';

export interface RoomBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  roomId?: number | string;
  landlordId?: number | string;
  type: 'appointment' | 'rental';
}

export function RoomBookingModal({
  isOpen,
  onClose,
  roomTitle,
  roomId,
  landlordId,
  type,
}: RoomBookingModalProps) {
  const tAuto = useTranslations('autoI18n');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [phone, setPhone] = useState('0901000001');
  const [numOccupants, setNumOccupants] = useState('1');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<ViewingAppointmentItem | null>(null);

  const isAppointment = type === 'appointment';

  const handleClose = () => {
    setCreatedAppointment(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Vui lòng chọn ngày dự kiến.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (!roomId || !landlordId) {
        throw new Error('Thiếu thông tin phòng hoặc chủ nhà.');
      }

      // Normalize landlordId if numeric
      let normLandlordId = String(landlordId);
      if (/^\d+$/.test(normLandlordId)) {
        normLandlordId = `u-landlord-${normLandlordId.padStart(2, '0')}`;
      }

      if (!isAppointment) {
        await container.rentalRequest.rentalRequestRepository.createRequest({
          roomId: String(roomId),
          landlordId: normLandlordId,
          proposedMoveInDate: date,
          numOccupants: Math.max(1, Number(numOccupants) || 1),
          message: note.trim() || undefined,
          idempotencyKey: generateIdempotencyKey('rent'),
        });
        toast.success('Đã gửi yêu cầu thuê phòng thành công! Chủ trọ sẽ xét duyệt trong 24 giờ.');
        handleClose();
      } else {
        const scheduledStart = new Date(`${date}T${time || '09:00'}:00+07:00`).toISOString();
        const created = await container.appointment.appointmentRepository.createAppointment({
          roomId: String(roomId),
          landlordId: normLandlordId,
          scheduledStart,
          roomTitle,
          contactPhone: phone.trim() || undefined,
          tenantNote: note.trim() || undefined,
        });
        setCreatedAppointment(created);
        toast.success('Đã đặt lịch hẹn xem phòng thành công!');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi yêu cầu lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isAppointment ? 'Đặt lịch hẹn xem phòng' : 'Gửi yêu cầu thuê phòng'}
      description={roomTitle}
      size="md"
    >
      {createdAppointment ? (
        <div className="space-y-4 py-3 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Đặt lịch xem phòng thành công!
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Lịch hẹn lúc <strong>{new Date(createdAppointment.scheduledStart).toLocaleString('vi-VN')}</strong> đã được gửi tới chủ trọ.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => {
                downloadAppointmentIcs({
                  id: createdAppointment.id,
                  title: `Xem phòng: ${roomTitle}`,
                  description: `Lịch hẹn xem phòng CozyNest: ${roomTitle}\nGhi chú: ${note || 'Không'}\nSố điện thoại: ${phone}`,
                  location: createdAppointment.roomAddress || roomTitle,
                  startIso: createdAppointment.scheduledStart,
                  endIso: createdAppointment.scheduledEnd,
                });
                toast.success('Đã tải xuống file .ics vào máy của bạn!');
              }}
            >
              Thêm vào lịch (.ics)
            </Button>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <DatePicker
            label={isAppointment ? 'Ngày xem phòng dự kiến' : 'Ngày bắt đầu dọn vào'}
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {isAppointment ? (
            <>
              <Input
                label="Khung giờ xem phòng"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                leftIcon={<Clock className="w-4 h-4" />}
              />
              <Input
                label="Số điện thoại liên hệ"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-stone-400" />}
                placeholder="Nhập số điện thoại (ví dụ: 0901000001)"
              />
            </>
          ) : (
            <Input
              label="Số lượng người ở dự kiến"
              type="number"
              min={1}
              max={10}
              value={numOccupants}
              onChange={(e) => setNumOccupants(e.target.value)}
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
              placeholder="Nhập ghi chú thêm cho chủ trọ..."
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>
              {tAuto('k0469')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={isAppointment ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            >
              {isAppointment ? 'Xác nhận đặt lịch' : 'Gửi yêu cầu thuê'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
