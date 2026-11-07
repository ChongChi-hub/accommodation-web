'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { toast } from '@/presentation/stores/toast.store';
import { AvatarManager } from './AvatarManager';
import { UserProfileForm } from './UserProfileForm';
import { UserChangePasswordView } from './UserChangePasswordView';
import { UserProfile, UpdateUserProfileDto } from '@/domain/entities/UserProfile';
import { ProvinceDto, WardDto } from '@/application/dto/listing.dto';
import { RefreshCw, AlertCircle } from 'lucide-react';

export interface UserProfileViewProps {
  role: 'TENANT' | 'LANDLORD' | 'ADMIN' | 'MODERATOR';
}

export function UserProfileView({ role }: UserProfileViewProps) {
  const t = useTranslations('profile');
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setHasConflict(false);
    try {
      const [prof, provs] = await Promise.all([
        container.profile.profileUseCases.getProfile(),
        container.listing.getLocationsUseCase.getProvinces(),
      ]);
      setProfile(prof);
      setProvinces(provs);
      if (prof.addressProvinceCode) {
        const w = await container.listing.getLocationsUseCase.getWards(prof.addressProvinceCode);
        setWards(w);
      }
    } catch {
      toast.error('Loi tai ho so ca nhan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProvinceChange = async (newCode: string) => {
    if (!newCode) {
      setWards([]);
      return;
    }
    try {
      const w = await container.listing.getLocationsUseCase.getWards(newCode);
      setWards(w);
    } catch {
      setWards([]);
    }
  };

  const handleSave = async (dto: UpdateUserProfileDto) => {
    setIsSaving(true);
    try {
      const updated = await container.profile.profileUseCases.updateProfile(dto);
      setProfile(updated);
      updateUser({
        fullName: updated.fullName,
        phone: updated.phone,
        avatarUrl: updated.avatarUrl,
      });
      toast.success(t('saveSuccess'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('409') || msg.includes('conflict') || msg.includes('phien ban')) {
        setHasConflict(true);
      } else {
        toast.error(msg || 'Loi cap nhat ho so');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const roleVariant = role === 'ADMIN' ? 'danger' : role === 'MODERATOR' ? 'warning' : 'primary';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-xs text-foreground-muted mt-1">{t('subtitle')}</p>
        </div>
        <Badge variant={roleVariant}>{role}</Badge>
      </div>

      <div className="flex border-b border-border gap-6 text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`pb-2.5 transition-colors border-b-2 -mb-px ${
            activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-foreground-muted'
          }`}
        >
          {t('personalTab')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`pb-2.5 transition-colors border-b-2 -mb-px ${
            activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-foreground-muted'
          }`}
        >
          {t('securityTab')}
        </button>
      </div>

      {activeTab === 'security' ? (
        <UserChangePasswordView />
      ) : (
        <div className="space-y-6">
          <AvatarManager
            currentAvatarUrl={profile?.avatarUrl || user?.avatarUrl || null}
            name={profile?.fullName || user?.fullName || 'User'}
            onAvatarChanged={(url) => setProfile((prev) => (prev ? { ...prev, avatarUrl: url } : null))}
          />

          {hasConflict && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-danger text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{t('saveConflict')}</span>
              </div>
              <Button size="sm" variant="outline" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={loadData}>
                {t('reload')}
              </Button>
            </div>
          )}

          {!isLoading && (
            <UserProfileForm
              profile={profile}
              email={profile?.email || user?.email || ''}
              provinces={provinces}
              wards={wards}
              onProvinceChange={handleProvinceChange}
              onSave={handleSave}
              isSaving={isSaving}
            />
          )}
        </div>
      )}
    </div>
  );
}
