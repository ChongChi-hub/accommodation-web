'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, Zap, Droplets, Users, CheckCircle2, Info } from 'lucide-react';
import { RoomFeeDto } from '@/application/dto/listing.dto';
import { calculateMonthlyCost } from '@/domain/services/cost-estimator.service';

interface RoomFeeEstimatorProps {
  rentPrice: number;
  fees: RoomFeeDto[];
}

export function RoomFeeEstimator({ rentPrice, fees }: RoomFeeEstimatorProps) {
  const [electricityKwh, setElectricityKwh] = useState<number>(100);
  const [waterM3, setWaterM3] = useState<number>(4);
  const [occupants, setOccupants] = useState<number>(1);

  const estimate = useMemo(() => {
    return calculateMonthlyCost(rentPrice, fees, {
      electricityKwh,
      waterM3,
      occupants,
    });
  }, [rentPrice, fees, electricityKwh, waterM3, occupants]);

  const formatVnd = (amount: number) => new Intl.NumberFormat('vi-VN').format(Math.round(amount));

  const getBillingModeLabel = (mode: string) => {
    switch (mode?.toUpperCase()) {
      case 'METERED':
        return 'Theo công tơ thực tế';
      case 'PER_PERSON':
        return 'Theo số người ở';
      case 'FIXED':
        return 'Cố định hàng tháng';
      case 'INCLUDED':
        return 'Đã gồm trong tiền phòng';
      default:
        return 'Dịch vụ phát sinh';
    }
  };

  return (
    <div id="pricing" className="space-y-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-5">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          Biểu phí dịch vụ & Ước tính chi phí mỗi tháng
        </h2>
        <p className="text-xs text-stone-500">
          Minh bạch từng đơn giá, không có chi phí ẩn. Sử dụng công cụ bên dưới để dự toán ngân sách.
        </p>
      </div>

      {/* Fees Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 font-semibold">
              <th className="py-2.5 px-3">Hạng mục dịch vụ</th>
              <th className="py-2.5 px-3">Hình thức tính</th>
              <th className="py-2.5 px-3 text-right">Đơn giá niêm yết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {fees.map((fee, idx) => (
              <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                <td className="py-2.5 px-3 font-medium text-stone-900 dark:text-stone-200">
                  {fee.label}
                </td>
                <td className="py-2.5 px-3 text-stone-500">
                  <span className="inline-flex items-center gap-1">
                    {fee.billingMode === 'INCLUDED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {getBillingModeLabel(fee.billingMode)}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-stone-900 dark:text-stone-100">
                  {fee.billingMode === 'INCLUDED' ? (
                    <span className="text-emerald-600 dark:text-emerald-400">0 đ (Miễn phí)</span>
                  ) : (
                    <span>
                      {formatVnd(fee.price)} đ / {fee.unit}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Estimator Controls */}
      <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 space-y-4 border border-stone-200/60 dark:border-stone-800">
        <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
          Công cụ ước tính theo thói quen sử dụng
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-stone-600 dark:text-stone-400 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Điện (kWh/tháng)
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{electricityKwh}</span>
            </label>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={electricityKwh}
              onChange={(e) => setElectricityKwh(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-600 dark:text-stone-400 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" /> Nước (m³/tháng)
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{waterM3}</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={waterM3}
              onChange={(e) => setWaterM3(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-600 dark:text-stone-400 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal-600" /> Số người ở
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{occupants}</span>
            </label>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={occupants}
              onChange={(e) => setOccupants(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Calculation Result */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs text-stone-500 space-y-0.5">
            <span>Tiền phòng: {formatVnd(estimate.rentPrice)} đ</span>
            <span className="mx-2">•</span>
            <span>Tổng dịch vụ: ~{formatVnd(estimate.utilityTotal)} đ</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-500 block">Dự toán tổng chi phí / tháng:</span>
            <span className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
              ~{formatVnd(estimate.grandTotal)} đ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

