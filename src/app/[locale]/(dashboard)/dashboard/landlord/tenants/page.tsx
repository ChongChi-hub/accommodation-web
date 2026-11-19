'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { LandlordTenantRosterItem } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import { Mail, Phone, MessageSquare, ShieldCheck, Calendar, FileText, PlusCircle, Users, Home } from 'lucide-react';

export default function LandlordTenantsPage() {
  const tAuto = useTranslations('autoI18n');
  const tc = useTranslations('sprint3.common');
  const [tenants, setTenants] = useState<LandlordTenantRosterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const roster = await container.contract.contractRepository.getLandlordActiveTenants();
      setTenants(roster);
    } catch {
      try {
        const [list, requests] = await Promise.all([
          container.contract.contractRepository.getLandlordContracts(),
          container.rentalRequest.rentalRequestRepository.getLandlordRequests().catch(() => []),
        ]);
        const nameByTenant: Record<string, string> = {};
        const titleByRoom: Record<string, string> = {};
        for (const req of requests) {
          if (req.tenantId && req.tenantName?.trim()) nameByTenant[req.tenantId] = req.tenantName.trim();
          if (req.roomId && req.roomTitle?.trim()) titleByRoom[req.roomId] = req.roomTitle.trim();
        }
        const active = list
          .filter((c) => c.status === 'ACTIVE')
          .map<LandlordTenantRosterItem>((c) => ({
            contractId: c.id,
            contractCode: c.contractCode,
            orderCode: c.orderCode,
            roomId: c.roomId,
            roomTitle: titleByRoom[c.roomId] || null,
            tenantId: c.tenantId,
            tenantName: nameByTenant[c.tenantId] || null,
            tenantEmail: null,
            tenantPhone: null,
            status: c.status,
            startDate: c.startDate,
            endDate: c.endDate,
            monthlyRent: c.monthlyRent,
            depositAmount: c.depositAmount,
            depositPaidAt: c.depositPaidAt,
          }));
        setTenants(active);
      } catch {
        toast.error(tc('loadError'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {tAuto('k0240')}{tenants.length})
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            {tAuto('k0241')}
          </p>
        </div>
        <Link href="/dashboard/landlord/contracts">
          <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
            Xem tất cả hợp đồng
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : tenants.length === 0 ? (
        <Card className="p-10 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Chưa có khách thuê nào</h3>
            <p className="text-xs text-foreground-muted max-w-sm">
              Khi hợp đồng thuê phòng đã được kích hoạt (ACTIVE), thông tin khách thuê sẽ tự động hiển thị tại đây.
            </p>
          </div>
          <Link href="/dashboard/landlord/contracts">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Xem danh sách hợp đồng
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {tenants.map((t) => {
            const displayName = t.tenantName || t.tenantEmail || tc('tenantFallbackName');
            return (
              <Card key={t.contractId} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <Avatar name={displayName} size="lg" />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{displayName}</h3>
                      <Badge variant="success" size="sm">
                        <ShieldCheck className="w-3 h-3" /> Đang thuê
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {t.roomTitle ? `${t.roomTitle} · ` : ''}
                        Hợp đồng #{t.contractCode} (Phòng ID: {t.roomId})
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
                      {t.tenantEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-stone-400" />
                          {t.tenantEmail}
                        </span>
                      )}
                      {t.tenantPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {t.tenantPhone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {formatIsoDate(t.startDate)} - {formatIsoDate(t.endDate)}
                      </span>
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        Tiền thuê: {formatVnd(t.monthlyRent)}/tháng
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/dashboard/landlord/contracts/${t.contractId}`}>
                    <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                      Chi tiết HĐ
                    </Button>
                  </Link>
                  <Link href={`/dashboard/landlord/messages?targetUserId=${t.tenantId}`}>
                    <Button variant="primary" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                      {tAuto('k0244')}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
