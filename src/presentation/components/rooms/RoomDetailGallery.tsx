'use client';

import React, { useState } from 'react';

export interface RoomDetailGalleryProps {
  primaryImage: string;
  images: string[];
  title: string;
}

export function RoomDetailGallery({
  primaryImage,
  images,
  title,
}: RoomDetailGalleryProps) {
  const allImages = images.length > 0 ? images : [primaryImage];
  const [activeImage, setActiveImage] = useState(allImages[0]);

  return (
    <div className="space-y-3">
      <div className="aspect-16/9 w-full overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-800">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative aspect-4/3 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                activeImage === img
                  ? 'border-teal-700 ring-2 ring-teal-100 dark:ring-teal-950'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${title} ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

