import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export function Footer() {
  const t = useTranslations('nav');

  return (
    <footer className="border-t border-stone-200 bg-white pt-12 pb-8 text-stone-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Image src="/logo.svg" alt="Tổ Ấm" width={140} height={34} />
            <p className="mt-3 text-sm text-stone-500 max-w-md">
              Nền tảng công nghệ kết nối người thuê và chủ nhà trọ tại Việt Nam, minh bạch về giá cả, hợp đồng điện tử và số hóa tiền điện nước.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-3">Khám phá</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rooms" className="hover:text-teal-700">{t('rooms')}</Link></li>
              <li><Link href="/landlord" className="hover:text-teal-700">{t('postRoom')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-3">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-teal-700">{t('login')}</Link></li>
              <li><Link href="/register" className="hover:text-teal-700">{t('register')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-100 pt-6 text-center text-xs text-stone-400">
          <p>© 2026 Tổ Ấm. Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

