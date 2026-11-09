export const AUTH_ERROR_KEY_MAP: Record<string, string> = {
  ERR_AUTH_INVALID_CREDENTIALS: 'errors.badCredentials',
  ERR_AUTH_INVALID_PASSWORD: 'errors.badCredentials',
  ERR_AUTH_TEMPORARY_LOCKED: 'errors.temporaryLocked',
  ERR_AUTH_ACCOUNT_LOCKED: 'errors.userLocked',
  ERR_AUTH_USER_LOCKED: 'errors.userLocked',
  ERR_USER_SUSPENDED: 'errors.userSuspended',
  ERR_USER_DELETED: 'errors.userDeleted',
  ERR_AUTH_EMAIL_EXISTS: 'errors.emailExists',
  ERR_AUTH_PHONE_EXISTS: 'errors.phoneExists',
  ERR_AUTH_OAUTH_ACCOUNT: 'errors.oauthAccount',
  ERR_AUTH_INVALID_OTP: 'errors.otpInvalid',
  ERR_AUTH_OTP_EXPIRED: 'errors.otpExpired',
  ERR_AUTH_OTP_LOCKED: 'errors.otpLocked',
  ERR_AUTH_OLD_PASSWORD_REUSE: 'errors.oldPasswordReuse',
  ERR_AUTH_SERVICE_UNAVAILABLE: 'errors.serviceUnavailable',
  ERR_RATE_LIMIT_COOLDOWN: 'errors.rateLimitCooldown',
  ERR_RATE_LIMIT_EXCEEDED: 'errors.tooManyRequests',
  ERR_LOGIN_RATE_LIMIT_EXCEEDED: 'errors.tooManyRequests',
  ERR_REGISTER_RATE_LIMIT_EXCEEDED: 'errors.tooManyRequests',
  ERR_GOOGLE_NOT_CONFIGURED: 'errors.googleNotConfigured',
  ERR_INVALID_NONCE: 'errors.invalidNonce',
  ERR_AUTH_PASSWORD_TOO_SHORT: 'errors.passwordMin',
  ERR_AUTH_PASSWORD_TOO_LONG: 'errors.passwordMaxBytes',
  ERR_AUTH_PASSWORD_TOO_COMMON: 'errors.passwordCommon',
  ERR_AUTH_PASSWORD_EQUALS_EMAIL: 'errors.passwordNameEmail',
  ERR_AUTH_PASSWORD_CONTAINS_NAME: 'errors.passwordNameEmail',
  ERR_AUTH_PASSWORD_REPETITIVE: 'errors.passwordRepetitive',
  ERR_NETWORK: 'errors.networkError',
};

export function resolveAuthErrorKey(errorCode?: string | null): string | null {
  if (!errorCode) return null;
  return AUTH_ERROR_KEY_MAP[errorCode] ?? null;
}

const RETURN_URL_REASON_MAP: Array<{ prefix: string; key: string }> = [
  { prefix: '/dashboard/tenant', key: 'reasons.tenantDashboard' },
  { prefix: '/dashboard/landlord', key: 'reasons.landlordDashboard' },
  { prefix: '/dashboard/admin', key: 'reasons.adminDashboard' },
  { prefix: '/dashboard/moderator', key: 'reasons.moderatorDashboard' },
  { prefix: '/rooms', key: 'reasons.rooms' },
];

export function resolveReturnUrlReasonKey(returnUrl: string | null): string | null {
  if (!returnUrl || !returnUrl.startsWith('/') || returnUrl.startsWith('//')) {
    return null;
  }
  const clean = returnUrl.replace(/^\/(vi|en)/, '') || '/';
  const match = RETURN_URL_REASON_MAP.find((item) => clean.startsWith(item.prefix));
  if (match) return match.key;
  if (clean.startsWith('/dashboard')) return 'reasons.default';
  return null;
}

export function getSafeRedirectUrl(rawUrl: string | null, roles: string[]): string | null {
  if (!rawUrl || !rawUrl.startsWith('/') || rawUrl.startsWith('//') || rawUrl.includes('://')) {
    return null;
  }
  const clean = rawUrl.replace(/^\/(vi|en)/, '') || '/';
  if (clean.startsWith('/dashboard/admin') && !roles.includes('ADMIN')) return '/403';
  if (clean.startsWith('/dashboard/landlord') && !roles.includes('LANDLORD')) return '/403';
  if (clean.startsWith('/dashboard/tenant') && !roles.includes('TENANT')) return '/403';
  return rawUrl;
}
