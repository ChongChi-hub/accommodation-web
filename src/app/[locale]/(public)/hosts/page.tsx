'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldCheck, Star, MessageSquare, Home, Clock, Search } from 'lucide-react';
import { HostPublicProfileDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';

export default function HostsListingPage() {
  const t = useTranslations('topHosts');
  const [hosts, setHosts] = useState<HostPublicProfileDto[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchHosts = async () => {
      try {
        const repo = container.listing.listingRepository;
        if (repo.getTopHosts) {
          const data = await repo.getTopHosts();
          if (active) setHosts(data);
        }
      } catch {
        // error handling
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchHosts();
    return () => {
      active = false;
    };
  }, []);

  const filteredHosts = hosts.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: t('title'), href: '/hosts' },
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded bg-teal-100 text-teal-700">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                {t('verifiedBadge')}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {t('title')}
            </h1>
            <p className="mt-1 text-sm text-foreground-muted max-w-2xl">
              {t('subtitle')}
            </p>
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên chủ trọ..."
                className="pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filteredHosts.length === 0 ? (
          <EmptyState
            title="Không tìm thấy chủ trọ"
            description="Không có chủ trọ nào phù hợp với từ khóa tìm kiếm."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHosts.map((host) => {
              const hostId = host.id || host.landlordId;
              return (
                <Card
                  key={hostId}
                  className="group relative flex flex-col items-center text-center p-6 bg-surface hover:shadow-lg transition-all duration-200 border-border"
                >
                  <div className="relative mb-4">
                    <Avatar
                      src={host.avatarUrl}
                      name={host.name}
                      size="xl"
                      className="w-24 h-24 border-2 border-teal-600/30 group-hover:border-teal-600 transition-colors"
                    />
                    {host.verified && (
                      <span
                        className="absolute bottom-0 right-0 p-1.5 bg-teal-700 text-white rounded-full shadow-md"
                        title={t('verifiedBadge')}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-teal-700 transition-colors">
                    {host.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="success" size="sm">
                      {t('verifiedBadge')}
                    </Badge>
                    <div className="flex items-center text-amber-500 font-semibold text-xs gap-1">
                      <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                      <span>{host.ratingAvg?.toFixed(1) || '5.0'}</span>
                      <span className="text-foreground-muted font-normal">
                        ({host.reviewCount || 0} đánh giá)
                      </span>
                    </div>
                  </div>

                  <div className="w-full mt-6 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-surface-muted">
                      <div className="text-xs text-foreground-muted flex items-center justify-center gap-1">
                        <Home className="w-3.5 h-3.5 text-teal-700" />
                        <span>Phòng</span>
                      </div>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {host.roomCount || 0}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-surface-muted">
                      <div className="text-xs text-foreground-muted flex items-center justify-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                        <span>Hồi đáp</span>
                      </div>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {host.responseRatePercent || 100}%
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-surface-muted">
                      <div className="text-xs text-foreground-muted flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-700" />
                        <span>Tốc độ</span>
                      </div>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {host.responseTimeMinutes ? `${host.responseTimeMinutes}m` : '< 1h'}
                      </p>
                    </div>
                  </div>

                  <div className="w-full mt-6">
                    <Link href={`/hosts/${hostId}`} className="w-full block">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm"
                      >
                        {t('viewProfile')}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
