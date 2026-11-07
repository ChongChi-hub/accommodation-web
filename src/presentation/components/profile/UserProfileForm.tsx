'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { ProvinceDto, WardDto } from '@/application/dto/listing.dto';
import { UserProfile, UpdateUserProfileDto } from '@/domain/entities/UserProfile';
import { User as UserIcon, Mail, Phone, Save, Calendar } from 'lucide-react';

interface UserProfileFormProps {
  profile: UserProfile | null;
  email: string;
  provinces: ProvinceDto[];
  wards: WardDto[];
  onProvinceChange: (code: string) => Promise<void>;
  onSave: (dto: UpdateUserProfileDto) => Promise<void>;
  isSaving: boolean;
}

export function UserProfileForm({
  profile,
  email,
  provinces,
  wards,
  onProvinceChange,
  onSave,
  isSaving,
}: UserProfileFormProps) {
  const t = useTranslations('profile');
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [provinceCode, setProvinceCode] = useState(profile?.addressProvinceCode || '');
  const [wardCode, setWardCode] = useState(profile?.addressWardCode || '');
  const [addressDetail, setAddressDetail] = useState(profile?.addressDetail || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName: fullName.trim(),
      phone: phone.trim(),
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      bio: bio.trim() || null,
      addressProvinceCode: provinceCode || null,
      addressWardCode: wardCode || null,
      addressDetail: addressDetail.trim() || null,
      version: profile?.version || 0,
    });
  };

  return (
    <Card className="p-6 border border-border">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('fullNamePlaceholder')}
            required
            leftIcon={<UserIcon className="w-4 h-4 text-foreground-muted" />}
          />
          <Input
            label={t('phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('phonePlaceholder')}
            required
            leftIcon={<Phone className="w-4 h-4 text-foreground-muted" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={t('email')}
            type="email"
            value={email}
            disabled
            helperText={t('emailHelper')}
            leftIcon={<Mail className="w-4 h-4 text-foreground-muted" />}
          />
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">{t('gender')}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full text-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            >
              <option value="">{t('genderSelect')}</option>
              <option value="MALE">{t('genderMale')}</option>
              <option value="FEMALE">{t('genderFemale')}</option>
              <option value="OTHER">{t('genderOther')}</option>
            </select>
          </div>
          <Input
            label={t('dateOfBirth')}
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">{t('province')}</label>
            <select
              value={provinceCode}
              onChange={(e) => {
                setProvinceCode(e.target.value);
                setWardCode('');
                onProvinceChange(e.target.value);
              }}
              className="w-full text-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            >
              <option value="">{t('provinceSelect')}</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">{t('ward')}</label>
            <select
              value={wardCode}
              disabled={!provinceCode}
              onChange={(e) => setWardCode(e.target.value)}
              className="w-full text-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground disabled:opacity-50"
            >
              <option value="">{t('wardSelect')}</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label={t('addressDetail')}
          value={addressDetail}
          onChange={(e) => setAddressDetail(e.target.value)}
          placeholder={t('addressDetailPlaceholder')}
        />

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t('bio')}</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t('bioPlaceholder')}
            className="w-full text-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground resize-none"
          />
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="text-[11px] text-foreground-muted flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {t('memberSince')}: {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2026'}
            </span>
          </div>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            {t('saveChanges')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

