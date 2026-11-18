import React from 'react';
import { Metadata } from 'next';
import { BlogCatalogClient } from '@/presentation/components/blog/BlogCatalogClient';
import { CmsArticleDto } from '@/application/dto/listing.dto';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi';

  const title = isVi
    ? 'Cẩm nang thuê phòng & Kinh nghiệm sống - Tổ Ấm'
    : 'Rental Handbook & Living Insights - Cozynest';
  const description = isVi
    ? 'Tổng hợp kiến thức pháp lý hợp đồng, kinh nghiệm kiểm tra phòng trọ, biểu giá điện nước và phòng chống lừa đảo từ ban biên tập Tổ Ấm.'
    : 'Comprehensive legal lease guides, practical inspection tips, transparent utility pricing, and scam protection by Cozynest.';

  return {
    title,
    description,
    alternates: {
      canonical: isVi ? '/blog' : '/en/blog',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: '/images/guides/guide-contract-1080.webp',
          width: 1080,
          height: 720,
          alt: isVi ? 'Cẩm nang thuê phòng trọ an toàn Tổ Ấm' : 'Cozynest Safe Rental Guide',
        },
      ],
    },
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  let articles: CmsArticleDto[] = [];

  try {
    const rawApiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080/api/v1';

    const res = await fetch(`${rawApiUrl}/cms/articles`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const json = await res.json();
      articles = json.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch blog articles on server:', error);
  }

  return <BlogCatalogClient initialArticles={articles} />;
}

