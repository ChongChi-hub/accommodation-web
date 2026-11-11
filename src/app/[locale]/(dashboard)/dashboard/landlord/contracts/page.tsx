'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Contract } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import { Eye, PlusCircle } from 'lucide-react';

export default function LandlordContractsPage() {
  const t = useTranslations('sprint3.contract');
  const tc = useTranslations('sprint3.common');
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    requestId: searchParams.get('requestId') || '',
    roomId: searchParams.get('roomId') || '',
    tenantId: searchParams.get('tenantId') || '',
    startDate: '',
    endDate: '',
    monthlyRent: '4500000',
    depositAmount: '4500000',
    terms: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await container.contract.contractRepository.getLandlordContracts();
      setContracts(list);
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadData();
    if (searchParams.get('roomId') && searchParams.get('tenantId')) {
      setIsCreateOpen(true);
    }
  }, [loadData, searchParams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await container.contract.contractRepository.createContract({
        roomId: form.roomId.trim(),
        tenantId: form.tenantId.trim(),
        landlordId: user?.id || 'landlord-self',
        requestId: form.requestId.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        monthlyRent: Number(form.monthlyRent),
        depositAmount: Number(form.depositAmount),
        terms: form.terms.trim() || undefined,
      });
      setContracts((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t('landlordTitle')} ({contracts.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">{t('landlordSubtitle')}</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />} onClick={() => setIsCreateOpen(true)}>
          {t('createNew')}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>{t('roomIdLabel')}</TableHead>
              <TableHead>{t('tenantIdLabel')}</TableHead>
              <TableHead>{t('monthlyRent')}</TableHead>
              <TableHead>{t('startDate')}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">{tc('viewDetail')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-xs py-6">{tc('loading')}</TableCell></TableRow>
            ) : contracts.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-xs py-6 text-stone-500">{t('empty')}</TableCell></TableRow>
            ) : (
              contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs font-semibold">{c.contractCode}</TableCell>
                  <TableCell className="text-xs">#{c.roomId}</TableCell>
                  <TableCell className="font-mono text-xs">{c.tenantId}</TableCell>
                  <TableCell className="font-semibold text-teal-700">{formatVnd(c.monthlyRent)}</TableCell>
                  <TableCell className="text-xs text-stone-500">{formatIsoDate(c.startDate)} - {formatIsoDate(c.endDate)}</TableCell>
                  <TableCell><Badge variant={c.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">{c.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/landlord/contracts/${c.id}`}>
                      <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>{tc('viewDetail')}</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('createNew')} size="md">
        <form onSubmit={handleCreate} className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label={t('roomIdLabel')} required value={form.roomId} onChange={(e) => setForm((p) => ({ ...p, roomId: e.target.value }))} />
            <Input label={t('tenantIdLabel')} required value={form.tenantId} onChange={(e) => setForm((p) => ({ ...p, tenantId: e.target.value }))} />
            <Input label={t('startDate')} type="date" required value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
            <Input label={t('endDate')} type="date" required value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
            <Input label={t('monthlyRent')} type="number" min={0} required value={form.monthlyRent} onChange={(e) => setForm((p) => ({ ...p, monthlyRent: e.target.value }))} />
            <Input label={t('depositAmount')} type="number" min={0} required value={form.depositAmount} onChange={(e) => setForm((p) => ({ ...p, depositAmount: e.target.value }))} />
          </div>
          <Input label={t('requestIdLabel')} value={form.requestId} onChange={(e) => setForm((p) => ({ ...p, requestId: e.target.value }))} />
          <Input label={t('termsLabel')} value={form.terms} onChange={(e) => setForm((p) => ({ ...p, terms: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>{tc('cancel')}</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={busy}>{t('createNew')}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
