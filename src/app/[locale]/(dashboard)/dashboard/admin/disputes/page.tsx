'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiClient } from '@/infrastructure/http/api-client';
import { container } from '@/infrastructure/di/container';
import { EscrowHold } from '@/domain/entities/Billing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Gavel,
  Lock,
  MessageSquarePlus,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
} from 'lucide-react';

interface DisputeEventItem {
  id: string;
  disputeId: string;
  actorId: string;
  eventType: string;
  message: string;
  createdAt: string;
}

interface DisputeItem {
  id: string;
  disputeCode: string;
  contractId: string;
  roomTitle: string;
  complainantId: string;
  complainantName: string;
  complainantRole: string;
  defendantId: string;
  defendantName: string;
  defendantRole: string;
  disputeType: string;
  amount: number;
  reason: string;
  evidenceUrls: string[];
  status: 'PENDING' | 'MEDIATING' | 'RESOLVED' | 'REJECTED' | string;
  mediatorId?: string | null;
  verdict?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  events: DisputeEventItem[];
}

function statusBadgeVariant(status: string): 'warning' | 'info' | 'success' | 'danger' | 'neutral' {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'MEDIATING':
      return 'info';
    case 'RESOLVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'neutral';
  }
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [busy, setBusy] = useState(false);

  const [selected, setSelected] = useState<DisputeItem | null>(null);
  const [linkedEscrow, setLinkedEscrow] = useState<EscrowHold | null>(null);
  const [commentText, setCommentText] = useState('');
  const [mediateNote, setMediateNote] = useState('');
  const [freezeOnMediate, setFreezeOnMediate] = useState(true);
  const [resolutionAction, setResolutionAction] = useState<'REFUND_TENANT' | 'RELEASE_LANDLORD' | 'NO_ESCROW_ACTION' | 'REJECT'>('REFUND_TENANT');
  const [verdictText, setVerdictText] = useState('');

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const list = await ApiClient.get<DisputeItem[]>('/disputes');
      setDisputes(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách tranh chấp');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const openDetail = async (item: DisputeItem) => {
    setBusy(true);
    try {
      const [detail, escrow] = await Promise.all([
        ApiClient.get<DisputeItem>(`/disputes/${encodeURIComponent(item.id)}`),
        container.billing.billingRepository.getEscrowHold(item.contractId),
      ]);
      setSelected(detail);
      setLinkedEscrow(escrow);
      setVerdictText(detail.verdict || '');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải chi tiết tranh chấp');
    } finally {
      setBusy(false);
    }
  };

  const refreshSelected = async (id: string, contractId: string) => {
    const [detail, escrow] = await Promise.all([
      ApiClient.get<DisputeItem>(`/disputes/${encodeURIComponent(id)}`),
      container.billing.billingRepository.getEscrowHold(contractId),
    ]);
    setSelected(detail);
    setLinkedEscrow(escrow);
    setDisputes((prev) => prev.map((d) => (d.id === detail.id ? detail : d)));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !commentText.trim()) return;
    setBusy(true);
    try {
      await ApiClient.post(`/disputes/${encodeURIComponent(selected.id)}/events`, { message: commentText.trim() });
      setCommentText('');
      await refreshSelected(selected.id, selected.contractId);
      toast.success('Đã ghi nhận phản hồi hòa giải');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi phản hồi');
    } finally {
      setBusy(false);
    }
  };

  const handleMediate = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await ApiClient.post(`/disputes/${encodeURIComponent(selected.id)}/mediate`, {
        note: mediateNote.trim() || 'Quản trị viên đã tiếp nhận hồ sơ hòa giải',
        freezeEscrow: freezeOnMediate && Boolean(linkedEscrow) && linkedEscrow?.status === 'HELD',
      });
      setMediateNote('');
      await refreshSelected(selected.id, selected.contractId);
      toast.success('Đã chuyển hồ sơ sang trạng thái Đang hòa giải');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tiếp nhận hòa giải');
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !verdictText.trim()) return;
    setBusy(true);
    try {
      await ApiClient.post(`/disputes/${encodeURIComponent(selected.id)}/resolve`, {
        resolutionAction,
        verdict: verdictText.trim(),
      });
      await refreshSelected(selected.id, selected.contractId);
      toast.success('Đã ra phán quyết và cập nhật trạng thái tranh chấp');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể hoàn tất giải quyết tranh chấp');
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return disputes.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.disputeCode.toLowerCase().includes(q) ||
        d.contractId.toLowerCase().includes(q) ||
        d.roomTitle.toLowerCase().includes(q) ||
        d.complainantName.toLowerCase().includes(q) ||
        d.defendantName.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q)
      );
    });
  }, [disputes, statusFilter, searchTerm]);

  const counts = useMemo(() => ({
    total: disputes.length,
    pending: disputes.filter((d) => d.status === 'PENDING').length,
    mediating: disputes.filter((d) => d.status === 'MEDIATING').length,
    resolved: disputes.filter((d) => d.status === 'RESOLVED' || d.status === 'REJECTED').length,
  }), [disputes]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Gavel className="w-5 h-5 text-teal-600" />
            Giải quyết tranh chấp &amp; Hòa giải hợp đồng
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Tiếp nhận khiếu nại, đóng băng ký quỹ Escrow và ra phán quyết giải ngân hoặc hoàn cọc.
          </p>
        </div>
        <Button variant="outline" size="sm" isLoading={loading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={loadDisputes}>
          Làm mới
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs text-foreground-muted">Tổng hồ sơ</p>
          <p className="text-2xl font-black text-foreground">{counts.total}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-amber-600">Chờ tiếp nhận (PENDING)</p>
          <p className="text-2xl font-black text-amber-600">{counts.pending}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-sky-600">Đang hòa giải (MEDIATING)</p>
          <p className="text-2xl font-black text-sky-600">{counts.mediating}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-xs text-emerald-600">Đã xử lý xong</p>
          <p className="text-2xl font-black text-emerald-600">{counts.resolved}</p>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'MEDIATING', 'RESOLVED', 'REJECTED'] as const).map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'Tất cả' : st}
            </Button>
          ))}
        </div>
        <div className="w-full sm:w-80">
          <Input
            placeholder="Tìm mã tranh chấp, hợp đồng, phòng, bên liên quan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : filtered.length === 0 ? (
        <EmptyState title="Không có hồ sơ tranh chấp phù hợp" description="Chưa có tranh chấp nào khớp điều kiện lọc hiện tại." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã hồ sơ</TableHead>
                <TableHead>Hợp đồng &amp; Phòng</TableHead>
                <TableHead>Bên khiếu nại → Bị khiếu nại</TableHead>
                <TableHead>Loại / Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs font-bold">{d.disputeCode}</TableCell>
                  <TableCell className="text-xs">
                    <div className="font-semibold text-foreground">{d.roomTitle}</div>
                    <div className="font-mono text-[11px] text-foreground-muted">{d.contractId}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div><span className="font-semibold">{d.complainantName}</span> ({d.complainantRole})</div>
                    <div className="text-foreground-muted">→ {d.defendantName} ({d.defendantRole})</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-bold text-teal-700">{formatVnd(d.amount)}</div>
                    <div className="text-[11px] text-foreground-muted">{d.disputeType}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(d.status)} size="sm">{d.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted">{formatIsoDateTime(d.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => openDetail(d)}>
                      Xử lý
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Detail & Mediation Dialog */}
      <Dialog
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Hồ sơ ${selected.disputeCode} (${selected.status})` : ''}
        size="lg"
      >
        {selected && (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-muted border border-border">
              <div>
                <p className="text-foreground-muted">Hợp đồng / Phòng</p>
                <p className="font-semibold text-foreground">{selected.roomTitle}</p>
                <p className="font-mono text-[11px] text-foreground-muted">{selected.contractId}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Số tiền tranh chấp</p>
                <p className="text-base font-black text-teal-700">{formatVnd(selected.amount)}</p>
                <p className="text-[11px] text-foreground-muted">{selected.disputeType}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Bên khiếu nại</p>
                <p className="font-semibold">{selected.complainantName} ({selected.complainantRole})</p>
                <p className="font-mono text-[11px] text-foreground-muted">{selected.complainantId}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Bên bị khiếu nại</p>
                <p className="font-semibold">{selected.defendantName} ({selected.defendantRole})</p>
                <p className="font-mono text-[11px] text-foreground-muted">{selected.defendantId}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="font-semibold text-foreground">Nội dung khiếu nại</p>
              <p className="p-3 rounded-lg border border-border bg-background text-foreground leading-relaxed">{selected.reason}</p>
              {selected.evidenceUrls && selected.evidenceUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selected.evidenceUrls.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-teal-700 underline font-mono text-[11px]">
                      Bằng chứng #{idx + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Linked Escrow info */}
            <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-700" />
                <div>
                  <p className="font-semibold">Ký quỹ Escrow liên kết</p>
                  {linkedEscrow ? (
                    <p className="text-foreground-muted">
                      Số tiền giữ: <span className="font-bold text-foreground">{formatVnd(linkedEscrow.amount)}</span> • Trạng thái:{' '}
                      <Badge variant={linkedEscrow.status === 'DISPUTE_FROZEN' ? 'danger' : linkedEscrow.status === 'HELD' ? 'warning' : 'success'} size="sm">
                        {linkedEscrow.status}
                      </Badge>
                    </p>
                  ) : (
                    <p className="text-foreground-muted">Không có khoản ký quỹ Escrow gắn với hợp đồng này</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline events */}
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Diễn biến hòa giải ({selected.events?.length || 0})</p>
              <div className="space-y-2 max-h-44 overflow-y-auto border border-border rounded-lg p-3">
                {!selected.events || selected.events.length === 0 ? (
                  <p className="text-foreground-muted">Chưa có ghi nhận sự kiện nào.</p>
                ) : (
                  selected.events.map((ev) => (
                    <div key={ev.id} className="border-b border-border/50 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center justify-between text-[11px] text-foreground-muted">
                        <span className="font-semibold text-foreground">{ev.actorId} • {ev.eventType}</span>
                        <span>{formatIsoDateTime(ev.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-foreground">{ev.message}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  placeholder="Ghi chú biên bản làm việc hoặc phản hồi hòa giải..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button type="submit" variant="outline" size="sm" isLoading={busy} leftIcon={<MessageSquarePlus className="w-3.5 h-3.5" />}>
                  Gửi
                </Button>
              </form>
            </div>

            {/* Mediation / Resolution actions */}
            {selected.status === 'PENDING' && (
              <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 space-y-3">
                <p className="font-semibold flex items-center gap-1.5 text-sky-900 dark:text-sky-200">
                  <ShieldAlert className="w-4 h-4" /> Bước 1: Tiếp nhận hòa giải
                </p>
                <Input
                  placeholder="Ghi chú tiếp nhận hòa giải..."
                  value={mediateNote}
                  onChange={(e) => setMediateNote(e.target.value)}
                />
                {linkedEscrow?.status === 'HELD' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freezeOnMediate}
                      onChange={(e) => setFreezeOnMediate(e.target.checked)}
                    />
                    <span>Đóng băng khoản cọc Escrow ({formatVnd(linkedEscrow.amount)}) trong thời gian hòa giải</span>
                  </label>
                )}
                <Button variant="primary" size="sm" isLoading={busy} leftIcon={<Lock className="w-3.5 h-3.5" />} onClick={handleMediate}>
                  Tiếp nhận hòa giải
                </Button>
              </div>
            )}

            {(selected.status === 'PENDING' || selected.status === 'MEDIATING') ? (
              <form onSubmit={handleResolve} className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                <p className="font-semibold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> Ra phán quyết &amp; Tất toán
                </p>
                <Select
                  label="Hành động tài chính kèm theo"
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value as typeof resolutionAction)}
                  options={[
                    ...(linkedEscrow && (linkedEscrow.status === 'HELD' || linkedEscrow.status === 'DISPUTE_FROZEN')
                      ? [
                          { value: 'REFUND_TENANT', label: 'Hoàn 100% cọc Escrow cho Người thuê' },
                          { value: 'RELEASE_LANDLORD', label: 'Giải ngân cọc Escrow cho Chủ trọ' },
                        ]
                      : []),
                    { value: 'NO_ESCROW_ACTION', label: 'Giải quyết hành chính (không đụng Escrow)' },
                    { value: 'REJECT', label: 'Bác bỏ / Từ chối khiếu nại' },
                  ]}
                />
                <Input
                  label="Nội dung phán quyết chính thức"
                  required
                  placeholder="Nhập kết luận và lý do phán quyết..."
                  value={verdictText}
                  onChange={(e) => setVerdictText(e.target.value)}
                />
                <Button type="submit" variant="primary" size="sm" isLoading={busy} leftIcon={<Gavel className="w-3.5 h-3.5" />}>
                  Xác nhận phán quyết &amp; Đóng hồ sơ
                </Button>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl border border-border bg-surface-muted space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-teal-600" /> Kết luận phán quyết ({selected.status})
                </p>
                <p>{selected.verdict || 'Không có ghi chú phán quyết'}</p>
                <p className="text-[11px] text-foreground-muted">
                  Người xử lý: {selected.mediatorId || '-'} • Hoàn tất lúc: {formatIsoDateTime(selected.resolvedAt || undefined)}
                </p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
