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
import { Calendar, Clock, Send } from 'lucide-react';

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
  const [numOccupants, setNumOccupants] = useState('1');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAppointment = type === 'appointment';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Vui lòng chọn ngày dự kiến.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (!isAppointment) {
        if (!roomId || !landlordId) {
          throw new Error('Thiếu thông tin phòng hoặc chủ nhà.');
        }
        await container.rentalRequest.rentalRequestRepository.createRequest({
          roomId: String(roomId),
          landlordId: String(landlordId),
          proposedMoveInDate: date,
          numOccupants: Math.max(1, Number(numOccupants) || 1),
          message: note.trim() || undefined,
          idempotencyKey: generateIdempotencyKey('rent'),
        });
        toast.success('Đã gửi yêu cầu thuê phòng thành công! Chủ trọ sẽ xét duyệt trong 24 giờ.');
      } else {
        toast.success('Đã ghi nhận yêu cầu hẹn xem phòng.');
      }
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi yêu cầu lúc này.');
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
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <DatePicker
          label={isAppointment ? 'Ngày xem phòng dự kiến' : 'Ngày bắt đầu dọn vào'}
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {isAppointment ? (
          <Input
            label="Khung giờ xem phòng"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
          />
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
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
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
    </Dialog>
  );
}
