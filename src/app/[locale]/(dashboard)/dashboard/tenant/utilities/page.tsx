'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { UtilityReading } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Droplets,
  ExternalLink,
  Gauge,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function TenantUtilitiesPage() {
  const t = useTranslations('sprint3.utilities');
  const tc = useTranslations('sprint3.common');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractId, setContractId] = useState('');
  const [readings, setReadings] = useState<UtilityReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Photo preview modal
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Dispute modal
  const [disputingReading, setDisputingReading] = useState<UtilityReading | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedContract = contracts.find((c) => c.id === contractId);

  useEffect(() => {
    container.contract.contractRepository
      .getTenantContracts()
      .then((list) => {
        setContracts(list);
        if (list.length > 0) {
          setContractId(list[0].id);
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const loadReadings = useCallback(async (cid: string) => {
    if (!cid) return;
    try {
      const list = await container.billing.billingRepository.getContractReadings(cid);
      setReadings(list);
    } catch {
      setReadings([]);
    }
  }, []);

  useEffect(() => {
    if (contractId) {
      loadReadings(contractId);
    }
  }, [contractId, loadReadings]);

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingReading || !disputeReason.trim()) return;
    setBusy(true);
    try {
      const updated = await container.billing.billingRepository.disputeUtilityReading(
        disputingReading.id,
        disputeReason.trim()
      );
      setReadings((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setDisputingReading(null);
      setDisputeReason('');
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full max-w-5xl rounded-xl" />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {t('tenantTitle')}
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{t('tenantSubtitle')}</p>
        </div>
        {contracts.length > 1 && (
          <div className="w-64">
            <Select
              label={t('contractSelect')}
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              options={contracts.map((c) => ({
                value: c.id,
                label: `${c.contractCode} (Phòng #${c.roomId})`,
              }))}
            />
          </div>
        )}
      </div>

      {selectedContract && (
        <Card className="p-5 border-l-4 border-l-teal-600 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {t('contractRatesTitle')} ({selectedContract.contractCode})
              </h2>
            </div>
            <Badge variant="neutral" size="sm">
              Phòng #{selectedContract.roomId}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {t('elecInitialHandover')}:{' '}
                  <strong className="text-amber-700 dark:text-amber-300">
                    {selectedContract.initialElectricityReading ?? 0} kWh
                  </strong>
                </p>
                <p className="text-stone-600 dark:text-stone-400">
                  Đơn giá hợp đồng:{' '}
                  <strong>{formatVnd(selectedContract.electricityRate ?? 3500)} / kWh</strong>
                </p>
                <p className="text-[11px] text-stone-400">
                  Công tơ đo lường độc lập cho phòng thuê của bạn
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-start gap-3">
              <Droplets className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {t('waterInitialHandover')}:{' '}
                  <strong className="text-sky-700 dark:text-sky-300">
                    {selectedContract.initialWaterReading ?? 0} m³
                  </strong>
                </p>
                <p className="text-stone-600 dark:text-stone-400">
                  Đơn giá hợp đồng:{' '}
                  <strong>{formatVnd(selectedContract.waterRate ?? 25000)} / m³</strong>
                </p>
                <p className="text-[11px] text-stone-400">
                  Đồng hồ đo lường độc lập cho phòng thuê của bạn
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Monthly Readings Transparency Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('periodMonth')}</TableHead>
              <TableHead>Điện (kWh)</TableHead>
              <TableHead>Nước (m³)</TableHead>
              <TableHead>{t('totalUtility')}</TableHead>
              <TableHead>{t('proofPhotos')}</TableHead>
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead className="text-right">Đối chiếu & Báo cáo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-xs py-8 text-stone-500">
                  {t('noReadings')}
                </TableCell>
              </TableRow>
            ) : (
              readings.map((r) => {
                const elecRate = selectedContract?.electricityRate ?? 3500;
                const waterRate = selectedContract?.waterRate ?? 25000;
                const totalAmount = r.electricityCost + r.waterCost;
                const images = r.imageUrls || [];

                return (
                  <TableRow
                    key={r.id}
                    className={r.status === 'DISPUTED' ? 'bg-amber-500/5 border-l-4 border-l-amber-500' : ''}
                  >
                    <TableCell className="text-xs font-semibold">
                      {formatIsoDate(r.periodMonth)}
                      <span className="block text-[10px] text-stone-400 font-normal">v{r.revision}</span>
                    </TableCell>

                    {/* Electricity Breakdown */}
                    <TableCell className="text-xs">
                      <div>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {r.electricConsumption} kWh
                        </span>{' '}
                        <span className="text-[11px] text-stone-400">
                          ({r.electricPrev} → {r.electricCurr})
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {formatVnd(r.electricityCost)} ({r.electricConsumption} × {formatVnd(elecRate)})
                      </div>
                    </TableCell>

                    {/* Water Breakdown */}
                    <TableCell className="text-xs">
                      <div>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {r.waterConsumption} m³
                        </span>{' '}
                        <span className="text-[11px] text-stone-400">
                          ({r.waterPrev} → {r.waterCurr})
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {formatVnd(r.waterCost)} ({r.waterConsumption} × {formatVnd(waterRate)})
                      </div>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="font-bold text-teal-700 dark:text-teal-400 text-sm">
                      {formatVnd(totalAmount)}
                    </TableCell>

                    {/* Proof Photos Thumbnail */}
                    <TableCell>
                      {images.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewPhoto(img)}
                              className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs inline-flex items-center gap-1 font-medium transition-colors"
                              title="Bấm để xem ảnh đối chiếu"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Ảnh #{idx + 1}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">Chưa có ảnh</span>
                      )}
                    </TableCell>

                    {/* Status / Surge Warning */}
                    <TableCell>
                      {r.status === 'DISPUTED' ? (
                        <div>
                          <Badge variant="warning" size="sm">
                            <ShieldAlert className="w-3 h-3 mr-1 inline" />
                            {t('disputedBadge')}
                          </Badge>
                          {r.editReason && (
                            <span className="block text-[10px] text-amber-700 dark:text-amber-300 italic max-w-xs mt-0.5">
                              &quot;{r.editReason}&quot;
                            </span>
                          )}
                        </div>
                      ) : r.hasSurgeAnomaly ? (
                        <Badge variant="warning" size="sm">
                          {t('surgeBadge')}
                        </Badge>
                      ) : r.status === 'ACTIVE' ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                          {t('tenantConfirmedBadge')}
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          {r.status}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions: Dispute or Report Fraud */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {r.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                            onClick={() => {
                              setDisputingReading(r);
                              setDisputeReason('');
                            }}
                          >
                            {t('disputeBtn')}
                          </Button>
                        )}
                        <Link
                          href={`/support/new?category=BILLING&subject=${encodeURIComponent(
                            `Thắc mắc chỉ số điện nước kỳ ${formatIsoDate(r.periodMonth)} - HĐ ${
                              selectedContract?.contractCode || ''
                            }`
                          )}`}
                        >
                          <Button variant="ghost" size="sm" title={t('reportFraud')}>
                            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Tenant Dispute Dialog */}
      <Dialog
        isOpen={Boolean(disputingReading)}
        onClose={() => setDisputingReading(null)}
        title={t('disputeTitle')}
        size="md"
      >
        {disputingReading && (
          <form onSubmit={handleDisputeSubmit} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <p className="font-semibold">{t('disputePrompt')}</p>
              <p>
                Kỳ ghi nhận: <strong>{formatIsoDate(disputingReading.periodMonth)}</strong> | Điện:{' '}
                <strong>{disputingReading.electricConsumption} kWh</strong> | Nước:{' '}
                <strong>{disputingReading.waterConsumption} m³</strong>
              </p>
            </div>

            <Input
              label="Lý do đối soát lại"
              required
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Ví dụ: Chỉ số trên ảnh chụp là 245 kWh chứ không phải 270 kWh, đề nghị chủ trọ kiểm tra lại..."
              helperText="Yêu cầu này sẽ được gửi trực tiếp đến chủ trọ để đối chiếu và chỉnh sửa kịp thời."
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setDisputingReading(null)}>
                {tc('cancel')}
              </Button>
              <Button variant="primary" type="submit" isLoading={busy}>
                Gửi yêu cầu đối soát
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Photo Preview Modal */}
      <Dialog
        isOpen={Boolean(previewPhoto)}
        onClose={() => setPreviewPhoto(null)}
        title={t('viewPhoto')}
        size="md"
      >
        <div className="space-y-3 pt-2 text-center">
          {previewPhoto && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto}
                alt="Meter photo"
                className="max-h-96 mx-auto rounded-lg border object-contain shadow-sm"
              />
              <div className="pt-3">
                <a
                  href={previewPhoto}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở ảnh gốc trong tab mới
                </a>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
