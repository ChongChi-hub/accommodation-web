import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, ShieldCheck, FileCheck, Zap, ArrowRight, MapPin } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('brand');
  const tNav = useTranslations('nav');

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/60 to-transparent pt-16 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100/80 text-amber-900 mb-6">
              <ShieldCheck size={14} className="text-amber-700" />
              Nền tảng thuê trọ xác thực 100%
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
              Căn phòng thuê là <span className="text-teal-700 underline decoration-amber-400 decoration-4 underline-offset-8">Tổ Ấm</span> đầu tiên của bạn
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed">
              Minh bạch từng đồng tiền phòng, biểu phí điện nước rõ ràng, hợp đồng điện tử ký kết trực tuyến an tâm tuyệt đối.
            </p>

            {/* Quick Search Card */}
            <div className="mt-10 mx-auto max-w-2xl rounded-2xl bg-white p-3 shadow-xl shadow-stone-200/50 border border-stone-200/70 flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center gap-2.5 px-3 py-2 w-full flex-1 text-stone-500">
                <MapPin size={20} className="text-teal-700 shrink-0" />
                <input
                  type="text"
                  placeholder="Khu vực, quận huyện, trường đại học..."
                  className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                  readOnly
                />
              </div>
              <Link
                href="/rooms"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition shrink-0"
              >
                <Search size={16} />
                <span>Tìm phòng ngay</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars / Feature Grid */}
      <section className="py-16 md:py-24 border-t border-stone-200/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Trải nghiệm thuê phòng minh bạch và an tâm
            </h2>
            <p className="mt-3 text-stone-500 text-sm sm:text-base">
              Chúng tôi loại bỏ hoàn toàn các rủi ro lừa đảo, phát sinh chi phí ngầm khi thuê trọ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 mb-5">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Xác thực danh tính chủ trọ</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Mọi chủ nhà trọ đều được kiểm duyệt hồ sơ CCCD (KYC) trước khi được cấp quyền đăng tin chính thức.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 mb-5">
                <FileCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Hợp đồng điện tử ký số</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Điều khoản rõ ràng, lưu trữ bất biến. Cả hai bên ký điện tử online không cần tốn thời gian in ấn.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 mb-5">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Biểu phí điện nước công khai</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Ghi nhận chỉ số công tơ định kỳ hàng tháng kèm ảnh chụp minh chứng. Không còn nỗi lo bị đội giá.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
