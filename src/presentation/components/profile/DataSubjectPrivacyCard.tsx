'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { ApiClient } from '@/infrastructure/http/api-client';
import { Download, UserX, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function DataSubjectPrivacyCard() {
  const [isExporting, setIsExporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reason, setReason] = useState('');
  const [isAnonymizing, setIsAnonymizing] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const token = ApiClient.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/v1/users/me/export-data', {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        throw new Error('Khong the tai xuat du lieu ca nhan');
      }

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toam-personal-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Da tai xuong ho so du lieu ca nhan (Nghi dinh 13)');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Loi khi xuat du lieu');
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmAnonymize = async () => {
    setIsAnonymizing(true);
    try {
      const res = await ApiClient.post<{ message?: string; success?: boolean }>(
        '/users/me/anonymize',
        { confirm: true, reason: reason.trim() || 'Yeu cau nguoi dung' }
      );
      toast.success(res?.message || 'Tai khoan da duoc an danh hoa thanh cong');
      setShowConfirmModal(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Khong the an danh hoa tai khoan');
      setIsAnonymizing(false);
    }
  };

  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-base font-semibold text-foreground">
                Quyen Chu the Du lieu (Nghi dinh 13/2023/ND-CP)
              </h2>
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              To Am cam ket bao ve du lieu ca nhan theo quy dinh phap luat Viet Nam. Ban co toan quyen
              xuat du lieu hoac yeu cau xoa/an danh hoa thong tin dinh danh.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                <Download className="w-4 h-4 text-teal-600" />
                <span>Xuat du lieu ca nhan (JSON)</span>
              </div>
              <p className="text-[11px] text-foreground-muted leading-relaxed">
                Tai toan bo ho so ca nhan, lich su eKYC, trang thai sinh trac hoc va nhat ky dong y
                dieu khoan duoi dinh dang JSON tieu chuan.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {isExporting ? 'Dang xuat goi du lieu...' : 'Tai goi du lieu ca nhan'}
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-red-200/60 dark:border-red-950/60 bg-red-50/30 dark:bg-red-950/20 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-xs text-red-600 dark:text-red-400">
                <UserX className="w-4 h-4" />
                <span>Yeu cau xoa / An danh hoa tai khoan</span>
              </div>
              <p className="text-[11px] text-foreground-muted leading-relaxed">
                Xoa vinh vien thong tin PII (CCCD, anh khuon mat, SDT, email). Chung tu ke toan va
                hop dong phap ly duoc giu lai an danh theo Luat Ke toan.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              className="w-full text-xs border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <UserX className="w-3.5 h-3.5 mr-1.5" />
              Xoa / An danh tai khoan
            </Button>
          </div>
        </div>
      </Card>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">
                  Xac nhan an danh hoa tai khoan?
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Hanh dong nay khong the hoan tac theo Dieu 16, 17 Nghi dinh 13/2023/ND-CP. Toan bo
                  du lieu dinh danh ca nhan, sinh trac hoc se bi xoa bo. Ban se bi dang xuat ngay lap
                  tuc.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="anonymize-reason" className="text-xs font-medium text-foreground">
                Ly do (khong bat buoc)
              </label>
              <input
                id="anonymize-reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Vi du: Khong con nhu cau su dung"
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={isAnonymizing}
                className="text-xs"
              >
                Huy bo
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAnonymize}
                disabled={isAnonymizing}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                {isAnonymizing ? 'Dang xu ly...' : 'Xac nhan xoa & an danh'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
