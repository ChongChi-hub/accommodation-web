'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Badge } from '@/presentation/components/ui/Badge';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { Invoice, UtilityReading } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatVnd } from '@/shared/utils/format-vnd';
import { AlertTriangle, ArrowRight, CheckCircle2, Droplets, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contracts: Contract[];
  landlordId: string;
  initialContractId?: string;
  initialPeriodMonth?: string;
  onCreated: (invoice: Invoice) => void;
}

function getDefaultPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function computeDueDate(periodMonth: string, paymentDueDay = 5): string {
  const parts = periodMonth.split('-');
  if (parts.length < 2) return periodMonth;
  const day = String(Math.min(28, Math.max(1, paymentDueDay))).padStart(2, '0');
  return `${parts[0]}-${parts[1]}-${day}`;
}

export function LandlordCreateInvoiceDialog({
  isOpen, onClose, contracts, landlordId, initialContractId, initialPeriodMonth, onCreated,
}: Props) {
  const t = useTranslations('sprint3.invoice');
  const tc = useTranslations('sprint3.common');
  const activeContracts = useMemo(
    () => contracts.filter((c) => c.status === 'ACTIVE' || c.status === 'AWAITING_DEPOSIT'),
    [contracts]
  );

  const [contractId, setContractId] = useState('');
  const [periodMonth, setPeriodMonth] = useState(getDefaultPeriodMonth);
  const [dueDate, setDueDate] = useState(() => computeDueDate(getDefaultPeriodMonth(), 5));
  const [serviceAmount, setServiceAmount] = useState('0');
  const [otherAmount, setOtherAmount] = useState('0');
  const [readings, setReadings] = useState<UtilityReading[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectedContract = activeContracts.find((c) => c.id === contractId) || activeContracts[0];

  useEffect(() => {
    if (!isOpen) return;
    const defaultCid = initialContractId && activeContracts.some((c) => c.id === initialContractId)
      ? initialContractId
      : (activeContracts[0]?.id || '');
    const defaultPeriod = initialPeriodMonth || getDefaultPeriodMonth();
    setContractId(defaultCid);
    setPeriodMonth(defaultPeriod);
    const found = activeContracts.find((c) => c.id === defaultCid);
    setDueDate(computeDueDate(defaultPeriod, found?.paymentDueDay ?? 5));
  }, [isOpen, initialContractId, initialPeriodMonth, activeContracts]);

  useEffect(() => {
    if (!isOpen || !selectedContract?.id) return;
    setLoadingReadings(true);
    container.billing.billingRepository.getContractReadings(selectedContract.id)
      .then((list) => setReadings(list.filter((r) => r.status !== 'CANCELLED')))
      .catch(() => setReadings([]))
      .finally(() => setLoadingReadings(false));
  }, [isOpen, selectedContract?.id]);

  const periodPrefix = periodMonth.slice(0, 7);
  const matchedReading = useMemo(
    () => readings.find((r) => r.periodMonth.startsWith(periodPrefix)) || null,
    [readings, periodPrefix]
  );

  const baseRent = selectedContract?.monthlyRent ?? 0;
  const elecCost = matchedReading?.electricityCost ?? 0;
  const waterCost = matchedReading?.waterCost ?? 0;
  const svcCost = Math.max(0, Number(serviceAmount) || 0);
  const othCost = Math.max(0, Number(otherAmount) || 0);
  const totalAmount = baseRent + elecCost + waterCost + svcCost + othCost;
  const platformFee = Math.round(totalAmount * 0.05);
  const landlordNet = totalAmount - platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    if (!matchedReading) {
      toast.error('Vui lòng ghi chỉ số điện nước cho kỳ tháng này trước khi tạo hóa đơn!');
      return;
    }
    setBusy(true);
    try {
      const created = await container.billing.billingRepository.generateInvoice({
        contractId: selectedContract.id,
        utilityReadingId: matchedReading.id,
        tenantId: selectedContract.tenantId,
        landlordId: landlordId || selectedContract.landlordId,
        periodMonth,
        dueDate,
        baseRent,
        electricityAmount: elecCost,
        waterAmount: waterCost,
        serviceAmount: svcCost,
        otherAmount: othCost,
      });
      toast.success(`Đã tạo và gửi hóa đơn ${created.invoiceCode} tới khách thuê!`);
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Tạo hóa đơn thu tiền tháng theo Hợp đồng" size="md">
      {activeContracts.length === 0 ? (
        <div className="p-4 text-xs text-stone-500">Chưa có hợp đồng đang hiệu lực để lập hóa đơn.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Hợp đồng thuê"
              value={selectedContract?.id || ''}
              onChange={(e) => {
                setContractId(e.target.value);
                const found = activeContracts.find((c) => c.id === e.target.value);
                setDueDate(computeDueDate(periodMonth, found?.paymentDueDay ?? 5));
              }}
              options={activeContracts.map((c) => ({
                value: c.id,
                label: `${c.contractCode} - Phòng #${c.roomId} (${formatVnd(c.monthlyRent)})`,
              }))}
            />
            <Input
              label={t('periodMonth')}
              type="date"
              required
              value={periodMonth}
              onChange={(e) => {
                setPeriodMonth(e.target.value);
                setDueDate(computeDueDate(e.target.value, selectedContract?.paymentDueDay ?? 5));
              }}
            />
            <Input label={t('dueDate')} type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          {loadingReadings ? (
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-500">Đang kiểm tra chỉ số điện nước kỳ {periodPrefix}...</div>
          ) : !matchedReading ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
              <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Chưa có chỉ số điện nước kỳ {periodPrefix} cho hợp đồng {selectedContract?.contractCode}</p>
                  <p className="mt-0.5 text-[11px]">
                    Bạn cần tính tiền điện nước (kèm ảnh đồng hồ để khách đối chiếu) trước khi lập hóa đơn gửi khách thuê.
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/landlord/utilities?contractId=${encodeURIComponent(selectedContract?.id || '')}&periodMonth=${encodeURIComponent(periodMonth)}`}
                onClick={onClose}
              >
                <Button type="button" variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Đi tới Ghi chỉ số điện nước kỳ {periodPrefix}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã khớp chỉ số điện nước kỳ {periodPrefix}
                </span>
                <Badge variant="success" size="sm">{matchedReading.imageUrls?.length || 0} ảnh đồng hồ</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Điện: {matchedReading.electricConsumption} kWh ({matchedReading.electricPrev} - {matchedReading.electricCurr}) = <strong>{formatVnd(elecCost)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                  <span>Nước: {matchedReading.waterConsumption} m³ ({matchedReading.waterPrev} - {matchedReading.waterCurr}) = <strong>{formatVnd(waterCost)}</strong></span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Tiền thuê phòng theo Hợp đồng (tự động)" value={formatVnd(baseRent)} disabled />
            <Input label="Tiền điện + nước đã chốt (tự động)" value={formatVnd(elecCost + waterCost)} disabled />
            <Input label="Phí dịch vụ cố định theo HĐ (VNĐ)" type="number" min={0} value={serviceAmount} onChange={(e) => setServiceAmount(e.target.value)} />
            <Input label="Chi phí cố định khác (VNĐ)" type="number" min={0} value={otherAmount} onChange={(e) => setOtherAmount(e.target.value)} />
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="flex justify-between font-bold text-sm text-stone-900 dark:text-stone-100">
              <span>Tổng hóa đơn khách cần chuyển:</span>
              <span className="text-teal-700 dark:text-teal-400">{formatVnd(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-amber-700 dark:text-amber-400">
              <span>Phí hoa hồng sàn Tổ Ấm (5%):</span>
              <span>- {formatVnd(platformFee)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 pt-1 border-t border-stone-200 dark:border-stone-800">
              <span>Số tiền cộng vào Ví chủ trọ sau khi Admin duyệt:</span>
              <span>+ {formatVnd(landlordNet)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>{tc('cancel')}</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={busy} disabled={!matchedReading}>
              Xác nhận gửi hóa đơn cho khách thuê
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
