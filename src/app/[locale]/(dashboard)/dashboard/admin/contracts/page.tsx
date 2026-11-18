'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiClient } from '@/infrastructure/http/api-client';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { EscrowHold } from '@/domain/entities/Billing';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import {
  Ban,
  CheckCircle2,
  Eye,
  FileText,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Unlock,
} from 'lucide-react';

interface SagaRecord {
  sagaId: string;
  currentState?: string;
  status?: string;
  currentStep?: string;
  compensationStep?: string | null;
  retryCount: number;
  updatedAt?: string;
}

function contractBadge(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PENDING_SIGN':
      return 'warning';
    case 'TERMINATED':
      return 'danger';
    default:
      return 'neutral';
  }
}

function escrowBadge(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status) {
    case 'HELD':
      return 'warning';
    case 'DISPUTE_FROZEN':
      return 'danger';
    case 'RELEASED':
    case 'REFUNDED':
      return 'success';
    case 'AWAITING_DEPOSIT':
      return 'info';
    default:
      return 'neutral';
  }
}

export default function AdminContractsPage() {
  const [activeTab, setActiveTab] = useState<'CONTRACTS' | 'SAGAS'>('CONTRACTS');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [escrows, setEscrows] = useState<EscrowHold[]>([]);
  const [sagas, setSagas] = useState<SagaRecord[]>([]);
  const [manualSagas, setManualSagas] = useState<SagaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Saga manual lookup
  const [sagaIdInput, setSagaIdInput] = useState('');
  const [lookedUpSaga, setLookedUpSaga] = useState<SagaRecord | null>(null);
  const [compReason, setCompReason] = useState('Manual admin compensation');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cList, eList, sList, mList] = await Promise.all([
        ApiClient.get<Contract[]>('/booking/contracts/admin').catch(() => []),
        container.billing.billingRepository.getAdminEscrows(),
        ApiClient.get<SagaRecord[]>('/booking/sagas').catch(() => []),
        ApiClient.get<SagaRecord[]>('/booking/sagas/manual-queue').catch(() => []),
      ]);
      setContracts(Array.isArray(cList) ? cList : []);
      setEscrows(eList);
      setSagas(Array.isArray(sList) ? sList : []);
      setManualSagas(Array.isArray(mList) ? mList : []);
    } catch {
      toast.error('Không thể tải dữ liệu hợp đồng quản trị');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const escrowByContract = useMemo(() => {
    const map = new Map<string, EscrowHold>();
    escrows.forEach((e) => map.set(e.contractId, e));
    return map;
  }, [escrows]);

  const filteredContracts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return contracts.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.contractCode.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.roomId.toLowerCase().includes(q) ||
        c.tenantId.toLowerCase().includes(q) ||
        c.landlordId.toLowerCase().includes(q)
      );
    });
  }, [contracts, statusFilter, searchTerm]);

  const selectedEscrow = selectedContract ? escrowByContract.get(selectedContract.id) || null : null;

  const handleEscrowAction = async (type: 'freeze' | 'unfreeze' | 'release' | 'refund') => {
    if (!selectedContract) return;
    setBusy(true);
    try {
      if (type === 'freeze') {
        await container.billing.billingRepository.freezeEscrow(
          selectedContract.id,
          actionReason.trim() || 'Đóng băng ký quỹ bởi Admin'
        );
      } else if (type === 'unfreeze') {
        await container.billing.billingRepository.unfreezeEscrow(selectedContract.id);
      } else if (type === 'release') {
        await container.billing.billingRepository.releaseEscrow(selectedContract.id);
      } else {
        await container.billing.billingRepository.refundEscrow(
          selectedContract.id,
          actionReason.trim() || 'Hoàn cọc theo quyết định Admin'
        );
      }
      setActionReason('');
      await loadAll();
      toast.success('Đã cập nhật trạng thái ký quỹ Escrow thành công');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác ký quỹ thất bại');
    } finally {
      setBusy(false);
    }
  };

  const handleTerminateContract = async () => {
    if (!selectedContract) return;
    setBusy(true);
    try {
      const updated = await ApiClient.post<Contract>(
        `/booking/contracts/${encodeURIComponent(selectedContract.id)}/admin-terminate`,
        { reason: actionReason.trim() || 'Chấm dứt hợp đồng bởi Admin' }
      );
      setSelectedContract(updated);
      setActionReason('');
      await loadAll();
      toast.success('Đã chấm dứt hợp đồng');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể chấm dứt hợp đồng');
    } finally {
      setBusy(false);
    }
  };

  const handleLookupSaga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sagaIdInput.trim()) return;
    setBusy(true);
    try {
      const res = await ApiClient.get<SagaRecord>(`/booking/sagas/${encodeURIComponent(sagaIdInput.trim())}`);
      setLookedUpSaga(res);
    } catch (err: unknown) {
      setLookedUpSaga(null);
      toast.error(err instanceof Error ? err.message : 'Không tìm thấy Saga');
    } finally {
      setBusy(false);
    }
  };

  const handleCompensateSaga = async (targetSagaId: string) => {
    setBusy(true);
    try {
      const res = await ApiClient.post<SagaRecord>(`/booking/sagas/${encodeURIComponent(targetSagaId)}/compensate`, {
        reason: compReason,
      });
      setLookedUpSaga(res);
      await loadAll();
      toast.success('Đã chạy bù trừ Saga thành công');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể bù trừ Saga');
    } finally {
      setBusy(false);
    }
  };

  const handleResolveManualSaga = async (targetSagaId: string) => {
    setBusy(true);
    try {
      await ApiClient.post(`/booking/sagas/${encodeURIComponent(targetSagaId)}/resolve-manual`, {
        resolutionNote: compReason || 'Resolved by Admin',
      });
      await loadAll();
      toast.success('Đã xử lý Saga hàng đợi thủ công');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể xử lý Saga thủ công');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Quản lý hợp đồng, Ký quỹ &amp; Saga Orchestrator
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Giám sát toàn bộ hợp đồng thuê phòng, xử lý ký quỹ Escrow và điều phối bù trừ Saga bị kẹt.
          </p>
        </div>
        <Button variant="outline" size="sm" isLoading={loading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={loadAll}>
          Làm mới
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button variant={activeTab === 'CONTRACTS' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('CONTRACTS')}>
          Danh sách Hợp đồng ({contracts.length})
        </Button>
        <Button variant={activeTab === 'SAGAS' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('SAGAS')}>
          Saga &amp; Hàng đợi thủ công ({manualSagas.length} cần xử lý / {sagas.length} tổng)
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : activeTab === 'CONTRACTS' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'ACTIVE', 'PENDING_SIGN', 'TERMINATED'] as const).map((st) => (
                <Button key={st} variant={statusFilter === st ? 'primary' : 'outline'} size="sm" onClick={() => setStatusFilter(st)}>
                  {st === 'ALL' ? 'Tất cả' : st}
                </Button>
              ))}
            </div>
            <div className="w-full sm:w-80">
              <Input
                placeholder="Tìm mã HĐ, mã phòng, tenant, landlord..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>

          {filteredContracts.length === 0 ? (
            <EmptyState title="Không tìm thấy hợp đồng" description="Không có hợp đồng nào khớp bộ lọc hiện tại." />
          ) : (
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã hợp đồng</TableHead>
                    <TableHead>Khách thuê / Chủ trọ</TableHead>
                    <TableHead>Giá thuê / Cọc</TableHead>
                    <TableHead>Trạng thái HĐ</TableHead>
                    <TableHead>Ký quỹ Escrow</TableHead>
                    <TableHead>Thời hạn</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((c) => {
                    const esc = escrowByContract.get(c.id);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="text-xs">
                          <div className="font-mono font-bold">{c.contractCode}</div>
                          <div className="font-mono text-[11px] text-foreground-muted">{c.id}</div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          <div>T: {c.tenantId}</div>
                          <div className="text-foreground-muted">L: {c.landlordId}</div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-bold text-teal-700">{formatVnd(c.monthlyRent)}/th</div>
                          <div className="text-foreground-muted">Cọc: {formatVnd(c.depositAmount)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={contractBadge(c.status)} size="sm">{c.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {esc ? (
                            <div className="space-y-0.5">
                              <Badge variant={escrowBadge(esc.status)} size="sm">{esc.status}</Badge>
                              <div className="text-[11px] text-foreground-muted">{formatVnd(esc.amount)}</div>
                            </div>
                          ) : (
                            <span className="text-foreground-muted">Chưa có</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-foreground-muted">
                          {c.startDate} → {c.endDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelectedContract(c)}>
                            Quản lý
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <Card className="p-5 space-y-4">
            <form onSubmit={handleLookupSaga} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-56">
                <Input label="Tra cứu nhanh theo Saga ID" required value={sagaIdInput} onChange={(e) => setSagaIdInput(e.target.value)} />
              </div>
              <Button type="submit" variant="primary" size="md" isLoading={busy} leftIcon={<Search className="w-4 h-4" />}>
                Tra cứu
              </Button>
            </form>

            {lookedUpSaga && (
              <div className="p-4 rounded-xl border border-border space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{lookedUpSaga.sagaId}</span>
                  <Badge variant={lookedUpSaga.status === 'COMPLETED' ? 'success' : 'warning'} size="md">
                    {lookedUpSaga.status || lookedUpSaga.currentState}
                  </Badge>
                </div>
                <p className="text-foreground-muted">
                  Bước: {lookedUpSaga.currentStep || '-'} • Retry: {lookedUpSaga.retryCount} • Cập nhật: {formatIsoDateTime(lookedUpSaga.updatedAt)}
                </p>
                <div className="flex flex-wrap gap-2 items-center pt-1">
                  <Input value={compReason} onChange={(e) => setCompReason(e.target.value)} />
                  <Button variant="outline" size="sm" isLoading={busy} onClick={() => handleCompensateSaga(lookedUpSaga.sagaId)}>
                    Chạy bù trừ (Compensate)
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-border text-xs font-bold flex items-center justify-between">
              <span>Danh sách Saga trong hệ thống ({sagas.length})</span>
              <span className="text-foreground-muted font-normal">Hàng đợi cần can thiệp: {manualSagas.length}</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Saga ID</TableHead>
                  <TableHead>Bước hiện tại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Retry</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sagas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-xs py-6 text-foreground-muted">
                      Chưa có bản ghi Saga nào trong hệ thống.
                    </TableCell>
                  </TableRow>
                ) : (
                  sagas.map((s) => {
                    const state = s.status || s.currentState || '-';
                    return (
                      <TableRow key={s.sagaId}>
                        <TableCell className="font-mono text-xs font-bold">{s.sagaId}</TableCell>
                        <TableCell className="text-xs">{s.currentStep || s.compensationStep || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={state === 'COMPLETED' ? 'success' : state === 'MANUAL_INTERVENTION_REQUIRED' ? 'danger' : 'warning'} size="sm">
                            {state}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{s.retryCount}</TableCell>
                        <TableCell className="text-xs text-foreground-muted">{formatIsoDateTime(s.updatedAt)}</TableCell>
                        <TableCell className="text-right space-x-1.5">
                          {state === 'MANUAL_INTERVENTION_REQUIRED' && (
                            <Button variant="primary" size="sm" isLoading={busy} onClick={() => handleResolveManualSaga(s.sagaId)}>
                              Xử lý thủ công
                            </Button>
                          )}
                          {state !== 'COMPENSATED' && (
                            <Button variant="outline" size="sm" isLoading={busy} onClick={() => handleCompensateSaga(s.sagaId)}>
                              Bù trừ
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Contract & Escrow Action Dialog */}
      <Dialog
        isOpen={Boolean(selectedContract)}
        onClose={() => setSelectedContract(null)}
        title={selectedContract ? `Hợp đồng ${selectedContract.contractCode}` : ''}
        size="lg"
      >
        {selectedContract && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-muted border border-border">
              <div>
                <p className="text-foreground-muted">Contract ID / Room ID</p>
                <p className="font-mono font-semibold">{selectedContract.id}</p>
                <p className="font-mono text-[11px] text-foreground-muted">Phòng: {selectedContract.roomId}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Trạng thái hợp đồng</p>
                <Badge variant={contractBadge(selectedContract.status)} size="sm">{selectedContract.status}</Badge>
              </div>
              <div>
                <p className="text-foreground-muted">Khách thuê (Tenant)</p>
                <p className="font-mono font-semibold">{selectedContract.tenantId}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Chủ trọ (Landlord)</p>
                <p className="font-mono font-semibold">{selectedContract.landlordId}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Tiền thuê / Tiền cọc</p>
                <p className="font-bold text-teal-700">{formatVnd(selectedContract.monthlyRent)} / Cọc {formatVnd(selectedContract.depositAmount)}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Ký quỹ Escrow</p>
                {selectedEscrow ? (
                  <p>
                    <Badge variant={escrowBadge(selectedEscrow.status)} size="sm">{selectedEscrow.status}</Badge>{' '}
                    ({formatVnd(selectedEscrow.amount)})
                  </p>
                ) : (
                  <p className="text-foreground-muted">Chưa khởi tạo</p>
                )}
              </div>
            </div>

            <Input
              label="Lý do thao tác (nếu đóng băng / hoàn cọc / chấm dứt HĐ)"
              placeholder="Ví dụ: Hai bên thống nhất hủy hợp đồng..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            />

            <div className="flex flex-wrap gap-2 pt-1">
              {selectedEscrow?.status === 'HELD' && (
                <>
                  <Button variant="outline" size="sm" isLoading={busy} leftIcon={<Lock className="w-3.5 h-3.5" />} onClick={() => handleEscrowAction('freeze')}>
                    Đóng băng Escrow
                  </Button>
                  <Button variant="primary" size="sm" isLoading={busy} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => handleEscrowAction('release')}>
                    Giải ngân cho Chủ trọ
                  </Button>
                  <Button variant="outline" size="sm" isLoading={busy} onClick={() => handleEscrowAction('refund')}>
                    Hoàn cọc cho Khách thuê
                  </Button>
                </>
              )}
              {selectedEscrow?.status === 'DISPUTE_FROZEN' && (
                <>
                  <Button variant="outline" size="sm" isLoading={busy} leftIcon={<Unlock className="w-3.5 h-3.5" />} onClick={() => handleEscrowAction('unfreeze')}>
                    Gỡ đóng băng
                  </Button>
                  <Button variant="outline" size="sm" isLoading={busy} onClick={() => handleEscrowAction('refund')}>
                    Hoàn cọc cho Khách thuê
                  </Button>
                </>
              )}
              {selectedContract.status !== 'TERMINATED' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  isLoading={busy}
                  leftIcon={<Ban className="w-3.5 h-3.5" />}
                  onClick={handleTerminateContract}
                >
                  Chấm dứt hợp đồng (Admin)
                </Button>
              )}
            </div>
            <p className="text-[11px] text-foreground-muted flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Các thao tác giải ngân/hoàn cọc sẽ hạch toán bút toán kép vào sổ cái billing-service.
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
