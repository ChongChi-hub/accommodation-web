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
  return buildCategoryMetadata(locale, 'nhaNguyenCan');
}

export default function NhaNguyenCanPage() {
  return (
    <Suspense fallback={null}>
      <RoomCatalog categoryKey="nhaNguyenCan" />
    </Suspense>
  );
}
