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
import { History, Pencil, Save, XCircle } from 'lucide-react';

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

  const [form, setForm] = useState({
    periodMonth: '',
    pricingModel: 'EVN_TIERED' as PricingModel,
    electricPrev: '0',
    electricCurr: '0',
    waterPrev: '0',
    waterCurr: '0',
    fixedElectricUnitPrice: '3800',
    fixedWaterUnitPrice: '28000',
    occupantCount: '1',
  });

  useEffect(() => {
    container.contract.contractRepository.getLandlordContracts().then((list) => {
      setContracts(list);
      if (list.length > 0) {
        setContractId(list[0].id);
        setRoomId(list[0].roomId);
      }
    }).catch(() => undefined);
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
    if (contractId) loadReadings(contractId);
  }, [contractId, loadReadings]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !roomId) return;
    setBusy(true);
    try {
      const created = await container.billing.billingRepository.recordUtilityReading({
        contractId,
        roomId,
        periodMonth: form.periodMonth,
        pricingModel: form.pricingModel,
        electricPrev: Number(form.electricPrev),
        electricCurr: Number(form.electricCurr),
        waterPrev: Number(form.waterPrev),
        waterCurr: Number(form.waterCurr),
        fixedElectricUnitPrice: form.pricingModel === 'FIXED' ? Number(form.fixedElectricUnitPrice) : undefined,
        fixedWaterUnitPrice: form.pricingModel === 'FIXED' ? Number(form.fixedWaterUnitPrice) : undefined,
        occupantCount: Number(form.occupantCount),
      });
      setReadings((prev) => [created, ...prev]);
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
        reason: editReason,
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

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{t('title')}</h1>
        <p className="text-xs text-stone-500 mt-0.5">{t('subtitle')}</p>
      </div>

      <Card className="p-5 space-y-4">
        <form onSubmit={handleRecord} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <Select
            label={t('contractSelect')}
            value={contractId}
            onChange={(e) => {
              const cid = e.target.value;
              setContractId(cid);
              const found = contracts.find((c) => c.id === cid);
              if (found) setRoomId(found.roomId);
            }}
            options={contracts.length > 0 ? contracts.map((c) => ({ value: c.id, label: `${c.contractCode} (#${c.roomId})` })) : [{ value: '', label: tc('empty') }]}
          />
          <Input label={t('periodMonth')} type="date" required value={form.periodMonth} onChange={(e) => setForm((p) => ({ ...p, periodMonth: e.target.value }))} />
          <Select
            label={t('pricingModel')}
            value={form.pricingModel}
            onChange={(e) => setForm((p) => ({ ...p, pricingModel: e.target.value as PricingModel }))}
            options={[{ value: 'EVN_TIERED', label: 'EVN_TIERED' }, { value: 'FIXED', label: 'FIXED' }, { value: 'PER_PERSON', label: 'PER_PERSON' }]}
          />
          <Input label={t('occupantCount')} type="number" min={1} value={form.occupantCount} onChange={(e) => setForm((p) => ({ ...p, occupantCount: e.target.value }))} />
          <Input label={t('electricPrev')} type="number" required value={form.electricPrev} onChange={(e) => setForm((p) => ({ ...p, electricPrev: e.target.value }))} />
          <Input label={t('electricCurr')} type="number" required value={form.electricCurr} onChange={(e) => setForm((p) => ({ ...p, electricCurr: e.target.value }))} />
          <Input label={t('waterPrev')} type="number" required value={form.waterPrev} onChange={(e) => setForm((p) => ({ ...p, waterPrev: e.target.value }))} />
          <Input label={t('waterCurr')} type="number" required value={form.waterCurr} onChange={(e) => setForm((p) => ({ ...p, waterCurr: e.target.value }))} />
          {form.pricingModel === 'FIXED' && (
            <>
              <Input label={t('fixedElecPrice')} type="number" value={form.fixedElectricUnitPrice} onChange={(e) => setForm((p) => ({ ...p, fixedElectricUnitPrice: e.target.value }))} />
              <Input label={t('fixedWaterPrice')} type="number" value={form.fixedWaterUnitPrice} onChange={(e) => setForm((p) => ({ ...p, fixedWaterUnitPrice: e.target.value }))} />
            </>
          )}
          <div className="sm:col-span-4 flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={busy} leftIcon={<Save className="w-3.5 h-3.5" />}>
              {t('recordBtn')}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('periodMonth')}</TableHead>
              <TableHead>{tl('usageCol')}</TableHead>
              <TableHead>{t('pricingModel')}</TableHead>
              <TableHead>{tl('amountCol')}</TableHead>
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead className="text-right">{tc('actionCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs py-6 text-stone-500">{t('empty')}</TableCell></TableRow>
            ) : (
              readings.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-medium">{`${formatIsoDate(r.periodMonth)} (v${r.revision})`}</TableCell>
                  <TableCell className="text-xs">{`${r.electricConsumption} kWh / ${r.waterConsumption} m3`}</TableCell>
                  <TableCell className="text-xs">{r.pricingModel}</TableCell>
                  <TableCell className="font-bold text-teal-700">{formatVnd(r.electricityCost + r.waterCost)}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'ACTIVE' ? (r.hasSurgeAnomaly ? 'warning' : 'success') : 'neutral'} size="sm">
                      {r.hasSurgeAnomaly ? t('surgeBadge') : r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<History className="w-3.5 h-3.5" />} onClick={async () => {
                        const list = await container.billing.billingRepository.getReadingAudits(r.id);
                        setAudits(list);
                      }}>{t('auditBtn')}</Button>
                      {r.status === 'ACTIVE' && (
                        <>
                          <Button variant="ghost" size="sm" leftIcon={<Pencil className="w-3.5 h-3.5" />} onClick={() => setEditing(r)}>{t('editBtn')}</Button>
                          <Button variant="ghost" size="sm" leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={async () => {
                            const updated = await container.billing.billingRepository.cancelUtilityReading(r.id, 'Cancelled by landlord');
                            setReadings((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
                          }}>{t('cancelBtn')}</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={t('editBtn')} size="sm">
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
            <Input label={t('electricCurr')} type="number" value={String(editing.electricCurr)} onChange={(e) => setEditing({ ...editing, electricCurr: Number(e.target.value) })} />
            <Input label={t('waterCurr')} type="number" value={String(editing.waterCurr)} onChange={(e) => setEditing({ ...editing, waterCurr: Number(e.target.value) })} />
            <Input label={t('editReason')} required value={editReason} onChange={(e) => setEditReason(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(null)}>{tc('cancel')}</Button>
              <Button type="submit" variant="primary" size="sm" isLoading={busy}>{tc('save')}</Button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog isOpen={Boolean(audits)} onClose={() => setAudits(null)} title={t('auditBtn')} size="md">
        <div className="space-y-2 text-xs pt-2">
          {audits?.map((a) => (
            <div key={a.id} className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900">
              <p className="font-bold">{`v${a.revision} • ${a.action}`}</p>
              <p className="text-stone-500">{`${a.reason} • ${formatIsoDateTime(a.createdAt)}`}</p>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
