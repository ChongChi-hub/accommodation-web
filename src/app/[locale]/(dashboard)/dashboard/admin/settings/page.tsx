'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { toast } from '@/presentation/stores/toast.store';
import { Settings, ShieldCheck, CreditCard, Server, Save, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [vietQrActive, setVietQrActive] = useState(true);
  const [autoApproveRooms, setAutoApproveRooms] = useState(false);
  const [require2FAStaff, setRequire2FAStaff] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('60');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [supportHotline, setSupportHotline] = useState('1900 6868');
  const [commissionRate, setCommissionRate] = useState('1.5');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Cấu hình hệ thống đã được cập nhật thành công');
    }, 600);
  };

  const handleClearCache = () => {
    toast.info('Đang làm mới bộ nhớ đệm Redis và CDN...');
    setTimeout(() => {
      toast.success('Đã xóa bộ nhớ đệm hệ thống thành công');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary-600" />
            Cấu hình hệ thống
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Thiết lập các tham số vận hành, cổng thanh toán và bảo mật toàn sàn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClearCache}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Xóa bộ nhớ đệm
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Operations & System */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Vận hành và dịch vụ
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Trạng thái bảo trì và tham số kết nối người dùng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Chế độ bảo trì sàn</p>
                <p className="text-xs text-neutral-500">Chỉ quản trị viên mới truy cập được các dịch vụ cốt lõi</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-primary-600 cursor-pointer"
              />
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Duyệt tin đăng tự động</p>
                <p className="text-xs text-neutral-500">Tự động duyệt tin đăng từ chủ nhà có điểm tín nhiệm cao</p>
              </div>
              <input
                type="checkbox"
                checked={autoApproveRooms}
                onChange={(e) => setAutoApproveRooms(e.target.checked)}
                className="w-5 h-5 accent-primary-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Hotline hỗ trợ khẩn cấp
              </label>
              <Input
                value={supportHotline}
                onChange={(e) => setSupportHotline(e.target.value)}
                placeholder="1900 6868"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Phí dịch vụ môi giới / đối tác (%)
              </label>
              <Input
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="1.5"
              />
            </div>
          </div>
        </Card>

        {/* Payments Gateway */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Cổng thanh toán và đối soát
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Cấu hình tích hợp thanh toán VietQR và đối soát ngân hàng
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Cổng VietQR NAPAS 24/7</p>
                <p className="text-xs text-neutral-500">Tạo mã QR thanh toán động kèm mã hóa đơn theo tiêu chuẩn NAPAS</p>
              </div>
              <input
                type="checkbox"
                checked={vietQrActive}
                onChange={(e) => setVietQrActive(e.target.checked)}
                className="w-5 h-5 accent-primary-600 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Security & Access */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Bảo mật và phiên làm việc
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Quy định giới hạn truy cập và thời gian hết hạn phiên
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Thời gian hết hạn phiên (phút)
              </label>
              <Input
                type="number"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Số lần đăng nhập sai tối đa
              </label>
              <Input
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
              />
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Bắt buộc 2FA ban quản trị</p>
                <p className="text-xs text-neutral-500">Yêu cầu mã xác thực 2 lớp khi vào Admin/Mod</p>
              </div>
              <input
                type="checkbox"
                checked={require2FAStaff}
                onChange={(e) => setRequire2FAStaff(e.target.checked)}
                className="w-5 h-5 accent-primary-600 cursor-pointer"
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}

