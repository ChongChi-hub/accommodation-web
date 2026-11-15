'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { ChartCard } from '@/presentation/components/ui/ChartCard';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { LandlordRoomSummary } from '@/domain/entities/LandlordRoom';
import { AppointmentSummary, ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { formatIsoDateTime } from '@/shared/utils/format-vnd';
import {
  PlusCircle,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function LandlordOverviewPage() {
  const tAuto = useTranslations('autoI18n');
  const { user } = useAuthStore();

  const [roomSummary, setRoomSummary] = useState<LandlordRoomSummary | null>(null);
  const [appointmentSummary, setAppointmentSummary] = useState<AppointmentSummary | null>(null);
  const [pendingAppointments, setPendingAppointments] = useState<ViewingAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const [roomsRes, apptsRes, pendingRes] = await Promise.allSettled([
          container.landlord.landlordRoomRepository.getSummary(),
          container.landlord.appointmentRepository.getSummary(),
          container.landlord.appointmentRepository.getAppointments({
            status: 'PENDING',
            page: 0,
            size: 5,
          }),
        ]);

        if (mounted) {
          if (roomsRes.status === 'fulfilled') {
            setRoomSummary(roomsRes.value);
          }
          if (apptsRes.status === 'fulfilled') {
            setAppointmentSummary(apptsRes.value);
          }
          if (pendingRes.status === 'fulfilled') {
            setPendingAppointments(pendingRes.value.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load landlord overview data', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Tính toán số liệu phòng
  const totalRooms = roomSummary?.total ?? 0;
  const rentedRooms = roomSummary?.rented ?? 0;
  const publishedRooms = roomSummary?.published ?? 0;
  const occupancyPercent = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

  // Số lượng lịch hẹn chờ duyệt
  const pendingAppointmentsCount = appointmentSummary?.totalPending ?? pendingAppointments.length;
  const nextAppointment = pendingAppointments[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0189')}{' '}{user?.fullName || 'Chủ trọ'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0190')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/landlord/rooms/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              {tAuto('k0191')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu */}
        <ChartCard
          title={`Doanh thu tháng ${currentMonth}/${currentYear}`}
          value={totalRooms > 0 ? (rentedRooms > 0 ? `${(rentedRooms * 4500000).toLocaleString('vi-VN')} đ` : '0 đ') : '0 đ'}
          change={totalRooms > 0 ? '+0%' : undefined}
          isPositive={true}
          description={totalRooms > 0 ? `Đã cho thuê ${rentedRooms}/${totalRooms} phòng` : 'Chưa phát sinh doanh thu'}
          dataPoints={totalRooms > 0 && rentedRooms > 0 ? [18, 20, 22, 21, 24, 23, 25] : [0, 0, 0, 0, 0, 0, 0]}
        />

        {/* Card 2: Tỉ lệ lấp đầy */}
        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">Tỉ lệ lấp đầy phòng</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {totalRooms > 0 ? `${rentedRooms} / ${totalRooms} phòng` : '0 / 0 phòng'}
              </span>
              <Badge variant={totalRooms > 0 && occupancyPercent >= 50 ? 'success' : 'neutral'} size="sm">
                {occupancyPercent}%
              </Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {totalRooms === 0
                ? 'Chưa có phòng nào được tạo'
                : totalRooms - rentedRooms > 0
                ? `Còn ${totalRooms - rentedRooms} phòng trống (${publishedRooms} đang đăng tin)`
                : 'Đã lấp đầy toàn bộ phòng'}
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link
              href="/dashboard/landlord/rooms"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              Quản lý danh sách phòng <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Card 3: Lịch hẹn khách xem phòng */}
        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">Lịch hẹn khách xem phòng</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {pendingAppointmentsCount} lịch hẹn
              </span>
              {pendingAppointmentsCount > 0 ? (
                <Badge variant="warning" size="sm">Chờ duyệt</Badge>
              ) : (
                <Badge variant="success" size="sm">Ổn định</Badge>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5 truncate">
              {nextAppointment
                ? `Gần nhất: ${formatIsoDateTime(nextAppointment.scheduledStart)}`
                : 'Hiện không có lịch hẹn mới'}
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link
              href="/dashboard/landlord/appointments"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              Xử lý lịch hẹn <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Card 4: Ghi chỉ số điện nước */}
        <Card className="p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-stone-400">Ghi chỉ số điện nước</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                Kỳ tháng {currentMonth}
              </span>
              <Badge variant="primary" size="sm">Hàng tháng</Badge>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Hạn chốt chỉ số: Ngày 15 hàng tháng
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <Link
              href="/dashboard/landlord/utilities"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              Nhập chỉ số công tơ <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Việc cần xử lý khẩn cấp */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Việc cần xử lý hôm nay
          </h2>
          {pendingAppointments.length > 0 && (
            <Badge variant="warning" size="sm">
              {pendingAppointments.length} việc cần làm
            </Badge>
          )}
        </div>

        {pendingAppointments.length > 0 ? (
          <div className="space-y-3 text-xs">
            {pendingAppointments.map((appt) => (
              <div
                key={appt.id}
                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50 dark:bg-stone-900/50"
              >
                <div>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    {appt.contactName || 'Khách thuê'} gửi yêu cầu hẹn xem phòng{' '}
                    <span className="text-teal-700 dark:text-teal-400 font-bold">{appt.roomTitle}</span>
                  </p>
                  <p className="text-stone-400 text-[11px] mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Thời gian đề xuất: {formatIsoDateTime(appt.scheduledStart)}
                  </p>
                </div>
                <Link href={`/dashboard/landlord/appointments`}>
                  <Button variant="outline" size="sm">
                    Duyệt lịch hẹn
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : totalRooms === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Chào mừng bạn đến với Tổ Ấm!
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                Tài khoản của bạn hiện chưa có phòng trọ nào. Hãy đăng tin bài đầu tiên để bắt đầu tiếp cận hàng ngàn khách thuê tiềm năng.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/dashboard/landlord/rooms/new">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                  Đăng phòng đầu tiên ngay
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Tất cả công việc đã hoàn tất!
            </h3>
            <p className="text-xs text-stone-500">
              Hiện tại bạn không có lịch hẹn hoặc công việc nào cần xử lý khẩn cấp hôm nay.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
