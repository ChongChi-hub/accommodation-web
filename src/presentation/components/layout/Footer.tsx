'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldCheck, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const tAuto = useTranslations('autoI18n');
  const tNav = useTranslations('nav');
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image src="/logo.svg" alt="CozyNest" width={130} height={30} style={{ width: 'auto', height: 'auto' }} />
            </Link>
            <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-800 dark:text-teal-400 font-medium">
              <ShieldCheck size={16} />
              <span>{t('verifiedBadge')}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3">
              {t('exploreTitle')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/rooms" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {tNav('rooms')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link href="/safety-guide" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {t('safetyGuide')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3">
              {t('infoTitle')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3">
              {t('contactTitle')}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-500 dark:text-stone-400">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-teal-700 dark:text-teal-400 shrink-0" />
                <span>{t('address')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-teal-700 dark:text-teal-400 shrink-0" />
                <Link href="/contact" className="hover:text-teal-700 dark:hover:text-teal-400">
                  {tAuto('k0538')}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-teal-700 dark:text-teal-400 shrink-0" />
                <span>{t('phone')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-200 dark:border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()}{' '}{tAuto('k0539')}{' '}{t('allRightsReserved')}</p>
          <div className="flex items-center gap-4">
            <Link
              href="/about#licenses"
              className="text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-1"
            >
              <span>{t('photoLicenses')}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span>•</span>
            <p>{t('motto')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
