import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileUseCases } from './profile.use-cases';
import { AuthRepository } from '@/domain/repositories/AuthRepository';
import { UserProfile } from '@/domain/entities/UserProfile';

describe('ProfileUseCases', () => {
  let mockAuthRepo: Partial<AuthRepository>;
  let useCases: ProfileUseCases;

  const sampleProfile: UserProfile = {
    userId: 'u-123',
    email: 'user@toam.vn',
    phone: '0901234567',
    fullName: 'Nguyen Van A',
    avatarUrl: '/avatars/u-123.webp',
    gender: 'MALE',
    dateOfBirth: '1995-05-15',
    bio: 'Xin chao',
    addressProvinceCode: '01',
    addressWardCode: '001',
    addressDetail: '123 Pho Hue',
    roles: ['TENANT'],
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockAuthRepo = {
      getUserProfile: vi.fn().mockResolvedValue(sampleProfile),
      updateUserProfile: vi.fn().mockResolvedValue({ ...sampleProfile, fullName: 'Nguyen Van B', version: 2 }),
      uploadAvatar: vi.fn().mockResolvedValue({ avatarUrl: '/avatars/new.webp' }),
      deleteAvatar: vi.fn().mockResolvedValue(undefined),
      changePassword: vi.fn().mockResolvedValue(undefined),
    };
    useCases = new ProfileUseCases(mockAuthRepo as AuthRepository);
  });

  it('should fetch user profile', async () => {
    const res = await useCases.getProfile();
    expect(res.userId).toBe('u-123');
    expect(mockAuthRepo.getUserProfile).toHaveBeenCalledOnce();
  });

  it('should validate and update user profile', async () => {
    const res = await useCases.updateProfile({
      fullName: 'Nguyen Van B',
      phone: '0912345678',
      version: 1,
    });
    expect(res.fullName).toBe('Nguyen Van B');
    expect(mockAuthRepo.updateUserProfile).toHaveBeenCalledWith({
      fullName: 'Nguyen Van B',
      phone: '0912345678',
      version: 1,
    });
  });

  it('should reject empty full name', async () => {
    await expect(useCases.updateProfile({ fullName: ' ', phone: '0912345678', version: 1 }))
      .rejects.toThrow('Họ và tên không được để trống');
  });

  it('should validate avatar file size and type', async () => {
    const validFile = new File(['mock content'], 'avatar.png', { type: 'image/png' });
    const res = await useCases.uploadAvatar(validFile);
    expect(res.avatarUrl).toBe('/avatars/new.webp');

    const invalidType = new File(['mock content'], 'avatar.gif', { type: 'image/gif' });
    await expect(useCases.uploadAvatar(invalidType)).rejects.toThrow('Chỉ chấp nhận định dạng JPG, PNG hoặc WebP');
  });

  it('should validate password matching on change password', async () => {
    await expect(useCases.changePassword('Old123!', 'NewPass123', 'Different123'))
      .rejects.toThrow('Mật khẩu xác nhận không khớp');

    await useCases.changePassword('Old123!', 'NewPass123', 'NewPass123');
    expect(mockAuthRepo.changePassword).toHaveBeenCalledWith('Old123!', 'NewPass123');
  });
});

