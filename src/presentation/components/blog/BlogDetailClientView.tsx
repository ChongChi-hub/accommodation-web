'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Clock,
  Calendar,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  ListOrdered,
  Sparkles,
  Scale,
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

interface BlogDetailClientViewProps {
  article: CmsArticleDto;
  relatedArticles: CmsArticleDto[];
}

interface SectionHeading {
  id: string;
  title: string;
}

export function BlogDetailClientView({ article, relatedArticles }: BlogDetailClientViewProps) {
  const t = useTranslations('blog');
  const locale = useLocale();

  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  const isVi = locale === 'vi';
  const title = isVi ? article.titleVi : (article.titleEn || article.titleVi);
  const summary = isVi ? article.summaryVi : (article.summaryEn || article.summaryVi);
  const content = isVi ? article.contentVi : (article.contentEn || article.contentVi);

  // Parse markdown headings (## Heading) to build Table of Contents
  const { headings, parsedSections } = useMemo(() => {
    if (!content) return { headings: [], parsedSections: [] };

    const lines = content.split('\n');
    const hList: SectionHeading[] = [];
    const sections: Array<{ id: string; heading?: string; paragraphs: string[] }> = [];

    let currentSection: { id: string; heading?: string; paragraphs: string[] } = {
      id: 'intro',
      paragraphs: [],
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        if (currentSection.paragraphs.length > 0 || currentSection.heading) {
          sections.push(currentSection);
        }
        const hText = trimmed.replace(/^##\s+/, '').trim();
        const hId = 'sec-' + Math.abs(hText.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)).toString(36);
        hList.push({ id: hId, title: hText });
        currentSection = {
          id: hId,
          heading: hText,
          paragraphs: [],
        };
      } else if (trimmed.length > 0) {
        currentSection.paragraphs.push(trimmed);
      }
    });

    if (currentSection.paragraphs.length > 0 || currentSection.heading) {
      sections.push(currentSection);
    }

    return { headings: hList, parsedSections: sections };
  }, [content]);

  // Track active section on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary,
          url: window.location.href,
        });
      } catch {
        // Ignored if user cancels share
      }
    } else {
      handleCopyLink();
    }
  };

  const getArticleImage = (art: CmsArticleDto) => {
    const key = GUIDE_PHOTO_MAP[art.slug];
    if (key && MEDIA_MANIFEST['guides']?.[key]) {
      return {
        src: MEDIA_MANIFEST['guides'][key].webp1080,
        blurDataURL: MEDIA_MANIFEST['guides'][key].blurDataURL,
        alt: isVi ? MEDIA_MANIFEST['guides'][key].altVi : MEDIA_MANIFEST['guides'][key].altEn,
        author: MEDIA_MANIFEST['guides'][key].author,
        license: MEDIA_MANIFEST['guides'][key].license,
      };
    }
    return {
      src: art.imageUrl || '/images/guides/guide-contract-1080.webp',
      blurDataURL: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADQAQCdASoQAAsABUB8JaQAAudlGbK1YAD+9DCHN3HR8YNuOT84XfNniYTN0GAA',
      alt: isVi ? art.imageAltVi || art.titleVi : art.imageAltEn || art.titleEn,
      author: 'Cozynest Studio',
      license: 'Cozynest Media',
    };
  };

  const heroImage = getArticleImage(article);

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
      {/* 1. Header Toolbar & Breadcrumb */}
      <div className="border-b border-stone-200/70 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-3.5 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-teal-700 dark:hover:text-teal-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToBlog')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-teal-500 transition shadow-2xs"
              title={t('copyLink')}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{t('copiedLink')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('copyLink')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white transition shadow-2xs"
              title={t('share')}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('share')}</span>
            </button>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-8 sm:py-12 space-y-10">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: t('title'), href: '/blog' },
            { label: title },
          ]}
        />

        {/* Article Header */}
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={getCategoryVariant(article.category)} size="md">
              {getCategoryLabel(article.category)}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <Clock className="w-3.5 h-3.5" />
              {article.readingMinutes} {t('minutesRead')}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.publishedAt).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
            {title}
          </h1>

          {/* Author Byline */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 flex items-center justify-center text-teal-800 dark:text-teal-300 font-bold text-sm shrink-0">
              TN
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>{t('author')}</span>
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {t('authorRole')}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Cover Image */}
        <div className="relative aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-900 shadow-md border border-stone-200/80 dark:border-stone-800">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            placeholder="blur"
            blurDataURL={heroImage.blurDataURL}
            className="object-cover object-center"
            priority
          />
          <div className="absolute bottom-2.5 right-3 bg-stone-950/60 backdrop-blur-xs text-white/80 text-[10px] px-2 py-0.5 rounded-md pointer-events-none">
            Ảnh: {heroImage.author} • {heroImage.license}
          </div>
        </div>

        {/* Executive Summary Callout */}
        <div className="p-5 sm:p-6 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border-l-4 border-teal-600 dark:border-teal-400 text-stone-800 dark:text-stone-200 space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Tóm tắt nội dung cẩm nang
          </div>
          <p className="text-xs sm:text-sm leading-relaxed font-medium">
            {summary}
          </p>
        </div>

        {/* Main Article Body Layout (Content + Table of Contents Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Full Content */}
          <div className="lg:col-span-8 space-y-8">
            {parsedSections.map((sec, idx) => (
              <section key={sec.id || idx} id={sec.id} className="scroll-mt-24 space-y-4">
                {sec.heading && (
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-900">
                    <span className="text-teal-700 dark:text-teal-400 font-extrabold text-lg">#</span>
                    <span>{sec.heading}</span>
                  </h2>
                )}

                <div className="space-y-3.5 text-stone-700 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
                  {sec.paragraphs.map((p, pIdx) => {
                    if (p.startsWith('- ')) {
                      return (
                        <div key={pIdx} className="flex items-start gap-2.5 pl-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 mt-2 shrink-0" />
                          <span className="text-stone-700 dark:text-stone-300">{p.replace(/^-\s+/, '')}</span>
                        </div>
                      );
                    }
                    return (
                      <p key={pIdx} className="leading-relaxed">
                        {p}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Disclaimer & Verification Tag */}
            <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              <strong>Lưu ý từ ban biên tập:</strong> Cẩm nang mang tính chất chia sẻ kinh nghiệm và hướng dẫn pháp lý căn bản. Khi có phát sinh tranh chấp phức tạp hoặc nghi vấn vi phạm pháp luật hình sự, người thuê nên liên hệ Công an địa phương hoặc luật sư tư vấn độc lập để được trợ giúp.
            </div>
          </div>

          {/* Right Column: Sticky Table of Contents & Quick Support */}
          <aside className="lg:col-span-4 space-y-6">
            {headings.length > 0 && (
              <div className="sticky top-20 space-y-6">
                <Card className="p-5 space-y-3.5 border-stone-200/80 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <ListOrdered className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <span>{t('tableOfContents')}</span>
                  </div>

                  <nav className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                    {headings.map((h) => {
                      const isActive = activeSection === h.id;
                      return (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          className={`block py-1.5 px-2.5 rounded-lg text-xs leading-snug transition-colors ${
                            isActive
                              ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-semibold border-l-2 border-teal-600'
                              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100/70 dark:hover:bg-stone-900/70'
                          }`}
                        >
                          {h.title}
                        </a>
                      );
                    })}
                  </nav>
                </Card>

                {/* Emergency Scam Hotline Card */}
                <Card className="p-5 space-y-3 bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Cần trợ giúp khẩn cấp?</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Đội ngũ Hỗ trợ & Tiếp nhận Khiếu nại Tổ Ấm sẵn sàng can thiệp khi bạn gặp hành vi đòi tiền cọc sai quy định hoặc tin đăng ảo.
                  </p>
                  <Link
                    href="/support"
                    className="inline-flex items-center justify-center w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
                  >
                    Gửi yêu cầu hỗ trợ ngay
                  </Link>
                </Card>
              </div>
            )}
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="pt-10 border-t border-stone-200/80 dark:border-stone-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {t('relatedArticles')}
              </h3>
              <Link
                href="/blog"
                className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>{t('backToBlog')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((rel) => {
                const relImg = getArticleImage(rel);
                const relTitle = isVi ? rel.titleVi : (rel.titleEn || rel.titleVi);
                const relSummary = isVi ? rel.summaryVi : (rel.summaryEn || rel.summaryVi);

                return (
                  <article
                    key={rel.id}
                    className="group bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <Link href={`/blog/${rel.slug}`} className="block relative aspect-16/10 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                        <Image
                          src={relImg.src}
                          alt={relImg.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          placeholder="blur"
                          blurDataURL={relImg.blurDataURL}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          <Clock className="w-3 h-3" />
                          <span>{rel.readingMinutes} {t('minutesRead')}</span>
                        </div>
                        <Link href={`/blog/${rel.slug}`}>
                          <h4 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                            {relTitle}
                          </h4>
                        </Link>
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {relSummary}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link
                        href={`/blog/${rel.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400"
                      >
                        <span>{t('readMore')}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
