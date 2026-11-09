import { User, UserRole } from '@/domain/entities/User';
import { APP_ROUTES } from '@/shared/routes';

export interface ShortNameResult {
  shortName: string;
  fullName: string;
  isTruncated: boolean;
}

export function formatShortName(
  fullName: string | null | undefined,
  maxLength = 14,
  fallback = 'Người dùng'
): ShortNameResult {
  const normalized = (fullName || '').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return { shortName: fallback, fullName: fallback, isTruncated: false };
  }

  if (normalized.length <= maxLength) {
    return { shortName: normalized, fullName: normalized, isTruncated: false };
  }

  const words = normalized.split(' ').filter(Boolean);
  if (words.length === 1) {
    const clipped =
      maxLength > 1 ? `${words[0].slice(0, maxLength - 1)}…` : words[0].slice(0, maxLength);
    return { shortName: clipped, fullName: normalized, isTruncated: true };
  }

  let candidate = words[0];
  if (candidate.length > maxLength) {
    candidate = maxLength > 1 ? `${candidate.slice(0, maxLength - 1)}…` : candidate.slice(0, maxLength);
    return { shortName: candidate, fullName: normalized, isTruncated: true };
  }

  for (let i = 1; i < words.length; i++) {
    const next = `${candidate} ${words[i]}`;
    if (next.length > maxLength) {
      break;
    }
    candidate = next;
  }

  return {
    shortName: candidate,
    fullName: normalized,
    isTruncated: candidate !== normalized,
  };
}

export function hasDualRole(user: User | null | undefined): boolean {
  if (!user?.roles) return false;
  return user.roles.includes('LANDLORD') && user.roles.includes('TENANT');
}

export function getEffectiveRole(
  user: User | null | undefined,
  activeRole?: UserRole | null
): UserRole | null {
  if (!user?.roles?.length) return null;
  if (activeRole && user.roles.includes(activeRole)) {
    return activeRole;
  }
  if (user.roles.includes('ADMIN')) return 'ADMIN';
  if (user.roles.includes('MODERATOR')) return 'MODERATOR';
  if (user.roles.includes('LANDLORD')) return 'LANDLORD';
  return 'TENANT';
}

export function resolveHome(
  user: User | null | undefined,
  preferredRole?: UserRole | null
): string {
  if (!user) return APP_ROUTES.login;
  const effective = getEffectiveRole(user, preferredRole);
  switch (effective) {
    case 'ADMIN':
      return APP_ROUTES.adminHome;
    case 'MODERATOR':
      return APP_ROUTES.moderatorHome;
    case 'LANDLORD':
      return APP_ROUTES.landlordHome;
    case 'TENANT':
    default:
      return APP_ROUTES.tenantHome;
  }
}

export function getProfileRoute(role: UserRole | null): string {
  switch (role) {
    case 'ADMIN':
      return APP_ROUTES.adminProfile;
    case 'MODERATOR':
      return APP_ROUTES.moderatorProfile;
    case 'LANDLORD':
      return APP_ROUTES.landlordProfile;
    case 'TENANT':
    default:
      return APP_ROUTES.tenantProfile;
  }
}

export function getNotificationsRoute(role: UserRole | null): string {
  switch (role) {
    case 'ADMIN':
      return APP_ROUTES.adminNotifications;
    case 'MODERATOR':
      return APP_ROUTES.moderatorNotifications;
    case 'LANDLORD':
      return APP_ROUTES.landlordNotifications;
    case 'TENANT':
    default:
      return APP_ROUTES.tenantNotifications;
  }
}

export function getMessagesRoute(role: UserRole | null): string | null {
  if (role === 'LANDLORD') return APP_ROUTES.landlordMessages;
  if (role === 'TENANT') return APP_ROUTES.tenantMessages;
  return null;
}

export type HeaderCtaState =
  | { visible: true; mode: 'guest'; href: string; labelKey: string }
  | { visible: true; mode: 'landlord'; href: string; labelKey: string }
  | { visible: true; mode: 'applicant'; href: string; labelKey: string; status: string }
  | { visible: true; mode: 'tenant'; href: string; labelKey: string }
  | { visible: false; mode: 'hidden' };

export function getHeaderCtaState(user: User | null | undefined): HeaderCtaState {
  if (!user) {
    return {
      visible: true,
      mode: 'guest',
      href: APP_ROUTES.registerLandlord,
      labelKey: 'header.cta.postRoom',
    };
  }

  if (user.roles.includes('ADMIN') || user.roles.includes('MODERATOR')) {
    return { visible: false, mode: 'hidden' };
  }

  if (user.roles.includes('LANDLORD')) {
    return {
      visible: true,
      mode: 'landlord',
      href: APP_ROUTES.landlordNewRoom,
      labelKey: 'header.cta.postNewRoom',
    };
  }

  const appStatus = user.landlordApplication?.status;
  if (appStatus && appStatus !== 'NOT_APPLIED' && appStatus !== 'APPROVED') {
    return {
      visible: true,
      mode: 'applicant',
      href: APP_ROUTES.landlordKyc,
      labelKey: 'header.cta.landlordAppStatus',
      status: appStatus,
    };
  }

  return {
    visible: true,
    mode: 'tenant',
    href: APP_ROUTES.becomeLandlord,
    labelKey: 'header.cta.becomeLandlord',
  };
}

