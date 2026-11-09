import {
  boolean as zBoolean,
  enum as zEnum,
  maxLength,
  minLength,
  object as zObject,
  overwrite,
  refine,
  regex,
  string as zString,
  superRefine,
  toLowerCase,
  trim,
} from 'zod/mini';
import { isCommonWeakPassword } from './common-passwords';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const VN_PHONE_REGEX = /^((\+84)|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
export const FULL_NAME_REGEX = /^[\p{L}\s'.-]{2,60}$/u;

const utf8Encoder = new TextEncoder();

export function getUtf8ByteLength(value: string): number {
  return utf8Encoder.encode(value).length;
}

export function normalizePhoneE164(raw: string | undefined | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('0')) {
    return '+84' + trimmed.substring(1);
  }
  return trimmed;
}

export function isSingleRepeatedChar(lowerStr: string): boolean {
  if (!lowerStr) return false;
  return new Set(lowerStr).size === 1;
}

export function isSequentialString(lowerStr: string): boolean {
  if (lowerStr.length < 6) return false;
  let inc = true;
  let dec = true;
  for (let i = 0; i < lowerStr.length - 1; i++) {
    const c1 = lowerStr.charCodeAt(i);
    const c2 = lowerStr.charCodeAt(i + 1);
    if (c2 - c1 !== 1) inc = false;
    if (c1 - c2 !== 1) dec = false;
  }
  return inc || dec;
}

const DOMAIN_TYPO_MAP: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'icoud.com': 'icloud.com',
};

export function checkEmailTypo(rawEmail: string): string | null {
  const clean = rawEmail.trim().toLowerCase();
  const atIndex = clean.indexOf('@');
  if (atIndex <= 0) return null;
  const local = clean.slice(0, atIndex);
  const domain = clean.slice(atIndex + 1);
  const fixedDomain = DOMAIN_TYPO_MAP[domain];
  return fixedDomain ? `${local}@${fixedDomain}` : null;
}

export const emailSchema = zString().check(
  trim(),
  toLowerCase(),
  minLength(1, 'errors.emailRequired'),
  maxLength(254, 'errors.emailMax'),
  refine((val) => EMAIL_REGEX.test(val) && !val.includes('..'), 'errors.emailInvalid')
);

export const optionalPhoneSchema = zString().check(
  trim(),
  refine((val) => val === '' || VN_PHONE_REGEX.test(val), 'errors.phoneInvalid')
);

export const fullNameSchema = zString().check(
  overwrite((val) => val.trim().replace(/\s+/g, ' ')),
  minLength(2, 'errors.nameLength'),
  maxLength(60, 'errors.nameLength'),
  regex(FULL_NAME_REGEX, 'errors.nameChars')
);

export function validateNewPasswordWithContext(
  password: string,
  context?: { email?: string; fullName?: string }
): string | null {
  if (!password) return 'errors.passwordRequired';
  if (password.length < 8) return 'errors.passwordMin';
  if (getUtf8ByteLength(password) > 72) return 'errors.passwordMaxBytes';

  const lower = password.toLowerCase().trim();
  if (isCommonWeakPassword(password)) return 'errors.passwordCommon';
  if (isSingleRepeatedChar(lower) || isSequentialString(lower)) {
    return 'errors.passwordRepetitive';
  }

  if (context?.email) {
    const cleanEmail = context.email.toLowerCase().trim();
    const atIndex = cleanEmail.indexOf('@');
    const prefix = atIndex > 0 ? cleanEmail.substring(0, atIndex) : '';
    if (
      lower === cleanEmail ||
      (prefix && (lower === prefix || (prefix.length >= 4 && lower.includes(prefix))))
    ) {
      return 'errors.passwordNameEmail';
    }
  }

  if (context?.fullName) {
    const cleanName = context.fullName.toLowerCase().trim().replace(/\s+/g, ' ');
    if (
      cleanName &&
      (lower === cleanName || (cleanName.length >= 3 && lower.includes(cleanName)))
    ) {
      return 'errors.passwordNameEmail';
    }
  }

  return null;
}

export const loginSchema = zObject({
  identifier: zString().check(trim(), minLength(1, 'errors.identifierRequired')),
  password: zString().check(minLength(1, 'errors.passwordRequired')),
});

export const forgotPasswordStep1Schema = zObject({
  email: emailSchema,
});

export function createRegisterSchema() {
  return zObject({
    role: zEnum(['TENANT', 'LANDLORD']),
    fullName: fullNameSchema,
    email: emailSchema,
    phone: optionalPhoneSchema,
    password: zString().check(minLength(1, 'errors.passwordRequired')),
    confirmPassword: zString().check(minLength(1, 'errors.passwordMismatch')),
    acceptTerms: zBoolean().check(refine((v) => v === true, 'errors.termsRequired')),
  }).check(
    superRefine((data, ctx) => {
      const pwdErr = validateNewPasswordWithContext(data.password, {
        email: data.email,
        fullName: data.fullName,
      });
      if (pwdErr) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: pwdErr,
        });
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'errors.passwordMismatch',
        });
      }
    })
  );
}

export function createResetPasswordSchema(emailContext: string) {
  return zObject({
    otp: zString().check(trim(), regex(/^\d{6}$/, 'errors.otpRequired')),
    newPassword: zString().check(minLength(1, 'errors.passwordRequired')),
    confirmPassword: zString().check(minLength(1, 'errors.passwordMismatch')),
  }).check(
    superRefine((data, ctx) => {
      const pwdErr = validateNewPasswordWithContext(data.newPassword, {
        email: emailContext,
      });
      if (pwdErr) {
        ctx.addIssue({
          code: 'custom',
          path: ['newPassword'],
          message: pwdErr,
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'errors.passwordMismatch',
        });
      }
    })
  );
}

