'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Select } from '@/presentation/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { UtilityReading } from '@/domain/entities/Billing';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Gauge,
  HelpCircle,
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
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
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
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-start gap-3">
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
              <TableHead>{tc('statusCol')}</TableHead>
              <TableHead className="text-right">Đối chiếu & Báo cáo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs py-8 text-stone-500">
                  {t('noReadings')}
                </TableCell>
              </TableRow>
            ) : (
              readings.map((r) => {
                const elecRate = selectedContract?.electricityRate ?? 3500;
                const waterRate = selectedContract?.waterRate ?? 25000;
                const totalAmount = r.electricityCost + r.waterCost;

                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs font-semibold">
                      {formatIsoDate(r.periodMonth)}
                      <span className="block text-[10px] text-stone-400 font-normal">v{r.revision}</span>
                    </TableCell>

                    {/* Electricity Breakdown */}
                    <TableCell className="text-xs">
                      <div>
                        <span className="font-medium text-stone-900 dark:text-stone-100">
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
                        <span className="font-medium text-stone-900 dark:text-stone-100">
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

                    {/* Status / Surge Warning */}
                    <TableCell>
                      {r.hasSurgeAnomaly ? (
                        <Badge variant="warning" size="sm">
                          {t('surgeBadge')}
                        </Badge>
                      ) : r.status === 'ACTIVE' ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                          Chuẩn xác
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          {r.status}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Report Fraud Action */}
                    <TableCell className="text-right">
                      <Link
                        href={`/support/new?category=BILLING&subject=${encodeURIComponent(
                          `Thắc mắc chỉ số điện nước kỳ ${formatIsoDate(r.periodMonth)} - HĐ ${
                            selectedContract?.contractCode || ''
                          }`
                        )}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        >
                          {t('reportFraud')}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
