'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { CmsArticleDto } from '@/application/dto/listing.dto';
import { SectionState } from '@/presentation/hooks/useHomePageData';
import { MEDIA_MANIFEST } from '@/shared/media-manifest';
import { Reveal, Stagger } from '@/presentation/components/motion';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Skeleton } from '@/presentation/components/ui/Skeleton';

const GUIDE_PHOTO_MAP: Record<string, string> = {
  'hop-dong-thue-nha-nhung-dieu-can-biet': 'contract',
  'minh-bach-chi-phi-dien-nuoc': 'utility',
  'kinh-nghiem-nhan-phong-kiem-tra-co-so-vat-chat': 'inspection',
};

interface HomeGuidesSectionProps {
  articlesState: SectionState<CmsArticleDto[]>;
  onRetry?: () => void;
}

export function HomeGuidesSection({ articlesState, onRetry }: HomeGuidesSectionProps) {
  const t = useTranslations('guides');
  const locale = useLocale();

  const getGuideAsset = (slug: string) => {
    const key = GUIDE_PHOTO_MAP[slug] || 'contract';
    return MEDIA_MANIFEST['guides']?.[key] || MEDIA_MANIFEST['guides']['contract'];
  };

  return (
    <section className="py-16 md:py-20 bg-stone-50/50 dark:bg-stone-900/40 border-b border-stone-200/60 dark:border-stone-800">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <Reveal variant="fadeUp">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {t('sectionSubtitle')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              {t('sectionTitle')}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t('sectionDescription')}
            </p>
          </Reveal>

          <Link
            href="/safety-guide"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
          >
            <span>{t('viewAllGuides')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {articlesState.error ? (
          <ErrorState
            title={t('errorTitle')}
            message={articlesState.error}
            onRetry={onRetry}
            className="my-6"
          />
        ) : articlesState.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl w-full" />
            ))}
          </div>
        ) : articlesState.data.length === 0 ? (
          <div className="text-center py-12 text-sm text-stone-500">
            {t('noArticles')}
          </div>
        ) : (
          <Reveal variant="fadeUp">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articlesState.data.slice(0, 3).map((article) => {
                const asset = getGuideAsset(article.slug);
                const title = locale === 'vi' ? article.titleVi : (article.titleEn || article.titleVi);
                const summary = locale === 'vi' ? article.summaryVi : (article.summaryEn || article.summaryVi);
                return (
                  <article
                    key={article.id}
                    className="group bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all duration-300 hover-lift flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                        <Image
                          src={asset.webp640}
                          alt={locale === 'vi' ? asset.altVi : asset.altEn}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          placeholder="blur"
                          blurDataURL={asset.blurDataURL}
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {article.readingMinutes} {t('minutesRead')}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-stone-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                          {title}
                        </h3>

                        <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                          {summary}
                        </p>
                      </div>
                    </div>

                    {/* Read Article Link */}
                    <div className="px-5 pb-5 pt-0">
                      <Link
                        href={`/safety-guide#${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors"
                      >
                        {t('readArticle')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </Reveal>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/safety-guide" className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            {t('viewAllGuides')}
          </Link>
        </div>
      </div>
    </section>
  );
}
