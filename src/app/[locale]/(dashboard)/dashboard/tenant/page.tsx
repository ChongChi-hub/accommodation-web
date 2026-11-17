'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { Invoice } from '@/domain/entities/Billing';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { formatIsoDate, formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import {
  Search,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function TenantOverviewPage() {
  const tAuto = useTranslations('autoI18n');
  const { user } = useAuthStore();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appointments, setAppointments] = useState<ViewingAppointmentItem[]>([]);
  const [kycStatus, setKycStatus] = useState<{ isVerified?: boolean; status?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [contractsRes, invoicesRes, apptRes, kycRes] = await Promise.allSettled([
        container.contract.contractRepository.getTenantContracts(),
        container.billing.billingRepository.getTenantInvoices(),
        container.appointment.appointmentRepository.getTenantAppointments(0, 10),
        container.kyc.landlordKycUseCases.getKycStatus(),
      ]);

      if (contractsRes.status === 'fulfilled') {
        setContracts(contractsRes.value || []);
      }
      if (invoicesRes.status === 'fulfilled') {
        setInvoices(invoicesRes.value || []);
      }
      if (apptRes.status === 'fulfilled') {
        setAppointments(apptRes.value?.data || []);
      }
      if (kycRes.status === 'fulfilled') {
        setKycStatus(kycRes.value as { isVerified?: boolean; status?: string });
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived state
  const activeContract = contracts.find((c) => c.status === 'ACTIVE' || c.status === 'SIGNED') || contracts[0];
  const pendingInvoice = invoices.find((i) => i.status === 'PENDING' || i.status === 'OVERDUE');
  const upcomingAppointments = appointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED');
  const nextAppointment = upcomingAppointments[0];

  const isKycVerified = !!kycStatus?.isVerified;
  const isKycPending = kycStatus?.status === 'PENDING' || kycStatus?.status === 'IN_REVIEW';
  const hasSignedOtp = contracts.some((c) => !!c.tenantSignedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0357')}{' '}{user?.fullName || 'Bạn'}!
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0358')}
          </p>
        </div>
        <Link href="/rooms">
          <Button variant="primary" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
            {tAuto('k0359')}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Hợp đồng hiện tại */}
          <Card className="p-4 space-y-2 border-teal-700/20 bg-teal-50/40 dark:bg-teal-950/20 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Hợp đồng hiện tại</span>
                {activeContract ? (
                  <Badge variant={activeContract.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                    {activeContract.status === 'ACTIVE' ? 'Đang thuê' : activeContract.status}
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Chưa có</Badge>
                )}
              </div>
              {activeContract ? (
                <>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100 font-mono">
                    {activeContract.contractCode}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                    Phòng trọ #{activeContract.roomId}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Chưa có phòng thuê
                  </p>
                  <p className="text-xs text-stone-500">
                    Bạn chưa có hợp đồng thuê nào đang hiệu lực
                  </p>
                </>
              )}
            </div>
            <div className="pt-2">
              {activeContract ? (
                <Link
                  href={`/dashboard/tenant/contracts/${activeContract.id}`}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  Xem chi tiết hợp đồng <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <Link
                  href="/rooms"
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  Tìm phòng ngay <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </Card>

          {/* Card 2: Hóa đơn cần thanh toán */}
          <Card className="p-4 space-y-2 border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Hóa đơn cần thanh toán</span>
                {pendingInvoice ? (
                  <Badge variant={pendingInvoice.status === 'OVERDUE' ? 'danger' : 'warning'} size="sm">
                    {pendingInvoice.status === 'OVERDUE' ? 'Quá hạn' : 'Chờ thanh toán'}
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">Đã thanh toán hết</Badge>
                )}
              </div>
              {pendingInvoice ? (
                <>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {formatVnd(pendingInvoice.totalAmount)}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                    {pendingInvoice.invoiceCode} • Hạn: {pendingInvoice.dueDate ? formatIsoDate(pendingInvoice.dueDate) : 'Chưa định'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                    0 đ
                  </p>
                  <p className="text-xs text-stone-500">
                    Không có hóa đơn nào cần thanh toán
                  </p>
                </>
              )}
            </div>
            <div className="pt-2">
              {pendingInvoice ? (
                <Link
                  href={`/dashboard/tenant/invoices/${pendingInvoice.id}`}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Thanh toán ngay <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <Link
                  href="/dashboard/tenant/invoices"
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  Xem lịch sử hóa đơn <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </Card>

          {/* Card 3: Lịch hẹn xem phòng */}
          <Card className="p-4 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Lịch hẹn xem phòng</span>
                <Badge variant={upcomingAppointments.length > 0 ? 'primary' : 'neutral'} size="sm">
                  {upcomingAppointments.length > 0 ? `${upcomingAppointments.length} lịch hẹn` : '0 lịch hẹn'}
                </Badge>
              </div>
              {nextAppointment ? (
                <>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {nextAppointment.scheduledStart ? formatIsoDateTime(nextAppointment.scheduledStart) : 'Đang sắp xếp'}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
                    {nextAppointment.roomTitle || `Lịch hẹn #${nextAppointment.id}`}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Không có lịch hẹn
                  </p>
                  <p className="text-xs text-stone-500">
                    Bạn chưa đặt lịch hẹn xem phòng nào
                  </p>
                </>
              )}
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/tenant/appointments"
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                {upcomingAppointments.length > 0 ? 'Xem tất cả lịch hẹn' : 'Đặt lịch xem phòng'} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Card 4: Trạng thái an toàn tài khoản */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Trạng thái an toàn tài khoản</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* KYC */}
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {isKycVerified ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : isKycPending ? (
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-stone-400 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">Xác thực CCCD (KYC)</p>
                <p className="text-stone-500 text-[11px]">
                  {isKycVerified
                    ? 'Hồ sơ đã được kiểm duyệt bởi Admin'
                    : isKycPending
                    ? 'Hồ sơ đang chờ duyệt bởi Admin'
                    : 'Chưa gửi hồ sơ xác minh danh tính'}
                </p>
              </div>
            </div>
            {!isKycVerified && (
              <Link href="/dashboard/tenant/kyc">
                <Button variant="outline" size="sm" className="text-xs">
                  {isKycPending ? 'Xem trạng thái' : 'Xác thực ngay'}
                </Button>
              </Link>
            )}
          </div>

          {/* OTP E-Sign */}
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-3">
            {hasSignedOtp ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-stone-400 shrink-0" />
            )}
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">Chữ ký điện tử</p>
              <p className="text-stone-500 text-[11px]">
                {hasSignedOtp
                  ? 'Đã kích hoạt phương thức ký OTP'
                  : 'Sẽ kích hoạt tự động khi ký hợp đồng lần đầu'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
