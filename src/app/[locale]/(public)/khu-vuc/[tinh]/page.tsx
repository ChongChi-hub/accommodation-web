import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { container } from '@/infrastructure/di/container';
import { ProvinceCatalogClient } from '@/presentation/components/rooms/ProvinceCatalogClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tinh: string }>;
}): Promise<Metadata> {
  const { tinh } = await params;
  const hotAreas = await container.listing.listingRepository.getHotAreas(20, false).catch(() => []);
  const area = hotAreas.find(
    (a) => a.slug === tinh || a.code.toLowerCase() === tinh.toLowerCase()
  );

  const name = area ? area.name : tinh;
  return {
    title: `Thuê phòng trọ, căn hộ tại ${name} | CozyNest`,
    description: `Danh sách phòng trọ, căn hộ, nhà nguyên căn và ở ghép tại ${name}. Đầy đủ hình ảnh, giá thuê và thông tin xác minh.`,
  };
}

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ locale: string; tinh: string }>;
}) {
  const { tinh } = await params;
  const hotAreas = await container.listing.listingRepository.getHotAreas(20, false).catch(() => []);
  const area = hotAreas.find(
    (a) => a.slug === tinh || a.code.toLowerCase() === tinh.toLowerCase()
  );

  if (!area) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <ProvinceCatalogClient area={area} />
    </Suspense>
  );
}

