'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldCheck, Star, MessageSquare, Home, ArrowRight } from 'lucide-react';
import { HostPublicProfileDto } from '@/application/dto/listing.dto';
import { container } from '@/infrastructure/di/container';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';

export function HomeTopLandlordsSection() {
  const t = useTranslations('topHosts');
  const [hosts, setHosts] = useState<HostPublicProfileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchHosts = async () => {
      try {
        const repo = container.listing.listingRepository;
        if (repo.getTopHosts) {
          const data = await repo.getTopHosts();
          if (active) {
            setHosts(data.slice(0, 4));
          }
        }
      } catch {
        // Fallback or quiet fail
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchHosts();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-[#FAF7F2]/60 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (hosts.length === 0) return null;

  return (
    <section className="py-14 bg-[#FAF7F2]/60 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded bg-teal-100 text-teal-700">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                {t('verifiedBadge')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {t('title')}
            </h2>
            <p className="mt-1 text-sm text-foreground-muted max-w-2xl">
              {t('subtitle')}
            </p>
          </div>
          <Link
            href="/hosts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors self-start sm:self-auto"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hosts.map((host) => {
            const hostId = host.id || host.landlordId;
            return (
              <Card
                key={hostId}
                className="group relative flex flex-col items-center text-center p-6 bg-surface hover:shadow-md transition-all duration-200 border-border/80"
              >
                <div className="relative mb-4">
                  <Avatar
                    src={host.avatarUrl}
                    name={host.name}
                    size="lg"
                    className="w-20 h-20 border-2 border-teal-600/20 group-hover:border-teal-600 transition-colors"
                  />
                  {host.verified && (
                    <span
                      className="absolute bottom-0 right-0 p-1 bg-teal-700 text-white rounded-full shadow-sm"
                      title={t('verifiedBadge')}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-teal-700 transition-colors line-clamp-1">
                  {host.name}
                </h3>

                <div className="flex items-center gap-1.5 mt-2">
                  <Badge variant="success" size="sm">
                    {t('verifiedBadge')}
                  </Badge>
                  <div className="flex items-center text-amber-500 font-semibold text-xs gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{host.ratingAvg?.toFixed(1) || '5.0'}</span>
                    <span className="text-foreground-muted font-normal">
                      ({host.reviewCount || 0})
                    </span>
                  </div>
                </div>

                <div className="w-full mt-4 pt-4 border-t border-border/60 grid grid-cols-2 gap-2 text-left">
                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                    <Home className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>{t('roomCountItem', { count: host.roomCount || 0 })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>{t('responsePercentItem', { percent: host.responseRatePercent || 100 })}</span>
                  </div>
                </div>

                <div className="w-full mt-5">
                  <Link href={`/hosts/${hostId}`} className="w-full block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-teal-50 group-hover:text-teal-800 group-hover:border-teal-600 transition-colors text-xs font-semibold"
                    >
                      {t('viewProfile')}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

