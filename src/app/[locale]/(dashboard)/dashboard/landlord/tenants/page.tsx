'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Link } from '@/i18n/routing';
import { Phone, MessageSquare, ShieldCheck, Calendar } from 'lucide-react';

export default function LandlordTenantsPage() {
  const tenants = [
    {
      id: 1,
      name: 'Nguyễn Văn Thuê',
      phone: '0987 654 321',
      email: 'tenant@toam.vn',
      room: 'Phòng 302, Dịch Vọng Hậu',
      moveInDate: '01/11/2026',
      contractEnd: '31/10/2027',
      status: 'ACTIVE',
      depositPaid: true,
    },
    {
      id: 2,
      name: 'Lê Thị Mai',
      phone: '0901 234 567',
      email: 'mai.le@example.com',
      room: 'Phòng 501, Láng Hạ',
      moveInDate: '01/08/2026',
      contractEnd: '31/07/2027',
      status: 'ACTIVE',
      depositPaid: true,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Khách thuê hiện tại ({tenants.length})
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Danh sách khách đang cư trú tại các phòng trọ của bạn.
        </p>
      </div>

      <div className="space-y-4">
        {tenants.map((t) => (
          <Card key={t.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar name={t.name} size="lg" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{t.name}</h3>
                  <Badge variant="success" size="sm">
                    <ShieldCheck className="w-3 h-3" /> Đã KYC
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">{t.room}</p>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-stone-400" /> {t.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" /> Đến {t.contractEnd}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard/landlord/messages">
                <Button variant="outline" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                  Nhắn tin
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

