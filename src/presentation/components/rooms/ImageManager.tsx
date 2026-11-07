'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ImageCard, ManagedImage } from './ImageCard';
import { Button } from '@/presentation/components/ui/Button';
import { UploadCloud, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/presentation/stores/toast.store';

const MAX_IMAGES = 10;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  initialImages?: ManagedImage[];
  onChange?: (images: ManagedImage[]) => void;
  onUploadAsync?: (files: File[]) => Promise<void>;
  onSetCoverAsync?: (id: number) => Promise<void>;
  onDeleteAsync?: (id: number) => Promise<void>;
  onReorderAsync?: (images: ManagedImage[]) => Promise<void>;
  disabled?: boolean;
}

export function ImageManager({
  initialImages = [],
  onChange,
  onUploadAsync,
  onSetCoverAsync,
  onDeleteAsync,
  onReorderAsync,
  disabled = false,
}: Props) {
  const t = useTranslations('landlord.images');
  const [images, setImages] = useState<ManagedImage[]>(initialImages);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // Sync external changes
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls.clear();
    };
  }, []);

  const updateImagesState = useCallback(
    (newImages: ManagedImage[]) => {
      // Ensure exactly 1 cover if images exist
      const hasCover = newImages.some((img) => img.isCover && !img.error);
      const normalized = newImages.map((img, idx) => ({
        ...img,
        sortOrder: idx + 1,
        isCover: hasCover ? img.isCover : idx === 0,
      }));
      setImages(normalized);
      onChange?.(normalized);
      return normalized;
    },
    [onChange]
  );

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(t('validation.maxLimit'));
      return;
    }

    const validFiles: File[] = [];
    const newItems: ManagedImage[] = [];

    for (const file of files) {
      let error: string | undefined;

      if (!ALLOWED_TYPES.includes(file.type)) {
        error = t('validation.invalidType');
      } else if (file.size > MAX_BYTES) {
        error = t('validation.tooLarge');
      }

      const localUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(localUrl);

      const newItem: ManagedImage = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: localUrl,
        file,
        isCover: images.length === 0 && newItems.length === 0,
        sortOrder: images.length + newItems.length + 1,
        name: file.name,
        sizeBytes: file.size,
        error,
      };

      newItems.push(newItem);
      if (!error) validFiles.push(file);
    }

    if (onUploadAsync && validFiles.length > 0) {
      setIsProcessing(true);
      try {
        await onUploadAsync(validFiles);
      } finally {
        setIsProcessing(false);
      }
    } else {
      updateImagesState([...images, ...newItems]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isProcessing) return;
    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleSetCover = async (id: string | number) => {
    if (typeof id === 'number' && onSetCoverAsync) {
      await onSetCoverAsync(id);
      return;
    }
    const updated = images.map((img) => ({
      ...img,
      isCover: img.id === id,
    }));
    updateImagesState(updated);
  };

  const handleMove = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= images.length) return;
    const cloned = [...images];
    const [moved] = cloned.splice(fromIdx, 1);
    cloned.splice(toIdx, 0, moved);
    const updated = updateImagesState(cloned);

    if (onReorderAsync) {
      await onReorderAsync(updated);
    }
  };

  const handleDelete = async (id: string | number) => {
    const toDelete = images.find((img) => img.id === id);
    if (toDelete && objectUrlsRef.current.has(toDelete.url)) {
      URL.revokeObjectURL(toDelete.url);
      objectUrlsRef.current.delete(toDelete.url);
    }

    if (typeof id === 'number' && onDeleteAsync) {
      await onDeleteAsync(id);
      return;
    }

    const filtered = images.filter((img) => img.id !== id);
    updateImagesState(filtered);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragging
            ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 scale-[0.99]'
            : 'border-stone-300 dark:border-stone-700 bg-stone-50/40 dark:bg-stone-900/30 hover:border-teal-600 hover:bg-teal-50/20'
        } ${disabled || isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled || isProcessing}
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-2.5">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
          {t('dropTitle')}
        </p>
        <p className="text-xs text-stone-500 mt-1 max-w-md">
          {t('dropSubtitle')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 pointer-events-none"
        >
          {t('selectBtn')}
        </Button>
      </div>

      {/* Info Notice */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>{t('minImagesNotice')}</span>
        <span>
          {images.length}/{MAX_IMAGES} ảnh
        </span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
          {images.map((img, idx) => (
            <ImageCard
              key={img.id}
              image={img}
              index={idx}
              total={images.length}
              onSetCover={handleSetCover}
              onMove={handleMove}
              onDelete={handleDelete}
              disabled={disabled || isProcessing}
            />
          ))}
        </div>
      )}
    </div>
  );
}
