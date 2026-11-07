'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const t = useTranslations('nav');

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image src="/logo.svg" alt="Tổ Ấm" width={130} height={30} />
            </Link>
            <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              Nền tảng công nghệ kết nối người thuê và chủ nhà trọ minh bạch, an toàn, chuẩn xác hàng đầu Việt Nam.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-800 dark:text-teal-400 font-medium">
              <ShieldCheck size={16} />
              <span>100% phòng được xác thực thực tế</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3">
              Khám phá
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/rooms" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {t('rooms')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  Bảng giá dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/safety-guide" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  Cẩm nang thuê an toàn
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3">
              Thông tin & Pháp lý
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3">
              Liên hệ hỗ trợ
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-500 dark:text-stone-400">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-teal-700 dark:text-teal-400 shrink-0" />
                <span>Quận Cầu Giấy, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-teal-700 dark:text-teal-400 shrink-0" />
                <Link href="/contact" className="hover:text-teal-700 dark:hover:text-teal-400">
                  lienhe@toam.vn
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-teal-700 dark:text-teal-400 shrink-0" />
                <span>1900 8866 (8:00 - 21:00)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-200 dark:border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} Tổ Ấm Platform. Bảo lưu mọi quyền.</p>
          <p>Nền tảng hỗ trợ sinh viên và người đi làm an cư lạc nghiệp.</p>
        </div>
      </div>
    </footer>
  );
}
