'use client';

import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { Camera, Trash2, Upload, AlertCircle } from 'lucide-react';

interface AvatarManagerProps {
  currentAvatarUrl: string | null;
  name: string;
  onAvatarChanged: (newUrl: string | null) => void;
}

export function AvatarManager({ currentAvatarUrl, name, onAvatarChanged }: AvatarManagerProps) {
  const t = useTranslations('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('avatarDesc'));
      return;
    }
    const valid = ['image/jpeg', 'image/png', 'image/webp'];
    if (!valid.includes(file.type)) {
      toast.error(t('avatarDesc'));
      return;
    }

    setIsUploading(true);
    try {
      const res = await container.profile.profileUseCases.uploadAvatar(file);
      useAuthStore.getState().updateUser({ avatarUrl: res.avatarUrl });
      onAvatarChanged(res.avatarUrl);
      toast.success(t('saveSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error uploading avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    setIsUploading(true);
    try {
      await container.profile.profileUseCases.deleteAvatar();
      useAuthStore.getState().updateUser({ avatarUrl: null });
      onAvatarChanged(null);
      setShowDeleteConfirm(false);
      toast.success(t('saveSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error deleting avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-card border border-border">
      <div
        className={`relative group cursor-pointer rounded-full transition-all ${
          dragOver ? 'ring-4 ring-primary/40' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar src={currentAvatarUrl || undefined} name={name} size="xl" className="w-24 h-24 ring-2 ring-border" />
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <div className="space-y-2 text-center sm:text-left flex-1">
        <h3 className="text-sm font-semibold text-foreground">{t('avatarTitle')}</h3>
        <p className="text-xs text-foreground-muted">{t('avatarDesc')}</p>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={isUploading}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('uploadAvatar')}
          </Button>
          {currentAvatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-danger hover:text-danger hover:bg-danger/10"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              {t('deleteAvatar')}
            </Button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-warning">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium text-foreground">{t('deleteAvatarConfirm')}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                {t('close')}
              </Button>
              <Button variant="danger" size="sm" isLoading={isUploading} onClick={handleDelete}>
                {t('deleteAvatar')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

