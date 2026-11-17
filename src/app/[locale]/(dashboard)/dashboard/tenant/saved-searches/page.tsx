'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { Link } from '@/i18n/routing';
import { Search, MapPin, Tag, Trash2, Bell } from 'lucide-react';
import { toast } from '@/presentation/stores/toast.store';
import { container } from '@/infrastructure/di/container';

interface SavedSearchItem {
  id: number;
  title: string;
  location?: string;
  priceRange?: string;
  roomType?: string;
  notifications?: boolean;
  queryParams?: string;
  createdAt?: string;
}

export default function TenantSavedSearchesPage() {
  const tAuto = useTranslations('autoI18n');
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSearches = useCallback(async () => {
    setIsLoading(true);
    try {
      if (container.listing.listingRepository.getSavedSearches) {
        const data = await container.listing.listingRepository.getSavedSearches();
        const parsed = (Array.isArray(data) ? data : []).map((item: any) => {
          let qp: any = {};
          try {
            qp = typeof item.queryParams === 'string' ? JSON.parse(item.queryParams) : item.queryParams || {};
          } catch {}
          return {
            id: Number(item.id),
            title: item.title,
            location: qp.location || 'Toàn quốc',
            priceRange: qp.priceRange || 'Thỏa thuận',
            roomType: qp.roomType || 'Tất cả',
            notifications: Boolean(item.notifications),
            createdAt: item.createdAt,
          };
        });
        setSavedSearches(parsed);
      }
    } catch {
      setSavedSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const handleDelete = async (id: number) => {
    try {
      if (container.listing.listingRepository.deleteSavedSearch) {
        await container.listing.listingRepository.deleteSavedSearch(id);
      }
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      toast.success('Đã xóa bộ lọc tìm kiếm đã lưu!');
    } catch {
      toast.error('Lỗi khi xóa bộ lọc tìm kiếm');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {tAuto('k0395')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0396')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : savedSearches.length === 0 ? (
        <Card className="p-10 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Chưa có tìm kiếm nào được lưu</h3>
          <p className="text-xs text-foreground-muted max-w-sm">
            Khi duyệt tìm phòng trọ, bạn có thể lưu các tiêu chí tìm kiếm để nhận thông báo phòng mới phù hợp.
          </p>
          <Link href="/rooms">
            <Button variant="primary" size="sm" leftIcon={<Search className="w-4 h-4" />}>
              Khám phá phòng trọ
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {savedSearches.map((s) => (
            <Card key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{s.title}</h3>
                  {s.roomType && <Badge variant="primary" size="sm">{s.roomType}</Badge>}
                  {s.notifications && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full font-medium">
                      <Bell className="w-3 h-3" /> Thông báo
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" /> {s.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400" /> {s.priceRange}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href="/rooms">
                  <Button variant="outline" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
                    {tAuto('k0397')}
                  </Button>
                </Link>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  aria-label="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
