'use client';

import React, { useEffect } from 'react';
import { Link } from '@/i18n/routing';
import {
  ShieldCheck,
  FileCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useHeaderHero } from '@/presentation/contexts/HeaderHeroContext';
import { useHomePageData } from '@/presentation/hooks/useHomePageData';
import { HomeHeroSearch } from '@/presentation/components/home/HomeHeroSearch';
import { HomeHotAreas } from '@/presentation/components/home/HomeHotAreas';
import { HomeBanners } from '@/presentation/components/home/HomeBanners';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';

export default function HomePage() {
  const { setHeroMounted } = useHeaderHero();
  const { latestRooms, featuredRooms, hotAreas, banners, stats, retryAll } = useHomePageData();

  useEffect(() => {
    setHeroMounted(true);
    return () => setHeroMounted(false);
  }, [setHeroMounted]);

  return (
    <div className="flex flex-col space-y-12 pb-16">
      {/* 1. Deep-Teal Architectural Hero starting under Fixed Transparent Header */}
      <section
        data-hero-header="true"
        className="relative overflow-hidden bg-gradient-to-br from-[#042f2e] via-[#0d4a46] to-[#134e4a] text-white pt-28 pb-16 md:pt-32 md:pb-20"
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-44 opacity-20"
          viewBox="0 0 1200 180"
          fill="none"
          preserveAspectRatio="none"
        >
          <rect x="40" y="65" width="90" height="115" rx="6" fill="#0f766e" />
          <rect x="60" y="85" width="16" height="18" rx="2" fill="#fbbf24" />
          <rect x="92" y="85" width="16" height="18" rx="2" fill="#fcd34d" />
          <rect x="160" y="38" width="110" height="142" rx="6" fill="#115e59" />
          <rect x="182" y="62" width="18" height="20" rx="2" fill="#f59e0b" />
          <rect x="218" y="62" width="18" height="20" rx="2" fill="#fde68a" />
          <rect x="920" y="45" width="120" height="135" rx="6" fill="#115e59" />
          <rect x="945" y="70" width="18" height="20" rx="2" fill="#fbbf24" />
          <rect x="985" y="70" width="18" height="20" rx="2" fill="#f59e0b" />
          <rect x="1065" y="75" width="95" height="105" rx="6" fill="#0f766e" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/15 border border-white/25 text-white">
              <ShieldCheck size={14} className="text-accent-300" />
              Nền tảng thuê trọ xác thực 100%
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Căn phòng thuê là{' '}
              <span className="text-accent-300 underline decoration-accent-400 decoration-4 underline-offset-8">
                Tổ Ấm
              </span>{' '}
              đầu tiên của bạn
            </h1>

            <p className="text-xs sm:text-sm text-primary-100 leading-relaxed max-w-2xl mx-auto">
              Minh bạch từng đồng tiền phòng, biểu phí điện nước rõ ràng, hợp đồng điện tử ký kết trực tuyến an tâm tuyệt đối.
            </p>

            <div className="pt-3 max-w-4xl mx-auto">
              <HomeHeroSearch hotProvinces={hotAreas.data} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <HomeBanners banners={banners.data} isLoading={banners.isLoading} />

        {hotAreas.error ? (
          <ErrorState title="Không thể tải khu vực nổi bật" message={hotAreas.error} onRetry={retryAll} />
        ) : (
          <HomeHotAreas areas={hotAreas.data} isLoading={hotAreas.isLoading} />
        )}

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary dark:text-primary-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Gợi ý nổi bật
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Phòng trọ được đánh giá cao nhất
              </h2>
            </div>
            <Link
              href="/rooms"
              className="text-xs font-semibold text-primary dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              Xem tất cả ({stats.data.activeRooms || featuredRooms.data.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredRooms.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredRooms.error ? (
            <ErrorState title="Lỗi tải phòng gợi ý nổi bật" message={featuredRooms.error} onRetry={retryAll} />
          ) : featuredRooms.data.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-border text-xs text-foreground-muted">
              Hiện chưa có phòng nào trong danh mục nổi bật.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredRooms.data.slice(0, 4).map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary dark:text-primary-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Mới cập nhật
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Phòng trọ mới đăng tải gần đây
              </h2>
            </div>
            <Link
              href="/rooms?sortBy=newest"
              className="text-xs font-semibold text-primary dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              Xem tất cả phòng mới <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestRooms.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          ) : latestRooms.error ? (
            <ErrorState title="Lỗi tải danh sách phòng mới" message={latestRooms.error} onRetry={retryAll} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestRooms.data.map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
          )}
        </section>

        <section className="py-8 border-y border-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-primary-400">
                {stats.data.activeRooms}+
              </span>
              <p className="text-xs text-foreground-muted font-medium">Phòng trọ đang hiển thị</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-primary-400">
                {stats.data.verifiedLandlords}+
              </span>
              <p className="text-xs text-foreground-muted font-medium">Chủ trọ xác thực KYC</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-primary-400">
                {stats.data.totalReviews}+
              </span>
              <p className="text-xs text-foreground-muted font-medium">Đánh giá người thuê thật</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-primary-400">
                100%
              </span>
              <p className="text-xs text-foreground-muted font-medium">Minh bạch biểu phí & cọc</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Trải nghiệm thuê phòng an tâm chuẩn quốc gia
            </h2>
            <p className="text-xs text-foreground-muted">
              Loại bỏ hoàn toàn các rủi ro lừa đảo, phát sinh chi phí ngầm khi thuê phòng trọ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-border bg-surface space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary dark:text-primary-400">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Xác thực danh tính chủ trọ</h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Mọi chủ nhà trọ đều được kiểm duyệt hồ sơ CCCD (KYC) trước khi được cấp quyền đăng tin chính thức.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-accent-50 dark:bg-accent-500/20 flex items-center justify-center text-accent-600 dark:text-accent-400">
                <FileCheck size={18} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Hợp đồng điện tử ký số</h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Điều khoản rõ ràng, lưu trữ bất biến. Cả hai bên ký điện tử online không cần tốn thời gian in ấn.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary dark:text-primary-400">
                <Zap size={18} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Biểu phí điện nước công khai</h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Ghi nhận chỉ số công tơ định kỳ hàng tháng kèm ảnh chụp minh chứng. Không lo bị đội giá.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
