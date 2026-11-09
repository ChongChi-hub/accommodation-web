import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { RoomsCatalogClient } from '@/presentation/components/rooms/RoomsCatalogClient';
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
      <RoomsCatalogClient categoryKey="nhaNguyenCan" />
    </Suspense>
  );
}

