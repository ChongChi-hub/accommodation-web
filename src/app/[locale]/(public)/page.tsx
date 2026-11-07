'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, ShieldCheck, FileCheck, Zap, ArrowRight, MapPin, Building, Star, CheckCircle } from 'lucide-react';
import { useRooms } from '@/presentation/hooks/useRooms';
import { RoomCard } from '@/presentation/components/rooms/RoomCard';
import { RoomCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { Button } from '@/presentation/components/ui/Button';

export default function HomePage() {
  const t = useTranslations('brand');
  const { rooms, isLoading } = useRooms();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/70 via-stone-50/40 to-transparent dark:from-stone-900/60 dark:to-transparent pt-14 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
              <ShieldCheck size={14} className="text-amber-700 dark:text-amber-400" />
              Nền tảng thuê trọ xác thực 100%
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 leading-[1.15]">
              Căn phòng thuê là <span className="text-teal-700 dark:text-teal-400 underline decoration-amber-400 decoration-4 underline-offset-8">Tổ Ấm</span> đầu tiên của bạn
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
              Minh bạch từng đồng tiền phòng, biểu phí điện nước rõ ràng, hợp đồng điện tử ký kết trực tuyến an tâm tuyệt đối.
            </p>

            {/* Quick Search Bar */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="rounded-2xl bg-white dark:bg-stone-900 p-2 shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row gap-2 items-center">
                <div className="flex items-center gap-2.5 px-3 py-2 w-full flex-1 text-stone-500">
                  <MapPin size={18} className="text-teal-700 dark:text-teal-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Hà Nội, Cầu Giấy, Đống Đa, TP.HCM..."
                    className="w-full bg-transparent text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
                    readOnly
                  />
                </div>
                <Link href="/rooms" className="w-full sm:w-auto">
                  <Button variant="primary" size="md" className="w-full sm:w-auto" leftIcon={<Search size={15} />}>
                    Tìm phòng ngay
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-12 border-t border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                Gợi ý nổi bật
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Phòng trọ mới đăng được xác thực
              </h2>
            </div>
            <Link href="/rooms" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
              Xem tất cả ({rooms.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.slice(0, 3).map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3 Pillars / Feature Grid */}
      <section className="py-16 border-t border-stone-200/60 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Trải nghiệm thuê phòng an tâm chuẩn quốc gia
            </h2>
            <p className="text-xs text-stone-500">
              Loại bỏ hoàn toàn các rủi ro lừa đảo, phát sinh chi phí ngầm khi thuê phòng trọ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Xác thực danh tính chủ trọ</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Mọi chủ nhà trọ đều được kiểm duyệt hồ sơ CCCD (KYC) trước khi được cấp quyền đăng tin chính thức.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FileCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Hợp đồng điện tử ký số</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Điều khoản rõ ràng, lưu trữ bất biến. Cả hai bên ký điện tử online không cần tốn thời gian in ấn.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400">
                <Zap size={20} />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Biểu phí điện nước công khai</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Ghi nhận chỉ số công tơ định kỳ hàng tháng kèm ảnh chụp minh chứng. Không lo bị đội giá.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
