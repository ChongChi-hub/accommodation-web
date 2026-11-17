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
                <Link href="/blog" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {tNav('blog')}
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
                <Link href="/regulations" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {t('regulations')}
                </Link>
              </li>
              <li>
                <Link href="/dispute-resolution" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                  {t('disputeResolution')}
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

        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <p className="font-semibold text-stone-700 dark:text-stone-300">{t('companyName')}</p>
            <p>{t('taxCode')} • {t('representedBy')}</p>
            <p>{t('headquarters')}</p>
          </div>
          <div className="shrink-0">
            <a
              href="http://online.gov.vn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('moitRegistered')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:border-red-400 transition"
            >
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                ★
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">{t('moitRegistered')}</span>
                <span className="text-[9px] text-stone-500 dark:text-stone-400 mt-0.5">online.gov.vn</span>
              </div>
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-stone-200 dark:border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
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
