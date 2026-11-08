'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  ShieldCheck,
  FileCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';
import { useHomePageData } from '@/presentation/hooks/useHomePageData';
import { HomeHeroSearch } from '@/presentation/components/home/HomeHeroSearch';
import { HomeHotAreas } from '@/presentation/components/home/HomeHotAreas';
import { HomeBanners } from '@/presentation/components/home/HomeBanners';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';

export default function HomePage() {
  const { latestRooms, featuredRooms, hotAreas, banners, stats, retryAll } = useHomePageData();

  return (
    <div className="flex flex-col space-y-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/70 via-stone-50/40 to-transparent dark:from-stone-900/60 dark:to-transparent pt-12 pb-14 md:pt-20 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
              <ShieldCheck size={14} className="text-amber-700 dark:text-amber-400" />
              Nền tảng thuê trọ xác thực 100%
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 leading-[1.15]">
              Căn phòng thuê là <span className="text-teal-700 dark:text-teal-400 underline decoration-amber-400 decoration-4 underline-offset-8">Tổ Ấm</span> đầu tiên của bạn
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
              Minh bạch từng đồng tiền phòng, biểu phí điện nước rõ ràng, hợp đồng điện tử ký kết trực tuyến an tâm tuyệt đối.
            </p>

            <div className="pt-4 max-w-2xl mx-auto">
              <HomeHeroSearch />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. Marketing Banners */}
        <HomeBanners banners={banners.data} isLoading={banners.isLoading} />

        {/* 3. Hot Areas */}
        {hotAreas.error ? (
          <ErrorState title="Không thể tải khu vực nổi bật" message={hotAreas.error} onRetry={retryAll} />
        ) : (
          <HomeHotAreas areas={hotAreas.data} isLoading={hotAreas.isLoading} />
        )}

        {/* 4. Featured Rooms */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Gợi ý nổi bật
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Phòng trọ được đánh giá cao nhất
              </h2>
            </div>
            <Link
              href="/rooms"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
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
            <div className="p-8 text-center rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-500">
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

        {/* 5. Latest Rooms */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Mới cập nhật
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Phòng trọ mới đăng tải gần đây
              </h2>
            </div>
            <Link
              href="/rooms?sortBy=newest"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
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

        {/* 6. Real Platform Stats */}
        <section className="py-8 border-y border-stone-200/80 dark:border-stone-800">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400">
                {stats.data.activeRooms}+
              </span>
              <p className="text-xs text-stone-500 font-medium">Phòng trọ đang hiển thị</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400">
                {stats.data.verifiedLandlords}+
              </span>
              <p className="text-xs text-stone-500 font-medium">Chủ trọ xác thực KYC</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400">
                {stats.data.totalReviews}+
              </span>
              <p className="text-xs text-stone-500 font-medium">Đánh giá người thuê thật</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400">
                100%
              </span>
              <p className="text-xs text-stone-500 font-medium">Minh bạch biểu phí & cọc</p>
            </div>
          </div>
        </section>

        {/* 7. 3 Pillars */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Trải nghiệm thuê phòng an tâm chuẩn quốc gia
            </h2>
            <p className="text-xs text-stone-500">
              Loại bỏ hoàn toàn các rủi ro lừa đảo, phát sinh chi phí ngầm khi thuê phòng trọ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Xác thực danh tính chủ trọ</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Mọi chủ nhà trọ đều được kiểm duyệt hồ sơ CCCD (KYC) trước khi được cấp quyền đăng tin chính thức.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FileCheck size={18} />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Hợp đồng điện tử ký số</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Điều khoản rõ ràng, lưu trữ bất biến. Cả hai bên ký điện tử online không cần tốn thời gian in ấn.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400">
                <Zap size={18} />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Biểu phí điện nước công khai</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Ghi nhận chỉ số công tơ định kỳ hàng tháng kèm ảnh chụp minh chứng. Không lo bị đội giá.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
