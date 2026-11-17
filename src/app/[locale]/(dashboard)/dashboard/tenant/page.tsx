'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Link } from '@/i18n/routing';
import { Contract } from '@/domain/entities/Contract';
import { Invoice } from '@/domain/entities/Billing';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';
import { formatIsoDate, formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import {
  FileText,
  CreditCard,
  Calendar,
  Search,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function TenantOverviewPage() {
  const tAuto = useTranslations('autoI18n');
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [unpaidInvoice, setUnpaidInvoice] = useState<Invoice | null>(null);
  const [nextAppointment, setNextAppointment] = useState<ViewingAppointmentItem | null>(null);
  const [kycStatus, setKycStatus] = useState<LandlordKycStatus | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTenantData() {
      setIsLoading(true);
      try {
        const [contractsRes, invoicesRes, apptsRes, kycRes] = await Promise.allSettled([
          container.contract.contractRepository.getTenantContracts(),
          container.billing.billingRepository.getTenantInvoices(),
          container.appointment.appointmentRepository.getTenantAppointments(0, 10),
          container.kyc.landlordKycUseCases.getKycStatus(),
        ]);

        if (!mounted) return;

        if (contractsRes.status === 'fulfilled' && Array.isArray(contractsRes.value)) {
          const list = contractsRes.value;
          const active =
            list.find((c: Contract) => c.status === 'ACTIVE') ||
            list.find((c: Contract) => c.status.startsWith('PENDING')) ||
            list[0] ||
            null;
          setActiveContract(active);
        }

        if (invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value)) {
          const unpaid = invoicesRes.value.find(
            (inv: Invoice) => inv.status !== 'PAID' && inv.status !== 'CANCELLED'
          );
          setUnpaidInvoice(unpaid || null);
        }

        if (apptsRes.status === 'fulfilled' && apptsRes.value?.data) {
          const upcoming = apptsRes.value.data.find(
            (a: ViewingAppointmentItem) => a.status === 'PENDING' || a.status === 'CONFIRMED'
          );
          setNextAppointment(upcoming || null);
        }

        if (kycRes.status === 'fulfilled') {
          setKycStatus(kycRes.value);
        }
      } catch (err) {
        console.error('Failed to load tenant overview data', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadTenantData();

    return () => {
      mounted = false;
    };
  }, []);

  const isKycApproved = kycStatus?.status === 'APPROVED';
  const isKycPending = kycStatus?.status === 'PENDING';
  const isKycRejected = kycStatus?.status === 'REJECTED';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0357')} {user?.fullName || 'Bạn'}!
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
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Hợp đồng hiện tại */}
          <Card className="p-4 space-y-2 border-teal-700/20 bg-teal-50/40 dark:bg-teal-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">{tAuto('k0360')}</span>
              {activeContract ? (
                <Badge variant={activeContract.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                  {activeContract.status === 'ACTIVE' ? 'Đang thuê' : activeContract.status}
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">Chưa có phòng</Badge>
              )}
            </div>
            <p className="text-base font-bold text-stone-900 dark:text-stone-100">
              {activeContract ? activeContract.contractCode : 'Chưa có hợp đồng nào'}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
              {activeContract
                ? `Phòng #${activeContract.roomId}`
                : 'Bạn chưa có hợp đồng thuê phòng nào đang hoạt động'}
            </p>
            <div className="pt-2">
              {activeContract ? (
                <Link
                  href={`/dashboard/tenant/contracts/${activeContract.id}`}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  {tAuto('k0303')} <ArrowRight className="w-3 h-3" />
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
          <Card className="p-4 space-y-2 border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">{tAuto('k0364')}</span>
              {unpaidInvoice ? (
                <Badge variant="warning" size="sm">Chờ thanh toán</Badge>
              ) : (
                <Badge variant="success" size="sm">Đã thanh toán đủ</Badge>
              )}
            </div>
            <p className="text-base font-bold text-stone-900 dark:text-stone-100">
              {unpaidInvoice ? formatVnd(unpaidInvoice.totalAmount) : '0 đ'}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
              {unpaidInvoice
                ? `Kỳ ${formatIsoDate(unpaidInvoice.periodMonth)} • Hạn: ${formatIsoDate(unpaidInvoice.dueDate)}`
                : 'Bạn không có hóa đơn nào quá hạn hoặc cần thanh toán'}
            </p>
            <div className="pt-2">
              {unpaidInvoice ? (
                <Link
                  href={`/dashboard/tenant/invoices/${unpaidInvoice.id}`}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  {tAuto('k0367')} <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <Link
                  href="/dashboard/tenant/invoices"
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Xem lịch sử hóa đơn <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </Card>

          {/* Card 3: Lịch hẹn xem phòng */}
          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">{tAuto('k0368')}</span>
              {nextAppointment ? (
                <Badge variant={nextAppointment.status === 'CONFIRMED' ? 'success' : 'primary'} size="sm">
                  {nextAppointment.status === 'CONFIRMED' ? 'Đã xác nhận' : '1 lịch hẹn'}
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">Không có lịch</Badge>
              )}
            </div>
            <p className="text-base font-bold text-stone-900 dark:text-stone-100">
              {nextAppointment ? formatIsoDateTime(nextAppointment.scheduledStart) : 'Chưa có lịch hẹn'}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
              {nextAppointment
                ? (nextAppointment.roomTitle || 'Lịch hẹn xem phòng trọ')
                : 'Bạn chưa đặt lịch hẹn xem phòng nào'}
            </p>
            <div className="pt-2">
              {nextAppointment ? (
                <Link
                  href="/dashboard/tenant/appointments"
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  {tAuto('k0372')} <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <Link
                  href="/rooms"
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  Đặt lịch xem phòng <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Card 4: Trạng thái an toàn tài khoản */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">{tAuto('k0373')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* KYC Status */}
          <Link
            href="/dashboard/tenant/kyc"
            className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 hover:border-teal-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {isKycApproved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : isKycPending ? (
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              ) : isKycRejected ? (
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-stone-400 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {isKycApproved
                    ? 'Xác thực CCCD (KYC): Đã xác minh'
                    : isKycPending
                    ? 'Xác thực CCCD (KYC): Đang chờ duyệt'
                    : isKycRejected
                    ? 'Xác thực CCCD (KYC): Bị từ chối'
                    : 'Xác thực CCCD (KYC): Chưa xác minh'}
                </p>
                <p className="text-stone-500 text-[11px]">
                  {isKycApproved
                    ? (kycStatus?.fullNameOnId ? `Hồ sơ ${kycStatus.fullNameOnId} đã kiểm duyệt` : 'Hồ sơ đã được kiểm duyệt bởi Admin')
                    : isKycPending
                    ? 'Đội ngũ kiểm duyệt đang xử lý hồ sơ'
                    : isKycRejected
                    ? (kycStatus?.rejectReasonNote || 'Vui lòng cập nhật lại thông tin CCCD')
                    : 'Xác thực để ký hợp đồng và nhận bảo hiểm tiền cọc'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
          </Link>

          {/* Two-Factor & OTP Signature Status */}
          <Link
            href="/dashboard/tenant/settings"
            className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 hover:border-teal-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {user?.emailVerified ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-stone-400 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {user?.emailVerified
                    ? 'Chữ ký điện tử & Bảo mật: Đã xác thực'
                    : 'Chữ ký điện tử & Bảo mật OTP'}
                </p>
                <p className="text-stone-500 text-[11px]">
                  {user?.emailVerified
                    ? 'Tài khoản đã xác thực thông tin và đủ điều kiện ký hợp đồng'
                    : 'Kích hoạt phương thức ký OTP và thiết lập bảo mật hai lớp'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
