'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
      toast.success('Cảm ơn bạn! Tổ Ấm đã tiếp nhận thông tin và sẽ phản hồi trong 2 giờ làm việc.');
    }, 600);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Liên hệ hỗ trợ' }]} />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Liên hệ với chúng tôi
        </h1>
        <p className="text-xs text-stone-500 max-w-xl">
          Đội ngũ chăm sóc khách hàng luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Thông tin liên lạc</h3>
            <ul className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>Số 18 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-700 shrink-0" />
                <span>1900 8866 (Tổng đài miễn phí)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-700 shrink-0" />
                <span>hotro@toam.vn</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Thứ 2 - Chủ Nhật: 8h00 - 21h00</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Gửi lời nhắn cho Tổ Ấm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Họ và tên của bạn"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Số điện thoại"
                  required
                  type="tel"
                  placeholder="0912 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <Input
                label="Địa chỉ Email"
                required
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Nội dung cần hỗ trợ
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mô tả chi tiết câu hỏi hoặc vấn đề bạn gặp phải..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Gửi phản hồi
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
