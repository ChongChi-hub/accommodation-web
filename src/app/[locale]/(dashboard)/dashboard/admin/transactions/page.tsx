'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { toast } from '@/presentation/stores/toast.store';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { ApiClient } from '@/infrastructure/http/api-client';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileDown,
  UserCheck,
  Calendar,
  Lock,
  PlusCircle,
  FileSpreadsheet,
  XCircle,
  DollarSign,
  ArrowRight,
  Info
} from 'lucide-react';

interface DailyBreakdown {
  date: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  difference: number;
  entryCount: number;
}

interface WalletBreakdown {
  accountNumber: string;
  accountName: string;
  accountType: string;
  ownerId: string;
  storedBalance: number;
  calculatedBalance: number;
  isMatched: boolean;
  difference: number;
}

interface ReconciliationSummary {
  isSystemBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  systemDifference: number;
  totalAccounts: number;
  totalMismatchedAccounts: number;
  dailyBreakdowns: DailyBreakdown[];
  walletBreakdowns: WalletBreakdown[];
  alertSent: boolean;
  message: string;
}

interface AdjustmentRequest {
  id: string;
  makerId: string;
  checkerId: string | null;
  actionType: string;
  accountNumber: string;
  contraAccountNumber: string;
  direction: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  decidedAt: string | null;
  createdAt: string;
}

interface AccountItem {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  balance: number;
}

export default function AdminTransactionsAndLedgerPage() {
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'RECON' | 'MAKER_CHECKER' | 'EXPORT'>('RECON');
  const [isLoading, setIsLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);

  // Dữ liệu đối soát
  const [reconData, setReconData] = useState<ReconciliationSummary | null>(null);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);

  // Form tạo điều chỉnh
  const [formAccount, setFormAccount] = useState('');
  const [formDirection, setFormDirection] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [formAmount, setFormAmount] = useState('');
  const [formReason, setFormReason] = useState('');
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);

  // Bộ lọc xuất báo cáo
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [exportAccount, setExportAccount] = useState('');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Tải dữ liệu ban đầu
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Chạy hoặc lấy dữ liệu đối soát toàn vẹn
      const reconRes = await ApiClient.request<ReconciliationSummary>('/billing/ledger/reconcile-now', {
        method: 'POST',
      });
      setReconData(reconRes);

      // 2. Lấy danh sách tài khoản
      const accsRes = await ApiClient.request<AccountItem[]>('/billing/ledger/accounts');
      setAccounts(accsRes || []);
      if (accsRes && accsRes.length > 0) {
        setFormAccount(accsRes[0].accountNumber);
        setExportAccount(accsRes[0].accountNumber);
      }

      // 3. Lấy danh sách Maker-Checker requests
      const reqsRes = await ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests');
      setRequests(reqsRes || []);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu sổ cái:', err);
      toast.error('Không thể tải dữ liệu sổ cái: ' + (err.message || 'Lỗi mạng'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Hành động chạy đối soát thủ công
  const handleRunReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await ApiClient.request<ReconciliationSummary>('/billing/ledger/reconcile-now', {
        method: 'POST',
      });
      setReconData(res);
      toast.success('Chạy đối soát toàn vẹn sổ cái thành công!');
    } catch (err: any) {
      toast.error('Lỗi khi chạy đối soát: ' + (err.message || 'Lỗi mạng'));
    } finally {
      setIsReconciling(false);
    }
  };

  // Hành động tạo yêu cầu điều chỉnh (Maker)
  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(formAmount.replace(/[^0-9]/g, ''), 10);
    if (!amountNum || amountNum <= 0) {
      toast.error('Vui lòng nhập số tiền điều chỉnh lớn hơn 0');
      return;
    }
    if (!formReason.trim()) {
      toast.error('Vui lòng nhập lý do giải trình');
      return;
    }

    setIsSubmittingAdjustment(true);
    try {
      await ApiClient.request('/billing/maker-checker/adjustment', {
        method: 'POST',
        body: JSON.stringify({
          accountNumber: formAccount,
          direction: formDirection,
          amount: amountNum,
          reason: formReason.trim(),
        }),
      });

      toast.success('Tạo yêu cầu điều chỉnh thành công! Đang chờ cấp duyệt thứ hai (Checker).');
      setFormAmount('');
      setFormReason('');

      // Tải lại danh sách yêu cầu
      const reqsRes = await ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests');
      setRequests(reqsRes || []);
    } catch (err: any) {
      toast.error('Lỗi khi tạo yêu cầu: ' + (err.message || 'Thất bại'));
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  // Hành động duyệt yêu cầu điều chỉnh (Checker)
  const handleApprove = async (req: AdjustmentRequest) => {
    if (currentUser?.id && currentUser.id === req.makerId) {
      toast.error('Quy tắc Maker-Checker: Bạn là người tạo yêu cầu này, cần một quản trị viên khác kiểm tra và phê duyệt!');
      return;
    }

    try {
      await ApiClient.request(`/billing/maker-checker/${req.id}/approve`, {
        method: 'POST',
      });
      toast.success('Phê duyệt thành công! Bút toán đã được hạch toán bất biến vào Sổ cái.');

      // Refresh lại cả đối soát và danh sách yêu cầu
      handleRunReconcile();
      const reqsRes = await ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests');
      setRequests(reqsRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi phê duyệt');
    }
  };

  // Hành động từ chối yêu cầu
  const handleReject = async (req: AdjustmentRequest) => {
    if (currentUser?.id && currentUser.id === req.makerId) {
      toast.error('Quy tắc Maker-Checker: Bạn là người tạo yêu cầu này, cần một quản trị viên khác xử lý!');
      return;
    }

    const reason = window.prompt('Nhập lý do từ chối:', 'Không đủ chứng từ hợp lệ');
    if (reason === null) return;

    try {
      await ApiClient.request(`/billing/maker-checker/${req.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      toast.success('Đã từ chối yêu cầu điều chỉnh');

      const reqsRes = await ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests');
      setRequests(reqsRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi từ chối');
    }
  };

  // Hàm tải file CSV báo cáo
  const downloadReport = async (type: 'general-ledger' | 'trial-balance' | 'statement', filename: string) => {
    setIsExporting(type);
    try {
      const params = new URLSearchParams();
      if (exportFromDate) params.append('fromDate', exportFromDate);
      if (exportToDate) params.append('toDate', exportToDate);
      if (type === 'statement' && exportAccount) {
        params.append('accountNumber', exportAccount);
      }

      const endpoint = `/billing/ledger/export/${type}?${params.toString()}`;
      const blob = await ApiClient.getBlob(endpoint);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Đã tải xuống ${filename} thành công!`);
    } catch (err: any) {
      toast.error('Lỗi khi xuất file báo cáo: ' + (err.message || 'Thất bại'));
    } finally {
      setIsExporting(null);
    }
  };

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const tabItems = [
    { id: 'RECON', label: 'Toàn vẹn Sổ cái & Đối soát hằng ngày', icon: <Scale className="w-4 h-4" /> },
    {
      id: 'MAKER_CHECKER',
      label: 'Duyệt điều chỉnh 2 người (Maker - Checker)',
      icon: <UserCheck className="w-4 h-4" />,
      badge: requests.filter((r) => r.status === 'PENDING').length || undefined,
    },
    { id: 'EXPORT', label: 'Xuất báo cáo kế toán (CSV UTF-8 BOM)', icon: <FileDown className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const isBalanced = reconData?.isSystemBalanced ?? true;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Scale className="w-5 h-5" />
            </span>
            <span>Giao dịch & Sổ cái Đối soát Kế toán</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Quy chuẩn [LEDGER-02]: Toàn vẹn sổ cái đối soát mỗi đêm, phê duyệt 2 người và xuất báo cáo tài chính.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunReconcile}
            isLoading={isReconciling}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isReconciling ? 'animate-spin' : ''}`} />}
          >
            Chạy đối soát ngay
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Toàn vẹn Nợ = Có */}
        <Card className="p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-medium">Toàn vẹn Sổ cái Kép</span>
            {isBalanced ? (
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-3 h-3" /> CÂN ĐỐI 100%
              </Badge>
            ) : (
              <Badge variant="danger" size="sm">
                <AlertTriangle className="w-3 h-3" /> CẢNH BÁO LỆCH
              </Badge>
            )}
          </div>
          <div className="text-xl font-bold text-foreground">
            {formatVnd(reconData?.totalDebit || 0)}
          </div>
          <div className="text-[11px] text-foreground-muted flex justify-between">
            <span>Tổng Nợ: {formatVnd(reconData?.totalDebit || 0)}</span>
            <span>Tổng Có: {formatVnd(reconData?.totalCredit || 0)}</span>
          </div>
        </Card>

        {/* Card 2: Đối soát ví */}
        <Card className="p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-medium">Khớp số dư ví & bút toán</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {(reconData?.totalAccounts || 0) - (reconData?.totalMismatchedAccounts || 0)} / {reconData?.totalAccounts || 0}
          </div>
          <p className="text-[11px] text-foreground-muted">
            {reconData?.totalMismatchedAccounts === 0
              ? 'Tất cả các ví chủ trọ khớp chính xác 100%'
              : `Phát hiện ${reconData?.totalMismatchedAccounts} ví lệch số dư!`}
          </p>
        </Card>

        {/* Card 3: Maker-Checker pending */}
        <Card className="p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-medium">Duyệt 2 người (Maker-Checker)</span>
            {pendingCount > 0 ? (
              <Badge variant="warning" size="sm">{pendingCount} Chờ duyệt</Badge>
            ) : (
              <Badge variant="neutral" size="sm">Đã giải quyết</Badge>
            )}
          </div>
          <div className="text-xl font-bold text-foreground">
            {pendingCount} <span className="text-xs font-normal text-foreground-muted">yêu cầu</span>
          </div>
          <p className="text-[11px] text-foreground-muted">
            Yêu cầu điều chỉnh thủ công cần 2 Admin độc lập
          </p>
        </Card>

        {/* Card 4: DB Immutability */}
        <Card className="p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-medium">Tính bất biến Database</span>
            <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Trigger Chặn Sửa/Xóa
          </div>
          <p className="text-[11px] text-foreground-muted">
            DB chặn UPDATE & DELETE trên bảng sổ cái cho ứng dụng
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabItems}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        variant="underline"
      />

      {/* ================= TAB 1: TOÀN VẸN SỔ CÁI & ĐỐI SOÁT HẰNG NGÀY ================= */}
      {activeTab === 'RECON' && (
        <div className="space-y-6">
          {/* Thông báo tình trạng */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              isBalanced
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            {isBalanced ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-semibold">{reconData?.message}</p>
              <p className="text-foreground-muted text-xs">
                Job tự động chạy vào lúc 01:00 AM hằng đêm (cron). Nếu phát hiện mất cân đối, hệ thống tự động bắn cảnh báo tức thì tới Telegram / Slack Webhook.
              </p>
            </div>
          </div>

          {/* Bảng 1: Đối soát theo ngày */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>1. Đối soát Sổ cái kép theo từng ngày</span>
              </h2>
              <span className="text-xs text-foreground-muted">
                {reconData?.dailyBreakdowns?.length || 0} ngày có phát sinh bút toán
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày hạch toán</TableHead>
                  <TableHead className="text-right">Tổng Nợ (Debit)</TableHead>
                  <TableHead className="text-right">Tổng Có (Credit)</TableHead>
                  <TableHead className="text-right">Chênh lệch</TableHead>
                  <TableHead className="text-center">Số bút toán</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconData?.dailyBreakdowns?.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell className="text-right font-mono">{formatVnd(day.totalDebit)}</TableCell>
                    <TableCell className="text-right font-mono">{formatVnd(day.totalCredit)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {day.difference === 0 ? '0 đ' : <span className="text-rose-600 font-bold">{formatVnd(day.difference)}</span>}
                    </TableCell>
                    <TableCell className="text-center">{day.entryCount}</TableCell>
                    <TableCell className="text-center">
                      {day.isBalanced ? (
                        <Badge variant="success" size="sm">Cân đối</Badge>
                      ) : (
                        <Badge variant="danger" size="sm">Lệch</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Bảng 2: Đối soát theo từng ví & tài khoản */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>2. Đối soát số dư ví & tài khoản khớp tổng các bút toán</span>
              </h2>
              <span className="text-xs text-foreground-muted">
                {reconData?.walletBreakdowns?.length || 0} tài khoản đang theo dõi
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã tài khoản</TableHead>
                  <TableHead>Tên tài khoản</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Số dư DB (Stored)</TableHead>
                  <TableHead className="text-right">Tổng bút toán (Calculated)</TableHead>
                  <TableHead className="text-right">Chênh lệch</TableHead>
                  <TableHead className="text-center">Kiểm toán</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconData?.walletBreakdowns?.map((w) => (
                  <TableRow key={w.accountNumber}>
                    <TableCell className="font-mono text-xs font-semibold">{w.accountNumber}</TableCell>
                    <TableCell>{w.accountName}</TableCell>
                    <TableCell>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-muted text-foreground-muted border border-border">
                        {w.accountType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatVnd(w.storedBalance)}</TableCell>
                    <TableCell className="text-right font-mono">{formatVnd(w.calculatedBalance)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {w.difference === 0 ? '0 đ' : <span className="text-rose-600 font-bold">{formatVnd(w.difference)}</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {w.isMatched ? (
                        <Badge variant="success" size="sm">Khớp 100%</Badge>
                      ) : (
                        <Badge variant="danger" size="sm">Sai lệch</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DUYỆT ĐIỀU CHỈNH 2 NGƯỜI (MAKER - CHECKER) ================= */}
      {activeTab === 'MAKER_CHECKER' && (
        <div className="space-y-6">
          {/* Form tạo yêu cầu điều chỉnh */}
          <Card className="p-5 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-teal-600" />
                <span>Tạo đề xuất điều chỉnh Sổ cái (Maker)</span>
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Bút toán điều chỉnh số dư chỉ có thể thực hiện qua API này, có đầy đủ lý do, người tạo và bắt buộc có người duyệt thứ hai (Maker != Checker).
              </p>
            </div>

            <form onSubmit={handleCreateAdjustment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Tài khoản điều chỉnh *
                </label>
                <select
                  value={formAccount}
                  onChange={(e) => setFormAccount(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                >
                  {accounts.map((acc) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} - {acc.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Chiều hạch toán *
                </label>
                <select
                  value={formDirection}
                  onChange={(e) => setFormDirection(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-border bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                >
                  <option value="CREDIT">Ghi CÓ (CREDIT - Tăng số dư Ví/Doanh thu)</option>
                  <option value="DEBIT">Ghi NỢ (DEBIT - Tăng Tiền mặt/Chi phí)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Số tiền điều chỉnh (VND) *
                </label>
                <Input
                  placeholder="Ví dụ: 500,000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  type="text"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Lý do điều chỉnh (Bắt buộc) *
                </label>
                <Input
                  placeholder="Ví dụ: Bồi hoàn sự cố ticket #123"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  type="text"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmittingAdjustment}
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Gửi yêu cầu phê duyệt
                </Button>
              </div>
            </form>
          </Card>

          {/* Bảng danh sách yêu cầu Maker-Checker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>Danh sách yêu cầu điều chỉnh số cái (Maker - Checker)</span>
              </h2>
              <span className="text-xs text-foreground-muted">
                Đang đăng nhập: <strong className="text-foreground">{currentUser?.fullName || currentUser?.email || 'Admin'}</strong> ({currentUser?.id})
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã yêu cầu</TableHead>
                  <TableHead>Người tạo (Maker)</TableHead>
                  <TableHead>Người duyệt (Checker)</TableHead>
                  <TableHead>Tài khoản</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Lý do giải trình</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-foreground-muted">
                      Chưa có yêu cầu điều chỉnh nào trong hệ thống.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => {
                    const isMaker = currentUser?.id && currentUser.id === req.makerId;
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono text-[11px] text-foreground-muted">
                          {req.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-xs">{req.makerId}</span>
                          {isMaker && (
                            <span className="block text-[10px] text-teal-700 dark:text-teal-400 font-semibold">
                              (Chính bạn tạo)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{req.checkerId || '—'}</TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">{req.accountNumber}</span>
                          <span className="block text-[10px] text-foreground-muted">{req.direction}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold">
                          {formatVnd(req.amount)}
                        </TableCell>
                        <TableCell className="max-w-xs text-xs truncate" title={req.reason}>
                          {req.reason}
                        </TableCell>
                        <TableCell className="text-center">
                          {req.status === 'PENDING' && <Badge variant="warning" size="sm">Chờ duyệt</Badge>}
                          {req.status === 'APPROVED' && <Badge variant="success" size="sm">Đã duyệt</Badge>}
                          {req.status === 'REJECTED' && <Badge variant="danger" size="sm">Từ chối</Badge>}
                        </TableCell>
                        <TableCell className="text-center">
                          {req.status === 'PENDING' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                variant="primary"
                                className="h-7 text-[11px] px-2.5"
                                onClick={() => handleApprove(req)}
                                title={isMaker ? 'Bạn không thể tự duyệt yêu cầu do chính mình tạo' : 'Phê duyệt'}
                              >
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                className="h-7 text-[11px] px-2.5"
                                onClick={() => handleReject(req)}
                                title={isMaker ? 'Bạn không thể xử lý yêu cầu do chính mình tạo' : 'Từ chối'}
                              >
                                Từ chối
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-foreground-muted">Đã xử lý</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: XUẤT BÁO CÁO KẾ TOÁN (CSV UTF-8 BOM) ================= */}
      {activeTab === 'EXPORT' && (
        <div className="space-y-6">
          {/* Bộ lọc khoảng ngày */}
          <Card className="p-4.5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Khoảng thời gian xuất báo cáo (Tùy chọn)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-foreground-muted mb-1">Từ ngày</label>
                <Input
                  type="date"
                  value={exportFromDate}
                  onChange={(e) => setExportFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-foreground-muted mb-1">Đến ngày</label>
                <Input
                  type="date"
                  value={exportToDate}
                  onChange={(e) => setExportToDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-foreground-muted mb-1">Tài khoản sao kê (Dành cho Sao kê)</label>
                <select
                  value={exportAccount}
                  onChange={(e) => setExportAccount(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                >
                  {accounts.map((acc) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} - {acc.accountName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* 3 Thẻ tải báo cáo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Sổ Cái Chi Tiết */}
            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Sổ Cái Chi Tiết (General Ledger)</h3>
                <p className="text-xs text-foreground-muted">
                  Báo cáo toàn bộ các bút toán Nợ / Có phát sinh trong kỳ, chi tiết mã chứng từ, tài khoản đối ứng và người lập.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadReport('general-ledger', 'so-cai-chi-tiet.csv')}
                isLoading={isExporting === 'general-ledger'}
                leftIcon={<FileDown className="w-4 h-4" />}
                className="w-full"
              >
                Tải Sổ Cái (CSV UTF-8)
              </Button>
            </Card>

            {/* 2. Bảng Cân Đối Thử */}
            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Bảng Cân Đối Thử (Trial Balance)</h3>
                <p className="text-xs text-foreground-muted">
                  Báo cáo số dư đầu kỳ, phát sinh Nợ/Có trong kỳ và số dư cuối kỳ của tất cả tài khoản kế toán. Hàng tổng kết cân đối tuyệt đối.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadReport('trial-balance', 'bang-can-doi-thu.csv')}
                isLoading={isExporting === 'trial-balance'}
                leftIcon={<FileDown className="w-4 h-4" />}
                className="w-full"
              >
                Tải Bảng Cân Đối Thử (CSV UTF-8)
              </Button>
            </Card>

            {/* 3. Sao Kê Tài Khoản */}
            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <FileDown className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Sao Kê Tài Khoản / Ví (Statement)</h3>
                <p className="text-xs text-foreground-muted">
                  Chi tiết từng giao dịch phát sinh và số dư lũy kế theo thời gian của tài khoản/ví được chọn ở bộ lọc trên.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadReport('statement', `sao-ke-${exportAccount || 'vi'}.csv`)}
                isLoading={isExporting === 'statement'}
                leftIcon={<FileDown className="w-4 h-4" />}
                className="w-full"
              >
                Tải Sao Kê Ví (CSV UTF-8)
              </Button>
            </Card>
          </div>

          <div className="p-4 rounded-xl bg-surface-muted border border-border text-xs text-foreground-muted flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Mọi tệp tin CSV đều được chèn tiền tố UTF-8 BOM (<code className="text-foreground">\uFEFF</code>) giúp mở trực tiếp bằng Microsoft Excel và Google Sheets tiếng Việt hoàn hảo không bị vỡ font chữ.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
