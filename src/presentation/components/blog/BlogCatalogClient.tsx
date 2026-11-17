'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  ShieldAlert,
  Scale,
  Sparkles,
  Calendar,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CmsArticleDto } from '@/application/dto/listing.dto';
import { MEDIA_MANIFEST } from '@/shared/media-manifest';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Badge } from '@/presentation/components/ui/Badge';
import { Card } from '@/presentation/components/ui/Card';

const GUIDE_PHOTO_MAP: Record<string, string> = {
  'hop-dong-thue-nha-nhung-dieu-can-biet': 'contract',
  'minh-bach-chi-phi-dien-nuoc': 'utility',
  'kinh-nghiem-nhan-phong-kiem-tra-co-so-vat-chat': 'inspection',
};

interface BlogCatalogClientProps {
  initialArticles: CmsArticleDto[];
}

export function BlogCatalogClient({ initialArticles }: BlogCatalogClientProps) {
  const t = useTranslations('blog');
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const getArticleImage = (article: CmsArticleDto) => {
    const key = GUIDE_PHOTO_MAP[article.slug];
    if (key && MEDIA_MANIFEST['guides']?.[key]) {
      return {
        src: MEDIA_MANIFEST['guides'][key].webp1080,
        blurDataURL: MEDIA_MANIFEST['guides'][key].blurDataURL,
        alt: locale === 'vi' ? MEDIA_MANIFEST['guides'][key].altVi : MEDIA_MANIFEST['guides'][key].altEn,
      };
    }
    return {
      src: article.imageUrl || '/images/guides/guide-contract-1080.webp',
      blurDataURL: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADQAQCdASoQAAsABUB8JaQAAudlGbK1YAD+9DCHN3HR8YNuOT84XfNniYTN0GAA',
      alt: locale === 'vi' ? article.imageAltVi || article.titleVi : article.imageAltEn || article.titleEn,
    };
  };

  const categories = [
    { key: 'ALL', label: t('allCategories') },
    { key: 'GUIDE', label: t('catGuide'), icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'LEGAL', label: t('catLegal'), icon: <Scale className="w-3.5 h-3.5" /> },
    { key: 'SECURITY', label: t('catSecurity'), icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { key: 'EXPERIENCE', label: t('catExperience'), icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const title = locale === 'vi' ? article.titleVi : (article.titleEn || article.titleVi);
      const summary = locale === 'vi' ? article.summaryVi : (article.summaryEn || article.summaryVi);

      const matchesCategory =
        selectedCategory === 'ALL' ||
        article.category.toUpperCase() === selectedCategory.toUpperCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        summary.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [initialArticles, selectedCategory, searchQuery, locale]);

  const featuredArticle = initialArticles[0];
  const regularArticles = filteredArticles.filter(
    (a) => selectedCategory !== 'ALL' || searchQuery.trim() !== '' || a.id !== featuredArticle?.id
  );

  const getCategoryLabel = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'LEGAL':
        return t('catLegal');
      case 'SECURITY':
        return t('catSecurity');
      case 'EXPERIENCE':
        return t('catExperience');
      default:
        return t('catGuide');
    }
  };

  const getCategoryVariant = (cat: string): 'primary' | 'success' | 'warning' | 'info' | 'neutral' => {
    switch (cat.toUpperCase()) {
      case 'SECURITY':
        return 'warning';
      case 'LEGAL':
        return 'info';
      case 'EXPERIENCE':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950/40">
      {/* 1. Header & Hero Section */}
      <section className="border-b border-stone-200/70 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-12 space-y-6">
          <Breadcrumb items={[{ label: t('title') }]} />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('badge')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
                {t('title')}
              </h1>
              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
                {t('description')}
              </p>
            </div>

            {/* Live Search Input */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-400 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 rounded-full"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs font-semibold'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-teal-400 dark:hover:border-teal-700'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-10 sm:py-14 space-y-12">
        {/* Featured Article Banner (Only on default view) */}
        {selectedCategory === 'ALL' && !searchQuery.trim() && featuredArticle && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              <Sparkles className="w-4 h-4" />
              <span>{t('featuredBadge')}</span>
            </div>

            {(() => {
              const image = getArticleImage(featuredArticle);
              const title = locale === 'vi' ? featuredArticle.titleVi : (featuredArticle.titleEn || featuredArticle.titleVi);
              const summary = locale === 'vi' ? featuredArticle.summaryVi : (featuredArticle.summaryEn || featuredArticle.summaryVi);

              return (
                <Card className="overflow-hidden border-stone-200/80 dark:border-stone-800 hover:shadow-xl transition-all duration-300 group">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    <div className="lg:col-span-7 relative aspect-16/10 lg:aspect-auto overflow-hidden bg-stone-100 dark:bg-stone-900">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        placeholder="blur"
                        blurDataURL={image.blurDataURL}
                        className="object-cover object-center group-hover:scale-103 transition-transform duration-700"
                        priority
                      />
                    </div>
                    <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={getCategoryVariant(featuredArticle.category)}>
                            {getCategoryLabel(featuredArticle.category)}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                            <Clock className="w-3.5 h-3.5" />
                            {featuredArticle.readingMinutes} {t('minutesRead')}
                          </span>
                        </div>

                        <Link href={`/blog/${featuredArticle.slug}`}>
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug">
                            {title}
                          </h2>
                        </Link>

                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-4">
                          {summary}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <div className="text-xs text-stone-400 dark:text-stone-500">
                          {t('author')}
                        </div>
                        <Link
                          href={`/blog/${featuredArticle.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs group-hover:translate-x-0.5"
                        >
                          <span>{t('readNow')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })()}
          </section>
        )}

        {/* Regular Articles Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>{selectedCategory === 'ALL' ? 'Tất cả bài viết cẩm nang' : getCategoryLabel(selectedCategory)}</span>
              <span className="text-xs font-normal text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full">
                {filteredArticles.length} bài
              </span>
            </h2>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-teal-700 dark:text-teal-400 hover:underline"
              >
                {t('clearFilter')}
              </button>
            )}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                <BookOpen className="w-7 h-7" />
              </div>
              <p className="text-stone-600 dark:text-stone-300 text-sm font-medium">
                {t('noArticles')}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
              >
                {t('clearFilter')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {regularArticles.map((article) => {
                const image = getArticleImage(article);
                const title = locale === 'vi' ? article.titleVi : (article.titleEn || article.titleVi);
                const summary = locale === 'vi' ? article.summaryVi : (article.summaryEn || article.summaryVi);

                return (
                  <article
                    key={article.id}
                    className="group bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview */}
                      <Link href={`/blog/${article.slug}`} className="block relative aspect-16/10 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          placeholder="blur"
                          blurDataURL={image.blurDataURL}
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant={getCategoryVariant(article.category)} className="shadow-xs backdrop-blur-sm bg-opacity-90">
                            {getCategoryLabel(article.category)}
                          </Badge>
                        </div>
                      </Link>

                      {/* Content Card */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {article.readingMinutes} {t('minutesRead')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(article.publishedAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <Link href={`/blog/${article.slug}`}>
                          <h3 className="text-base font-bold text-stone-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                            {title}
                          </h3>
                        </Link>

                        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                          {summary}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="p-5 pt-0">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors"
                      >
                        <span>{t('readMore')}</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. Safety Notice & Report Card */}
        <section className="p-6 sm:p-8 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-amber-950 dark:text-amber-100">
                {t('safetyNoticeTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 max-w-2xl leading-relaxed">
                {t('safetyNoticeDesc')}
              </p>
            </div>
          </div>
          <Link
            href="/support"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            {t('safetyNoticeButton')}
          </Link>
        </section>

        {/* 4. Bottom Call To Action Banner */}
        <section className="p-8 sm:p-12 rounded-3xl bg-teal-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
          <div className="space-y-3 z-10 max-w-2xl">
            <span className="text-teal-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Tổ Ấm Cam Kết Chất Lượng
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('ctaTitle')}
            </h2>
            <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
              {t('ctaDesc')}
            </p>
          </div>

          <div className="z-10 shrink-0">
            <Link
              href="/phong-tro"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 text-sm font-bold shadow-md hover:scale-102 transition-transform"
            >
              <span>{t('ctaButton')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-teal-800/40 pointer-events-none blur-2xl" />
        </section>
      </main>
    </div>
  );
}
