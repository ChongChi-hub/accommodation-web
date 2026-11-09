import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { RoomCatalog } from '@/presentation/components/rooms/RoomCatalog';
import { buildCategoryMetadata } from '@/presentation/utils/category-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildCategoryMetadata(locale, 'phongTro');
}

export default function PhongTroPage() {
  return (
    <Suspense fallback={null}>
      <RoomCatalog categoryKey="phongTro" />
    </Suspense>
  );
}
