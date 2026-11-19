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

export function hasDualRole(_user: User | null | undefined): boolean {
  return false;
}

export function getEffectiveRole(
  user: User | null | undefined,
  _activeRole?: UserRole | null
): UserRole | null {
  if (!user?.roles?.length) return null;
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

export function resolveNotificationLink(
  link: string | null | undefined,
  role: UserRole | null
): string {
  if (!link || link === '/dashboard') {
    return role === 'LANDLORD' ? APP_ROUTES.landlordHome : APP_ROUTES.tenantHome;
  }
  if (
    link.startsWith('/dashboard/landlord') ||
    link.startsWith('/dashboard/tenant') ||
    link.startsWith('/dashboard/admin') ||
    link.startsWith('/dashboard/moderator')
  ) {
    return link;
  }
  const prefix = role === 'LANDLORD' ? '/dashboard/landlord' : '/dashboard/tenant';
  if (link.startsWith('/dashboard/')) {
    const sub = link.slice('/dashboard'.length);
    return `${prefix}${sub}`;
  }
  return link;
}

export function formatNotificationTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0 || isNaN(diffMs)) return '';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function cleanNotificationText(
  rawTitle: string | null | undefined,
  rawMessage: string | null | undefined
): { title: string; message: string } {
  let title = rawTitle || 'Thông báo';
  let message = rawMessage || '';

  if (title.includes('Cập nhật nghiệp vụ:')) {
    if (title.includes('TenantKycApproved') || title.includes('LandlordApproved')) {
      title = 'Hồ sơ định danh eKYC đã được duyệt';
    } else if (title.includes('FaceVerificationPassed')) {
      title = 'Xác thực khuôn mặt thành công';
    } else if (title.includes('FaceVerificationFailed')) {
      title = 'Xác thực khuôn mặt không thành công';
    } else if (title.includes('PAYMENT_PAID')) {
      title = 'Thanh toán thành công';
    } else {
      title = 'Thông báo hệ thống';
    }
  }

  if (message.startsWith('Cập nhật RENTAL_REQUEST #')) {
    message = 'Yêu cầu thuê phòng của bạn đã có cập nhật trạng thái mới.';
  } else if (message.startsWith('Cập nhật APPOINTMENT #')) {
    message = 'Lịch hẹn xem phòng của bạn đã có cập nhật mới.';
  } else if (message.startsWith('Cập nhật CONTRACT #')) {
    message = 'Hợp đồng thuê phòng của bạn có thông tin cập nhật mới.';
  } else if (message.startsWith('Cập nhật INVOICE #')) {
    message = 'Hóa đơn thanh toán của bạn có cập nhật mới.';
  }

  return { title, message };
}


