'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { PricingModel, UtilityReading, UtilityReadingAudit } from '@/domain/entities/Billing';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import {
  AlertCircle,
  Camera,
  ExternalLink,
  History,
  Image as ImageIcon,
  Pencil,
  Save,
  ShieldAlert,
  XCircle,
  Zap,
  Droplets,
} from 'lucide-react';

export default function LandlordUtilitiesPage() {
  const t = useTranslations('sprint3.utilities');
  const tl = useTranslations('sprint3.ledger');
  const tc = useTranslations('sprint3.common');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractId, setContractId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [readings, setReadings] = useState<UtilityReading[]>([]);
  const [audits, setAudits] = useState<UtilityReadingAudit[] | null>(null);
  const [editing, setEditing] = useState<UtilityReading | null>(null);
  const [editReason, setEditReason] = useState('');
  const [busy, setBusy] = useState(false);

  // Meter photo preview modal
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const [form, setForm] = useState({
    periodMonth: '',
    pricingModel: 'FIXED' as PricingModel,
    electricPrev: '0',
    electricCurr: '0',
    waterPrev: '0',
    waterCurr: '0',
    fixedElectricUnitPrice: '3500',
    fixedWaterUnitPrice: '25000',
    occupantCount: '1',
    electricImageUrl: '',
    waterImageUrl: '',
  });

  const selectedContract = contracts.find((c) => c.id === contractId);

  const updateFormDefaults = useCallback((contract: Contract, existingReadings: UtilityReading[]) => {
    const active = existingReadings.filter((r) => r.status !== 'CANCELLED');
    const latest = active[0];

    const prevElec = latest ? latest.electricCurr : contract.initialElectricityReading ?? 0;
    const prevWater = latest ? latest.waterCurr : contract.initialWaterReading ?? 0;
    const elecRate = contract.electricityRate ? String(contract.electricityRate) : '3500';
    const waterRate = contract.waterRate ? String(contract.waterRate) : '25000';

    setForm((prev) => ({
      ...prev,
      electricPrev: String(prevElec),
      electricCurr: String(prevElec),
      waterPrev: String(prevWater),
      waterCurr: String(prevWater),
      fixedElectricUnitPrice: elecRate,
      fixedWaterUnitPrice: waterRate,
      pricingModel: 'FIXED',
    }));
  }, []);

  const loadReadings = useCallback(
    async (cid: string, contract?: Contract) => {
      if (!cid) return;
      try {
        const list = await container.billing.billingRepository.getContractReadings(cid);
        setReadings(list);
        if (contract) {
          updateFormDefaults(contract, list);
        }
      } catch {
        setReadings([]);
      }
    },
    [updateFormDefaults]
  );

  useEffect(() => {
    container.contract.contractRepository
      .getLandlordContracts()
      .then((list) => {
        setContracts(list);
        if (list.length > 0) {
          setContractId(list[0].id);
          setRoomId(list[0].roomId);
          loadReadings(list[0].id, list[0]);
        }
      })
      .catch(() => undefined);
  }, [loadReadings]);

  const handleContractChange = (cid: string) => {
    setContractId(cid);
    const found = contracts.find((c) => c.id === cid);
    if (found) {
      setRoomId(found.roomId);
      loadReadings(cid, found);
    }
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !roomId) return;
    setBusy(true);
    try {
      const images: string[] = [form.electricImageUrl.trim(), form.waterImageUrl.trim()].filter(Boolean);
      const created = await container.billing.billingRepository.recordUtilityReading({
        contractId,
        roomId,
        periodMonth: form.periodMonth,
        pricingModel: form.pricingModel,
        electricPrev: Number(form.electricPrev),
        electricCurr: Number(form.electricCurr),
        waterPrev: Number(form.waterPrev),
        waterCurr: Number(form.waterCurr),
        imageUrls: images.length > 0 ? images : undefined,
        fixedElectricUnitPrice: form.pricingModel === 'FIXED' ? Number(form.fixedElectricUnitPrice) : undefined,
        fixedWaterUnitPrice: form.pricingModel === 'FIXED' ? Number(form.fixedWaterUnitPrice) : undefined,
        occupantCount: Number(form.occupantCount),
      });
      setReadings((prev) => [created, ...prev]);
      setForm((prev) => ({
        ...prev,
        electricPrev: String(created.electricCurr),
        electricCurr: String(created.electricCurr),
        waterPrev: String(created.waterCurr),
        waterCurr: String(created.waterCurr),
        electricImageUrl: '',
        waterImageUrl: '',
      }));
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      const updated = await container.billing.billingRepository.editUtilityReading(editing.id, {
        electricPrev: editing.electricPrev,
        electricCurr: editing.electricCurr,
        waterPrev: editing.waterPrev,
        waterCurr: editing.waterCurr,
        pricingModel: editing.pricingModel as PricingModel,
        fixedElectricUnitPrice: editing.fixedElectricUnitPrice,
        fixedWaterUnitPrice: editing.fixedWaterUnitPrice,
        reason: editReason || 'Chủ trọ cập nhật sau khi đối soát',
      });
      setReadings((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditing(null);
      setEditReason('');
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const disputedReadings = readings.filter((r) => r.status === 'DISPUTED');

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{t('title')}</h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('subtitle')}</p>
      </div>

      {/* Disputed Alerts from Tenants */}
      {disputedReadings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Có {disputedReadings.length} bản ghi chỉ số đang chờ bạn đối soát lại theo yêu cầu của khách thuê!</span>
          </div>
          {disputedReadings.map((dr) => (
            <div key={dr.id} className="text-xs text-amber-700 dark:text-amber-300 pl-6 flex items-center justify-between">
              <span>
                Kỳ {formatIsoDate(dr.periodMonth)}: <em>&quot;{dr.editReason || 'Khách thuê báo sai lệch chỉ số'}&quot;</em>
              </span>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Pencil className="w-3 h-3" />}
                onClick={() => setEditing(dr)}
              >
                Chỉnh sửa & Khắc phục
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Recording Form Card */}
      <Card className="p-5 space-y-4">
        <form onSubmit={handleRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <Select
              label={t('contractSelect')}
              value={contractId}
              onChange={(e) => handleContractChange(e.target.value)}
              options={
                contracts.length > 0
                  ? contracts.map((c) => ({ value: c.id, label: `${c.contractCode} (Phòng #${c.roomId})` }))
                  : [{ value: '', label: tc('empty') }]
              }
            />
            <Input
              label={t('periodMonth')}
              type="date"
              required
              value={form.periodMonth}
              onChange={(e) => setForm((p) => ({ ...p, periodMonth: e.target.value }))}
            />
            <Select
              label={t('pricingModel')}
              value={form.pricingModel}
              onChange={(e) => setForm((p) => ({ ...p, pricingModel: e.target.value as PricingModel }))}
              options={[
                { value: 'FIXED', label: 'Cố định theo Hợp đồng (Khuyên dùng)' },
                { value: 'EVN_TIERED', label: 'Bậc thang sinh hoạt EVN' },
                { value: 'PER_PERSON', label: 'Tính theo đầu người' },
              ]}
            />
            <Input
              label={t('occupantCount')}
              type="number"
              min={1}
              value={form.occupantCount}
              onChange={(e) => setForm((p) => ({ ...p, occupantCount: e.target.value }))}
            />
          </div>

          {/* Meter Readings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            {/* Electricity block */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                  Chỉ số ĐIỆN (kWh)
                </span>
                {selectedContract && (
                  <span className="text-[11px] text-stone-400">
                    (Ban đầu: {selectedContract.initialElectricityReading ?? 0} kWh)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={t('electricPrev')}
                  type="number"
                  step="any"
                  required
                  value={form.electricPrev}
                  onChange={(e) => setForm((p) => ({ ...p, electricPrev: e.target.value }))}
                />
                <Input
                  label={t('electricCurr')}
                  type="number"
                  step="any"
                  required
                  value={form.electricCurr}
                  onChange={(e) => setForm((p) => ({ ...p, electricCurr: e.target.value }))}
                />
              </div>
              {form.pricingModel === 'FIXED' && (
                <Input
                  label={t('fixedElecPrice')}
                  type="number"
                  value={form.fixedElectricUnitPrice}
                  onChange={(e) => setForm((p) => ({ ...p, fixedElectricUnitPrice: e.target.value }))}
                  helperText="Đơn giá điện áp dụng cho kỳ này (VNĐ/kWh)"
                />
              )}
              <Input
                label={t('electricPhoto')}
                type="url"
                value={form.electricImageUrl}
                onChange={(e) => setForm((p) => ({ ...p, electricImageUrl: e.target.value }))}
                placeholder="https://drive.google.com/... hoặc ảnh chụp công tơ"
                helperText="URL ảnh chụp mặt công tơ điện để khách đối chiếu"
              />
            </div>

            {/* Water block */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                  Chỉ số NƯỚC (m³)
                </span>
                {selectedContract && (
                  <span className="text-[11px] text-stone-400">
                    (Ban đầu: {selectedContract.initialWaterReading ?? 0} m³)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={t('waterPrev')}
                  type="number"
                  step="any"
                  required
                  value={form.waterPrev}
                  onChange={(e) => setForm((p) => ({ ...p, waterPrev: e.target.value }))}
                />
                <Input
                  label={t('waterCurr')}
                  type="number"
                  step="any"
                  required
                  value={form.waterCurr}
                  onChange={(e) => setForm((p) => ({ ...p, waterCurr: e.target.value }))}
                />
              </div>
              {form.pricingModel === 'FIXED' && (
                <Input
                  label={t('fixedWaterPrice')}
                  type="number"
                  value={form.fixedWaterUnitPrice}
                  onChange={(e) => setForm((p) => ({ ...p, fixedWaterUnitPrice: e.target.value }))}
                  helperText="Đơn giá nước áp dụng cho kỳ này (VNĐ/m³)"
                />
              )}
              <Input
                label={t('waterPhoto')}
                type="url"
                value={form.waterImageUrl}
                onChange={(e) => setForm((p) => ({ ...p, waterImageUrl: e.target.value }))}
                placeholder="https://drive.google.com/... hoặc ảnh chụp đồng hồ"
                helperText="URL ảnh chụp mặt đồng hồ nước để khách đối chiếu"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={busy}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              {t('recordBtn')}
            </Button>
          </div>
        </form>
      </Card>

      {/* History & Readings Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('periodMonth')}</TableHead>
              <TableHead>Điện (kWh)</TableHead>
              <TableHead>Nước (m³)</TableHead>
              <TableHead>{tl('amountCol')}</TableHead>
              <TableHead>{t('proofPhotos')}</TableHead>
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead className="text-right">{tc('actionCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-xs py-8 text-stone-500">
                  {t('empty')}
                </TableCell>
              </TableRow>
            ) : (
              readings.map((r) => {
                const total = r.electricityCost + r.waterCost;
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

                    <TableCell className="text-xs">
                      <div>
                        <strong>{r.electricConsumption} kWh</strong>{' '}
                        <span className="text-[11px] text-stone-400">
                          ({r.electricPrev} → {r.electricCurr})
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500">{formatVnd(r.electricityCost)}</span>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div>
                        <strong>{r.waterConsumption} m³</strong>{' '}
                        <span className="text-[11px] text-stone-400">
                          ({r.waterPrev} → {r.waterCurr})
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500">{formatVnd(r.waterCost)}</span>
                    </TableCell>

                    <TableCell className="font-bold text-teal-700 dark:text-teal-400 text-xs">
                      {formatVnd(total)}
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
                              className="p-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 text-xs inline-flex items-center gap-0.5"
                              title="Xem ảnh công tơ"
                            >
                              <Camera className="w-3.5 h-3.5 text-teal-600" />
                              <span className="text-[10px]">#{idx + 1}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">Chưa có ảnh</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {r.status === 'DISPUTED' ? (
                        <div>
                          <Badge variant="warning" size="sm">
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
                          Hợp lệ
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          {r.status}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<History className="w-3.5 h-3.5" />}
                          onClick={async () => {
                            const list = await container.billing.billingRepository.getReadingAudits(r.id);
                            setAudits(list);
                          }}
                        >
                          {t('auditBtn')}
                        </Button>
                        {r.status !== 'CANCELLED' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Pencil className="w-3.5 h-3.5" />}
                              onClick={() => setEditing(r)}
                            >
                              {t('editBtn')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<XCircle className="w-3.5 h-3.5" />}
                              onClick={async () => {
                                const updated = await container.billing.billingRepository.cancelUtilityReading(
                                  r.id,
                                  'Cancelled by landlord'
                                );
                                setReadings((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
                              }}
                            >
                              {t('cancelBtn')}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Reading Modal */}
      <Dialog isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={t('editBtn')} size="sm">
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
            <Input
              label={t('electricCurr')}
              type="number"
              step="any"
              value={String(editing.electricCurr)}
              onChange={(e) => setEditing({ ...editing, electricCurr: Number(e.target.value) })}
            />
            <Input
              label={t('waterCurr')}
              type="number"
              step="any"
              value={String(editing.waterCurr)}
              onChange={(e) => setEditing({ ...editing, waterCurr: Number(e.target.value) })}
            />
            <Input
              label={t('editReason')}
              required
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Giải trình lý do điều chỉnh chỉ số..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setEditing(null)}>
                {tc('cancel')}
              </Button>
              <Button variant="primary" type="submit" isLoading={busy}>
                {tc('save')}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Audit History Modal */}
      <Dialog isOpen={Boolean(audits)} onClose={() => setAudits(null)} title={t('auditBtn')} size="md">
        <div className="space-y-3 pt-2 text-xs">
          {audits && audits.length === 0 ? (
            <p className="text-stone-500 italic">{tc('empty')}</p>
          ) : (
            audits?.map((a) => (
              <div key={a.id} className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Hành động: {a.action} (v{a.revision})</span>
                  <span className="text-[11px] text-stone-400">{formatIsoDateTime(a.createdAt)}</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400">Người thực hiện: {a.actorId}</p>
                {a.reason && <p className="italic text-stone-500">Lý do: {a.reason}</p>}
              </div>
            ))
          )}
        </div>
      </Dialog>

      {/* Photo Preview Modal */}
      <Dialog isOpen={Boolean(previewPhoto)} onClose={() => setPreviewPhoto(null)} title={t('viewPhoto')} size="md">
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
