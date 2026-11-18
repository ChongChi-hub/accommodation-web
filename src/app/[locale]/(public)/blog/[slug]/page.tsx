import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogDetailClientView } from '@/presentation/components/blog/BlogDetailClientView';
import { CmsArticleDto } from '@/application/dto/listing.dto';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const isVi = locale === 'vi';

  try {
    const rawApiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080/api/v1';

    const res = await fetch(`${rawApiUrl}/cms/articles/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return {
        title: isVi ? 'Cẩm nang thuê phòng - Tổ Ấm' : 'Rental Guide - Cozynest',
      };
    }

    const json = await res.json();
    const article: CmsArticleDto = json.data;
    if (!article) {
      return {
        title: isVi ? 'Cẩm nang thuê phòng - Tổ Ấm' : 'Rental Guide - Cozynest',
      };
    }

    const title = isVi ? article.titleVi : (article.titleEn || article.titleVi);
    const summary = isVi ? article.summaryVi : (article.summaryEn || article.summaryVi);
    const coverImage = article.imageUrl || '/images/guides/guide-contract-1080.webp';

    return {
      title: `${title} - Cẩm nang Tổ Ấm`,
      description: summary.slice(0, 160),
      alternates: {
        canonical: isVi ? `/blog/${slug}` : `/en/blog/${slug}`,
      },
      openGraph: {
        title: `${title} - Cẩm nang Tổ Ấm`,
        description: summary.slice(0, 160),
        type: 'article',
        publishedTime: article.publishedAt,
        images: [
          {
            url: coverImage,
            alt: title,
          },
        ],
      },
    };
  } catch {
    return {
      title: isVi ? 'Cẩm nang thuê phòng - Tổ Ấm' : 'Rental Guide - Cozynest',
    };
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let article: CmsArticleDto | null = null;
  let allArticles: CmsArticleDto[] = [];

  try {
    const rawApiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080/api/v1';

    const [articleRes, listRes] = await Promise.all([
      fetch(`${rawApiUrl}/cms/articles/${encodeURIComponent(slug)}`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(3000),
      }),
      fetch(`${rawApiUrl}/cms/articles`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(3000),
      }),
    ]);

    if (articleRes.ok) {
      const json = await articleRes.json();
      article = json.data || null;
    }

    if (listRes.ok) {
      const listJson = await listRes.json();
      allArticles = listJson.data || [];
    }
  } catch (error) {
    console.error('Failed to load blog article detail:', error);
  }

  if (!article) {
    notFound();
  }

  const relatedArticles = allArticles.filter((a) => a.slug !== article?.slug);

  return <BlogDetailClientView article={article} relatedArticles={relatedArticles} />;
}

