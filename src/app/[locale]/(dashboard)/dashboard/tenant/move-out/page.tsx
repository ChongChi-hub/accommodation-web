'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { EscrowHold, RefundItem } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import {
  AlertCircle,
  CheckCircle2,
  DoorOpen,
  Landmark,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function TenantMoveOutPage() {
  const tAuto = useTranslations('autoI18n');
  const tc = useTranslations('sprint3.common');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [escrowHold, setEscrowHold] = useState<EscrowHold | null>(null);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // Settlement Form State
  const [finalElecReading, setFinalElecReading] = useState('150');
  const [finalWaterReading, setFinalWaterReading] = useState('30');
  const [damageDeduction, setDamageDeduction] = useState('0');
  const [deductionReason, setDeductionReason] = useState('Không có hư hại phát sinh');

  // Bank Info for Refund
  const [bankCode, setBankCode] = useState('VCB');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cList, rList] = await Promise.all([
        container.contract.contractRepository.getTenantContracts().catch(() => []),
        container.billing.billingRepository.getTenantRefunds().catch(() => []),
      ]);
      setContracts(cList);
      setRefunds(rList);
      if (cList.length > 0) {
        setSelectedContractId((prev) => prev || cList[0].id);
      }
    } catch {
      toast.error('Không thể tải dữ liệu hợp đồng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || contracts[0] || null;

  const loadEscrow = useCallback(async (contractId: string) => {
    if (!contractId) {
      setEscrowHold(null);
      return;
    }
    try {
      const hold = await container.billing.billingRepository.getEscrowHold(contractId);
      setEscrowHold(hold);
    } catch {
      setEscrowHold(null);
    }
  }, []);

  useEffect(() => {
    if (selectedContract?.id) {
      loadEscrow(selectedContract.id);
    }
  }, [selectedContract?.id, loadEscrow]);

  // Calculations
  const initialDeposit = escrowHold?.amount || selectedContract?.depositAmount || 2000000;
  const numDeduction = Number(damageDeduction) || 0;
  const netRefundAmount = Math.max(0, initialDeposit - numDeduction);

  const handleRequestMoveOutSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    setBusy(true);
    try {
      const fullReason = `Quyết toán trả phòng (Điện chốt: ${finalElecReading} kWh, Nước chốt: ${finalWaterReading} m3, Khấu trừ: ${formatVnd(numDeduction)} - Lý do: ${deductionReason})`;
      const refund = await container.billing.billingRepository.requestRefund({
        contractId: selectedContract.id,
        landlordId: selectedContract.landlordId,
        amount: netRefundAmount > 0 ? netRefundAmount : 1000,
        bankCode: bankCode.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        otpCode: otpCode.trim(),
        reason: fullReason,
      });
      setRefunds((prev) => [refund, ...prev]);
      setOtpCode('');
      toast.success('Đã gửi yêu cầu quyết toán trả phòng & hoàn tiền cọc thành công!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Yêu cầu quyết toán thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <DoorOpen className="w-5 h-5 text-teal-600" />
          {tAuto('k0353')}
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5">{tAuto('k0354')}</p>
      </div>

      {/* Contract Selection & Escrow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2 md:col-span-2">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Chọn hợp đồng phòng cần trả
          </label>
          <select
            className="w-full text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-background p-2.5"
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
          >
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contractCode} - Phòng #{c.roomId} (Cọc: {formatVnd(c.depositAmount)})
              </option>
            ))}
          </select>
          {selectedContract && (
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-stone-500">
              <span>Bắt đầu: {selectedContract.startDate}</span>
              <span>Kết thúc: {selectedContract.endDate}</span>
              <span>Trạng thái: <Badge variant="info" size="sm">{selectedContract.status}</Badge></span>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Tiền cọc trong quỹ Escrow</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-black text-teal-700">{formatVnd(initialDeposit)}</p>
          <p className="text-[11px] text-stone-400">
            {escrowHold?.status ? `Trạng thái: ${escrowHold.status}` : 'Chờ hoàn trả khi nghiệm thu'}
          </p>
        </Card>
      </div>

      {/* Settlement Calculation & Form */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
          <Receipt className="w-5 h-5 text-teal-600" />
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Quyết toán Bàn giao Phòng &amp; Hoàn trả Tiền cọc
            </h2>
            <p className="text-xs text-stone-500">
              Đối chiếu chỉ số điện nước bàn giao và thỏa thuận cấn trừ hư hỏng (nếu có).
            </p>
          </div>
        </div>

        <form onSubmit={handleRequestMoveOutSettlement} className="space-y-6">
          {/* Handover Readings & Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Chỉ số điện chốt (kWh)"
              type="number"
              min={0}
              required
              value={finalElecReading}
              onChange={(e) => setFinalElecReading(e.target.value)}
              helperText="Chỉ số công tơ điện khi dọn đi"
            />
            <Input
              label="Chỉ số nước chốt (m³)"
              type="number"
              min={0}
              required
              value={finalWaterReading}
              onChange={(e) => setFinalWaterReading(e.target.value)}
              helperText="Chỉ số đồng hồ nước khi dọn đi"
            />
            <Input
              label="Khấu trừ bồi thường (VND)"
              type="number"
              min={0}
              required
              value={damageDeduction}
              onChange={(e) => setDamageDeduction(e.target.value)}
              helperText="Tiền cấn trừ hư hỏng/dịch vụ tồn (nếu có)"
            />
            <Input
              label="Lý do khấu trừ"
              value={deductionReason}
              onChange={(e) => setDeductionReason(e.target.value)}
              helperText="Chi tiết các khoản cấn trừ đã đồng thuận"
            />
          </div>

          {/* Net Settlement Calculation Summary Banner */}
          <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/30 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                Số tiền cọc thực nhận hoàn lại (Net Refund):
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-teal-800 dark:text-teal-300">
                  {formatVnd(netRefundAmount)}
                </span>
                <span className="text-xs text-stone-500">
                  (= {formatVnd(initialDeposit)} tiền cọc - {formatVnd(numDeduction)} khấu trừ)
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-stone-500">
              <p>Hệ thống tự động giải phóng cọc</p>
              <p>vào tài khoản ngân hàng thụ hưởng</p>
            </div>
          </div>

          {/* Tenant Beneficiary Bank & TOTP */}
          <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200">
              Tài khoản ngân hàng nhận tiền cọc hoàn lại &amp; Xác thực TOTP
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input
                label="Ngân hàng thụ hưởng"
                required
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                placeholder="VCB, MB, TCB..."
              />
              <Input
                label="Số tài khoản ngân hàng"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="0123456789"
              />
              <Input
                label="Tên chủ tài khoản"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="NGUYEN VAN A"
              />
              <Input
                label="Mã TOTP xác thực (6 số)"
                required
                pattern="[0-9]{6}"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                helperText="Mã xác thực an toàn"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={busy}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Gửi yêu cầu thanh lý hợp đồng &amp; Hoàn cọc
            </Button>
          </div>
        </form>
      </Card>

      {/* Move-Out & Refund Requests History */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
          <span>Lịch sử Yêu cầu Thanh lý Trả phòng &amp; Hoàn cọc ({refunds.length})</span>
          <span className="text-[11px] text-stone-500 font-normal">Theo dõi tiến độ hoàn tiền</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã yêu cầu</TableHead>
              <TableHead>Mã hợp đồng</TableHead>
              <TableHead>Số tiền hoàn</TableHead>
              <TableHead>Tài khoản nhận</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs py-5 text-stone-500">
                  Chưa có yêu cầu thanh lý trả phòng nào được tạo
                </TableCell>
              </TableRow>
            ) : (
              refunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-semibold">{r.refundCode}</TableCell>
                  <TableCell className="font-mono text-xs">{r.contractId}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(r.amount)}</TableCell>
                  <TableCell className="text-xs">
                    {r.bankCode} - {r.accountNumber} ({r.accountHolder})
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-stone-500">{formatIsoDateTime(r.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
