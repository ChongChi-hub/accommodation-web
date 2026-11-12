'use client';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { FileUpload } from '@/presentation/components/ui/FileUpload';
import { toast } from '@/presentation/stores/toast.store';
import { Gauge, Zap, Droplets, Save } from 'lucide-react';

export default function LandlordUtilitiesPage() {
  const tAuto = useTranslations('autoI18n');
  const [readings, setReadings] = useState([
    {
      roomId: 1,
      roomName: 'Phòng 302 (Dịch Vọng Hậu)',
      tenantName: 'Nguyễn Văn Thuê',
      oldElec: 1240,
      newElec: 1315,
      elecPrice: 3800,
      oldWater: 52,
      newWater: 55,
      waterPrice: 30000,
    },
    {
      roomId: 3,
      roomName: 'Phòng 501 (Láng Hạ)',
      tenantName: 'Lê Thị Mai',
      oldElec: 2100,
      newElec: 2180,
      elecPrice: 4000,
      oldWater: 80,
      newWater: 84,
      waterPrice: 25000,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = (idx: number, field: string, val: number) => {
    setReadings((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Đã lưu chỉ số điện nước tháng 11/2026! Hệ thống đã tính tự động vào hóa đơn.');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0245')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0246')}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          isLoading={isSaving}
          leftIcon={<Save className="w-3.5 h-3.5" />}
          onClick={handleSave}
        >
          {tAuto('k0247')}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tAuto('k0248')}</TableHead>
              <TableHead>{tAuto('k0249')}</TableHead>
              <TableHead>{tAuto('k0250')}</TableHead>
              <TableHead>{tAuto('k0251')}</TableHead>
              <TableHead>{tAuto('k0252')}</TableHead>
              <TableHead className="text-right">{tAuto('k0253')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.map((r, idx) => {
              const elecUsed = Math.max(0, r.newElec - r.oldElec);
              const waterUsed = Math.max(0, r.newWater - r.oldWater);
              const totalCost = elecUsed * r.elecPrice + waterUsed * r.waterPrice;

              return (
                <TableRow key={r.roomId}>
                  <TableCell>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{r.roomName}</p>
                    <p className="text-[11px] text-stone-500">{r.tenantName}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-stone-400">{r.oldElec} &rarr;</span>
                      <input
                        type="number"
                        value={r.newElec}
                        onChange={(e) => handleUpdate(idx, 'newElec', Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 font-mono"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-amber-600">
                    {elecUsed}{' '}{tAuto('k0254')}{new Intl.NumberFormat('vi-VN').format(elecUsed * r.elecPrice)}{' '}{tAuto('k0255')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-stone-400">{r.oldWater} &rarr;</span>
                      <input
                        type="number"
                        value={r.newWater}
                        onChange={(e) => handleUpdate(idx, 'newWater', Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 font-mono"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-cyan-600">
                    {waterUsed}{' '}{tAuto('k0256')}{new Intl.NumberFormat('vi-VN').format(waterUsed * r.waterPrice)}{' '}{tAuto('k0255')}
                  </TableCell>
                  <TableCell className="text-right font-bold text-teal-800 dark:text-teal-400">
                    {new Intl.NumberFormat('vi-VN').format(totalCost)}{' '}{tAuto('k0257')}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

