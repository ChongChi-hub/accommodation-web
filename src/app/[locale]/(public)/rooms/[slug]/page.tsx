import React from 'react';
import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { RoomDetailClientView } from './RoomDetailClientView';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const rawApiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080/api/v1';

    const res = await fetch(`${rawApiUrl}/rooms/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        title: 'Chi tiết phòng trọ - Tổ Ấm',
      };
    }

    const json = await res.json();
    const room = json.data;
    if (!room) {
      return {
        title: 'Chi tiết phòng trọ - Tổ Ấm',
      };
    }

    const canonicalSlug = room.slug || room.id;
    const coverImage = room.images?.[0]?.imageUrl || room.primaryImageUrl;

    return {
      title: `${room.title} - Thuê phòng trọ Tổ Ấm`,
      description:
        room.description?.slice(0, 160) ||
        `Cho thuê ${room.title} tại ${room.address}. Giá ${room.price} đ/tháng. Đã kiểm duyệt thực tế.`,
      alternates: {
        canonical: `/rooms/${canonicalSlug}`,
      },
      openGraph: {
        title: room.title,
        description: room.description?.slice(0, 160),
        images: coverImage ? [{ url: coverImage, alt: room.title }] : [],
      },
    };
  } catch {
    return {
      title: 'Chi tiết phòng trọ - Tổ Ấm',
    };
  }
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // 1. If user accessed via numeric ID (e.g. /rooms/128), permanent redirect (HTTP 308) to canonical slug
  if (/^\d+$/.test(slug)) {
    try {
      const rawApiUrl =
        process.env.INTERNAL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:8080/api/v1';

      const res = await fetch(`${rawApiUrl}/rooms/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        const room = json.data;
        if (room && room.slug && String(room.slug) !== String(slug)) {
          const targetUrl = locale === 'en' ? `/en/rooms/${room.slug}` : `/rooms/${room.slug}`;
          permanentRedirect(targetUrl);
        }
      }
    } catch (e: any) {
      // Re-throw Next.js redirect exceptions
      if (e?.digest?.startsWith('NEXT_REDIRECT')) {
        throw e;
      }
    }
  }

  return <RoomDetailClientView slug={slug} />;
}
