'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { Contract } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import { Phone, MessageSquare, ShieldCheck, Calendar, FileText, PlusCircle, Users } from 'lucide-react';

export default function LandlordTenantsPage() {
  const tAuto = useTranslations('autoI18n');
  const tc = useTranslations('sprint3.common');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenantNames, setTenantNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [list, requests] = await Promise.all([
        container.contract.contractRepository.getLandlordContracts(),
        container.rentalRequest.rentalRequestRepository.getLandlordRequests().catch(() => []),
      ]);
      // BUG-07 fix: Only show ACTIVE tenants in the active-tenants roster
      const activeContracts = list.filter((c) => c.status === 'ACTIVE');
      setContracts(activeContracts);

      const nameMap: Record<string, string> = {};
      for (const req of requests) {
        if (req.tenantId && req.tenantName && req.tenantName.trim()) {
          nameMap[req.tenantId] = req.tenantName.trim();
        }
      }
      // Fallback: check primary occupant fullName for any contract whose tenantName is missing
      await Promise.all(
        activeContracts
          .filter((c) => !nameMap[c.tenantId])
          .map(async (c) => {
            try {
              const occs = await container.contract.contractRepository.getOccupants(c.id);
              const primary = occs.find((o) => o.primaryTenant) || occs[0];
              if (primary?.fullName) {
                nameMap[c.tenantId] = primary.fullName;
              }
            } catch {
              // ignore
            }
          })
      );
      setTenantNames(nameMap);
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" size="sm">
            <ShieldCheck className="w-3 h-3" /> Đang thuê
          </Badge>
        );
      case 'PENDING_SIGNATURES':
      case 'PENDING_TENANT':
      case 'PENDING_LANDLORD':
        return (
          <Badge variant="warning" size="sm">
            Chờ ký hợp đồng
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="neutral" size="sm">
            Đã hết hạn
          </Badge>
        );
      case 'TERMINATED':
      case 'CANCELLED':
        return (
          <Badge variant="neutral" size="sm">
            Đã thanh lý
          </Badge>
        );
      default:
        return (
          <Badge variant="primary" size="sm">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {tAuto('k0240')}{contracts.length})
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
      ) : contracts.length === 0 ? (
        <Card className="p-10 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Chưa có khách thuê nào</h3>
            <p className="text-xs text-foreground-muted max-w-sm">
              Khi khách thuê ký hợp đồng thuê phòng với bạn, thông tin khách thuê sẽ tự động hiển thị tại đây.
            </p>
          </div>
          <Link href="/dashboard/landlord/contracts">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Tạo hợp đồng thuê mới
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <Card key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar name={tenantNames[c.tenantId] || tc('tenantFallbackName')} size="lg" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {tenantNames[c.tenantId] || tc('tenantFallbackName')}
                    </h3>
                    {getStatusBadge(c.status)}
                  </div>
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    {c.orderCode ? `${c.orderCode} · ` : ''}Hợp đồng #{c.contractCode} (Phòng ID: {c.roomId})
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {formatIsoDate(c.startDate)} - {formatIsoDate(c.endDate)}
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      Tiền thuê: {formatVnd(c.monthlyRent)}/tháng
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/dashboard/landlord/contracts/${c.id}`}>
                  <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                    Chi tiết HĐ
                  </Button>
                </Link>
                <Link href={`/dashboard/landlord/messages?targetUserId=${c.tenantId}`}>
                  <Button variant="primary" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                    {tAuto('k0244')}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
