import React, { Suspense } from 'react';
import { RoomsCatalogClient } from '@/presentation/components/rooms/RoomsCatalogClient';

export default function RoomsPage() {
  return (
    <Suspense fallback={null}>
      <RoomsCatalogClient />
    </Suspense>
  );
}
