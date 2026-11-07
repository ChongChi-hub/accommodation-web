'use client';

import React, { useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { DatePicker } from '@/presentation/components/ui/DatePicker';
import { toast } from '@/presentation/stores/toast.store';
import { Calendar, Clock, MessageSquare, Send } from 'lucide-react';

export interface RoomBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  type: 'appointment' | 'rental';
}

export function RoomBookingModal({
  isOpen,
  onClose,
  roomTitle,
  type,
}: RoomBookingModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      if (type === 'appointment') {
        toast.success('Đã gửi yêu cầu hẹn xem phòng! Chủ trọ sẽ liên hệ xác nhận sớm nhất.');
      } else {
        toast.success('Đã gửi yêu cầu thuê phòng! Chủ trọ sẽ duyệt hồ sơ trong 24h.');
      }
    }, 600);
  };

  const isAppointment = type === 'appointment';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isAppointment ? 'Đặt lịch hẹn xem phòng' : 'Gửi yêu cầu thuê phòng'}
      description={`Phòng: ${roomTitle}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <DatePicker
          label={isAppointment ? 'Ngày xem phòng dự kiến' : 'Ngày bắt đầu dọn vào'}
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {isAppointment && (
          <Input
            label="Khung giờ xem phòng"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
          />
        )}

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            Lời nhắn gửi chủ trọ
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Em muốn xem phòng vào chiều thứ 7, em có đi cùng bạn cùng phòng..."
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Hủy bỏ
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
