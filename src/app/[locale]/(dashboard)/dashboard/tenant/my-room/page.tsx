'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { Invoice, UtilityReading } from '@/domain/entities/Billing';
import { RoomDetailDto } from '@/application/dto/listing.dto';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import {
  Home,
  FileText,
  Zap,
  Droplets,
  Receipt,
  Phone,
  ShieldCheck,
  Maximize2,
  Users,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Wrench,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function TenantMyRoomPage() {
  const tAuto = useTranslations('autoI18n');
  const tc = useTranslations('sprint3.common');

  const [isLoading, setIsLoading] = useState(true);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [room, setRoom] = useState<RoomDetailDto | null>(null);
  const [latestReading, setLatestReading] = useState<UtilityReading | null>(null);
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Load tenant contracts
      const contracts: Contract[] = await container.contract.contractRepository.getTenantContracts();
      // Prioritize ACTIVE contract, then PENDING_SIGNATURES/PENDING_TENANT, or the most recent
      const contract =
        contracts.find((c: Contract) => c.status === 'ACTIVE') ||
        contracts.find((c: Contract) => c.status.startsWith('PENDING')) ||
        contracts[0] ||
        null;

      setActiveContract(contract);

      if (contract) {
        // 2. Load room details
        try {
          const roomData = await container.listing.listingRepository.getRoomDetail(contract.roomId);
          setRoom(roomData);
        } catch {
          // If detailed lookup fails, fallback silently
        }

        // 3. Load readings for this contract
        try {
          const readings = await container.billing.billingRepository.getContractReadings(contract.id);
          if (readings.length > 0) {
            setLatestReading(readings[0]);
          }
        } catch {
          // Ignore
        }

        // 4. Load invoices to count unpaid
        try {
          const invoices: Invoice[] = await container.billing.billingRepository.getTenantInvoices();
          const unpaid = invoices.filter(
            (inv) => inv.contractId === contract.id && inv.status !== 'PAID' && inv.status !== 'CANCELLED'
          );
          setUnpaidInvoicesCount(unpaid.length);
        } catch {
          // Ignore
        }
      }
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!activeContract) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0355')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">{tAuto('k0356')}</p>
        </div>

        <Card className="p-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400">
            <Home className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Bạn chưa có hợp đồng thuê phòng nào đang hoạt động
            </h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Khi bạn thuê phòng và chủ trọ tạo hợp đồng thành công, mọi thông tin chi tiết về phòng trọ,
              chỉ số điện nước bàn giao ban đầu và hóa đơn sẽ hiển thị tại đây.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/rooms">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Tìm phòng trọ ngay
              </Button>
            </Link>
            <Link href="/dashboard/tenant/rental-requests">
              <Button variant="outline" size="sm">
                Xem yêu cầu thuê đã gửi
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const initialElec = activeContract.initialElectricityReading ?? room?.initialElectricityReading ?? 0;
  const initialWater = activeContract.initialWaterReading ?? room?.initialWaterReading ?? 0;
  const elecRate = activeContract.electricityRate || room?.electricityCost || 3500;
  const waterRate = activeContract.waterRate || room?.waterCost || 25000;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {room?.title || `Phòng thuê #${activeContract.roomId}`}
            </h1>
            <Badge
              variant={
                activeContract.status === 'ACTIVE'
                  ? 'success'
                  : activeContract.status.startsWith('PENDING')
                  ? 'warning'
                  : 'neutral'
              }
              size="sm"
            >
              {activeContract.status === 'ACTIVE' ? 'Đang thuê' : activeContract.status}
            </Badge>
          </div>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{room?.address || `Mã phòng: ${activeContract.roomId}`}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/tenant/contracts/${activeContract.id}`}>
            <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
              Xem Hợp Đồng
            </Button>
          </Link>
          <Link href="/dashboard/tenant/utilities">
            <Button variant="secondary" size="sm" leftIcon={<Zap className="w-3.5 h-3.5" />}>
              Điện Nước
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Specs & Details */}
          {room && (
            <Card className="p-5 space-y-4">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Home className="w-4 h-4 text-teal-700" />
                Thông số phòng trọ
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" /> Diện tích
                  </span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">{room.area} m²</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Tầng
                  </span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {room.floor ? `Tầng ${room.floor}` : 'Tầng 1'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Ở tối đa
                  </span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {room.maxOccupants} người
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Nội thất
                  </span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 mt-0.5 truncate">
                    {room.furnishing === 'FULL'
                      ? 'Đầy đủ'
                      : room.furnishing === 'PARTIAL'
                      ? 'Cơ bản'
                      : 'Trống'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Initial Handover Meter Readings & Transparent Utility Tariffs */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-700" />
                Chỉ số bàn giao ban đầu & Biểu giá minh bạch
              </h2>
              <Link href="/dashboard/tenant/utilities" className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1">
                Lịch sử ghi số <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-xs text-stone-500">
              Chỉ số ghi nhận tại thời điểm bàn giao phòng được ghi thẳng vào Hợp đồng. Số tiền điện nước
              hàng tháng = (Số công tơ mới - Số cũ) x Đơn giá đã thỏa thuận.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Electricity Box */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" /> Điện sinh hoạt
                  </span>
                  <span className="font-mono text-sm">{formatVnd(elecRate)} / kWh</span>
                </div>
                <div className="pt-1 border-t border-amber-200/60 flex items-center justify-between text-stone-600 dark:text-stone-300">
                  <span>Số bàn giao lúc nhận phòng:</span>
                  <strong className="font-mono text-amber-800 dark:text-amber-300 font-bold">
                    {initialElec} kWh
                  </strong>
                </div>
                {latestReading && (
                  <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                    <span>Số chốt kỳ gần nhất:</span>
                    <strong className="font-mono text-stone-900 dark:text-stone-100 font-bold">
                      {latestReading.electricCurr} kWh
                    </strong>
                  </div>
                )}
              </div>

              {/* Water Box */}
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 dark:bg-sky-950/20 space-y-2">
                <div className="flex items-center justify-between text-sky-900 dark:text-sky-200 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-600" /> Nước sinh hoạt
                  </span>
                  <span className="font-mono text-sm">{formatVnd(waterRate)} / m³</span>
                </div>
                <div className="pt-1 border-t border-sky-200/60 flex items-center justify-between text-stone-600 dark:text-stone-300">
                  <span>Số bàn giao lúc nhận phòng:</span>
                  <strong className="font-mono text-sky-800 dark:text-sky-300 font-bold">
                    {initialWater} m³
                  </strong>
                </div>
                {latestReading && (
                  <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                    <span>Số chốt kỳ gần nhất:</span>
                    <strong className="font-mono text-stone-900 dark:text-stone-100 font-bold">
                      {latestReading.waterCurr} m³
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Contract Terms Summary */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                Thông tin Hợp đồng ({activeContract.contractCode})
              </h2>
              <Link href={`/dashboard/tenant/contracts/${activeContract.id}`}>
                <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  {tc('viewDetail')}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-stone-500">Giá thuê tháng:</span>
                <p className="font-bold text-teal-700 text-sm">{formatVnd(activeContract.monthlyRent)}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-stone-500">Tiền đặt cọc:</span>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {formatVnd(activeContract.depositAmount)}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-stone-500">Ngày bắt đầu:</span>
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  {formatIsoDate(activeContract.startDate)}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-stone-500">Ngày kết thúc:</span>
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  {formatIsoDate(activeContract.endDate)}
                </p>
              </div>
            </div>

            {activeContract.physicalContractScanUrl && (
              <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Bản scan hợp đồng ký tay 2 bên đã được lưu trữ bảo mật.</span>
                </div>
                <a
                  href={activeContract.physicalContractScanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-teal-700 underline flex items-center gap-1"
                >
                  Xem bản scan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Pending Invoices Alert if any */}
          {unpaidInvoicesCount > 0 ? (
            <Card className="p-5 border-amber-300 bg-amber-50/80 dark:bg-amber-950/40 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Bạn có {unpaidInvoicesCount} hóa đơn chưa đóng
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Vui lòng thanh toán đúng hạn qua VietQR để đảm bảo không bị gián đoạn dịch vụ tiện ích.
              </p>
              <Link href="/dashboard/tenant/invoices">
                <Button variant="primary" size="sm" className="w-full" rightIcon={<Receipt className="w-3.5 h-3.5" />}>
                  Xem & Thanh Toán Hóa Đơn
                </Button>
              </Link>
            </Card>
          ) : (
            <Card className="p-5 border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Đã hoàn thành các khoản phí
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Hiện tại bạn không còn hóa đơn nào quá hạn hoặc đang chờ thanh toán.
              </p>
            </Card>
          )}

          {/* Quick Hub Links */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Phím tắt tiện ích
            </h3>

            <div className="space-y-2">
              <Link
                href="/dashboard/tenant/utilities"
                className="flex items-center justify-between p-3 rounded-xl border border-stone-200/60 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      Đối soát điện nước
                    </span>
                    <span className="text-[11px] text-stone-500">Xem ảnh công tơ & gửi khiếu nại</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                href="/dashboard/tenant/invoices"
                className="flex items-center justify-between p-3 rounded-xl border border-stone-200/60 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      Hóa đơn tiền nhà
                    </span>
                    <span className="text-[11px] text-stone-500">Quét VietQR động & tải PDF</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                href={`/dashboard/tenant/contracts/${activeContract.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-stone-200/60 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      Hợp đồng pháp lý
                    </span>
                    <span className="text-[11px] text-stone-500">In A4, xem điều khoản 8 điều</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                href="/dashboard/tenant/maintenance"
                className="flex items-center justify-between p-3 rounded-xl border border-stone-200/60 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      Báo hỏng & Sửa chữa
                    </span>
                    <span className="text-[11px] text-stone-500">Gửi sự cố thiết bị cho chủ nhà</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </Card>

          {/* Landlord Contact Info */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Thông tin Chủ trọ
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {room?.landlord?.name || 'Chủ trọ đã xác thực eKYC'}
                </span>
              </div>
              {room?.landlord?.phone && (
                <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <a href={`tel:${room.landlord.phone}`} className="hover:underline">
                    {room.landlord.phone}
                  </a>
                </div>
              )}
              <div className="pt-2">
                <Link href="/dashboard/tenant/messages">
                  <Button variant="outline" size="sm" className="w-full">
                    Gửi tin nhắn cho chủ trọ
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
