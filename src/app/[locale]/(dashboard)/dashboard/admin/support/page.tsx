'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminSupport } from '@/presentation/hooks/useAdminSupport';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Drawer } from '@/presentation/components/ui/Drawer';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Tabs } from '@/presentation/components/ui/Tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/presentation/components/ui/Table';
import {
  LifeBuoy,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Mail,
  Phone,
  FileText,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { formatIsoDate } from '@/shared/utils/format-vnd';

function AdminSupportContent() {
  const t = useTranslations('pages.support');
  const tAuto = useTranslations('autoI18n');
  const tCommon = useTranslations('common');

  const {
    tickets,
    metrics,
    selectedTicket,
    setSelectedTicket,
    loadTicketDetail,
    sendReply,
    updateStatus,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    isLoading,
    isDetailLoading,
    isReplying,
    error,
    retry,
  } = useAdminSupport();

  const [replyInput, setReplyInput] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title="Không thể tải danh sách phiếu hỗ trợ"
          message="Đã xảy ra lỗi khi kết nối với máy chủ quản trị."
          onRetry={retry}
        />
      </div>
    );
  }

  const tabItems = [
    { id: 'ALL', label: t('allStatus') },
    { id: 'OPEN', label: t('status.OPEN') },
    { id: 'IN_PROGRESS', label: t('status.IN_PROGRESS') },
    { id: 'RESOLVED', label: t('status.RESOLVED') },
    { id: 'CLOSED', label: t('status.CLOSED') },
  ];

  const handleOpenDetail = (id: string) => {
    setReplyInput('');
    loadTicketDetail(id);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyInput.trim()) return;
    await sendReply(selectedTicket.id, replyInput);
    setReplyInput('');
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      case 'OPEN':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <span>{tAuto('k0019')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {tAuto('k0020')}
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-foreground-muted font-medium">Tổng số phiếu</p>
            <p className="text-base font-black text-foreground">{metrics.total}</p>
          </div>
        </Card>
        <Card className="p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-foreground-muted font-medium">Mới tiếp nhận</p>
            <p className="text-base font-black text-amber-600">{metrics.openCount}</p>
          </div>
        </Card>
        <Card className="p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-foreground-muted font-medium">Đang xử lý</p>
            <p className="text-base font-black text-sky-600">{metrics.inProgressCount}</p>
          </div>
        </Card>
        <Card className="p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-foreground-muted font-medium">Đã giải quyết</p>
            <p className="text-base font-black text-emerald-600">{metrics.resolvedCount}</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          items={tabItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 py-2 text-xs rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          >
            <option value="ALL">{t('allCategories')}</option>
            <option value="PAYMENT">{t('category.BILLING')}</option>
            <option value="CONTRACT">{t('category.CONTRACT')}</option>
            <option value="ACCOUNT">{t('category.ACCOUNT')}</option>
            <option value="TECHNICAL">{t('category.TECHNICAL')}</option>
            <option value="VIOLATION">{t('category.DISPUTE')}</option>
            <option value="OTHER">{t('category.OTHER')}</option>
          </select>

          <div className="w-full sm:w-64">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      {tickets.length === 0 ? (
        <EmptyState title="Không tìm thấy phiếu hỗ trợ" description={t('empty')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.ticketId')}</TableHead>
                <TableHead>Người yêu cầu</TableHead>
                <TableHead>{t('table.subject')}</TableHead>
                <TableHead>{t('table.priority')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.updatedAt')}</TableHead>
                <TableHead className="text-right">{t('table.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-primary dark:text-primary-300">
                      {ticket.ticketCode || ticket.id}
                    </span>
                    {(ticket.replyCount || 0) > 0 && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-foreground-muted">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.replyCount}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-xs text-foreground">{ticket.userName}</p>
                    <p className="text-[11px] text-foreground-muted">{ticket.userEmail}</p>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs font-semibold text-foreground truncate">{ticket.subject}</p>
                    <Badge variant="neutral" size="sm" className="mt-0.5">
                      {ticket.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(ticket.priority)} size="sm">
                      {t(`priority.${ticket.priority}` as any) || ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(ticket.status)} size="sm">
                      {t(`status.${ticket.status}` as any) || ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted">
                    {formatIsoDate(ticket.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetail(ticket.id)}
                      title={t('table.detailAction')}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Ticket Details & Discussion Drawer */}
      <Drawer
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `Phiếu hỗ trợ #${selectedTicket.ticketCode || selectedTicket.id}` : 'Chi tiết phiếu'}
      >
        {isDetailLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : selectedTicket ? (
          <div className="space-y-5 pb-6">
            {/* Status & Priority Badges */}
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border">
              <Badge variant={getStatusBadgeVariant(selectedTicket.status)}>
                {t(`status.${selectedTicket.status}` as any) || selectedTicket.status}
              </Badge>
              <Badge variant={getPriorityBadgeVariant(selectedTicket.priority)}>
                Ưu tiên: {t(`priority.${selectedTicket.priority}` as any) || selectedTicket.priority}
              </Badge>
              <Badge variant="neutral">
                {selectedTicket.category}
              </Badge>
            </div>

            {/* Subject */}
            <h3 className="text-base font-bold text-foreground">
              {selectedTicket.subject}
            </h3>

            {/* Requester Info */}
            <div className="p-3.5 rounded-xl bg-surface-muted border border-border/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <User className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{selectedTicket.userName}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedTicket.userEmail}</span>
              </div>
              {selectedTicket.userPhone && (
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedTicket.userPhone}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Nội dung yêu cầu ban đầu</span>
              </h4>
              <div className="p-4 rounded-xl border border-border bg-surface text-xs leading-relaxed text-foreground">
                {selectedTicket.description}
              </div>
            </div>

            {/* Discussion Thread */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Lịch sử phản hồi ({selectedTicket.replies?.length || 0})</span>
              </h4>

              {(!selectedTicket.replies || selectedTicket.replies.length === 0) ? (
                <div className="p-4 text-center rounded-xl border border-dashed border-border text-xs text-foreground-muted">
                  Chưa có trao đổi nào. Hãy nhập phản hồi bên dưới để hỗ trợ khách hàng.
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedTicket.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        rep.senderRole === 'ADMIN'
                          ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-200/60 dark:border-teal-900/60 ml-4'
                          : 'bg-surface border-border mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground">
                          {rep.senderName}
                          {rep.senderRole === 'ADMIN' && (
                            <span className="ml-1 text-[10px] text-teal-700 dark:text-teal-400 font-normal">
                              (Quản trị viên)
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-foreground-muted">
                          {formatIsoDate(rep.createdAt)}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-line">
                        {rep.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Form */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-semibold text-foreground">
                Phản hồi của Quản trị viên
              </label>
              <textarea
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Nhập nội dung giải đáp hoặc hướng dẫn xử lý..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700/20 resize-none"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSendReply}
                  disabled={isReplying || !replyInput.trim()}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {isReplying ? 'Đang gửi...' : 'Gửi phản hồi'}
                </Button>
              </div>
            </div>

            {/* Status Transition Actions */}
            <div className="space-y-2 pt-3 border-t border-border">
              <p className="text-xs font-semibold text-foreground">Cập nhật trạng thái phiếu:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(selectedTicket.id, 'IN_PROGRESS')}
                  disabled={selectedTicket.status === 'IN_PROGRESS'}
                >
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Đang xử lý
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateStatus(selectedTicket.id, 'RESOLVED')}
                  disabled={selectedTicket.status === 'RESOLVED'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Đã giải quyết
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(selectedTicket.id, 'CLOSED')}
                  disabled={selectedTicket.status === 'CLOSED'}
                >
                  Đóng phiếu
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminSupportContent />
    </Suspense>
  );
}
