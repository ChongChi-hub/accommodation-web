import {
  getUtf8ByteLength,
  isSequentialString,
  isSingleRepeatedChar,
} from './auth.validation';
import { isCommonWeakPassword } from './common-passwords';

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  labelKey:
    | 'passwordVeryWeak'
    | 'passwordWeak'
    | 'passwordMedium'
    | 'passwordStrong'
    | 'passwordVeryStrong';
  barColor: string;
  byteCount: number;
  checklist: {
    minLength: boolean;
    within72Bytes: boolean;
    notPersonalOrCommon: boolean;
    notRepetitive: boolean;
  };
}

export function evaluatePasswordStrength(
  password: string,
  email?: string,
  fullName?: string
): PasswordStrengthResult {
  const byteCount = getUtf8ByteLength(password);
  const lower = password.toLowerCase().trim();

  const minLength = password.length >= 8;
  const within72Bytes = byteCount <= 72;

  let containsPersonal = false;
  if (email && email.trim()) {
    const cleanEmail = email.toLowerCase().trim();
    const atIndex = cleanEmail.indexOf('@');
    const prefix = atIndex > 0 ? cleanEmail.substring(0, atIndex) : '';
    if (
      lower === cleanEmail ||
      (prefix && (lower === prefix || (prefix.length >= 4 && lower.includes(prefix))))
    ) {
      containsPersonal = true;
    }
  }
  if (fullName && fullName.trim()) {
    const cleanName = fullName.toLowerCase().trim();
    if (lower === cleanName || (cleanName.length >= 3 && lower.includes(cleanName))) {
      containsPersonal = true;
    }
  }

  const isCommon = isCommonWeakPassword(password);
  const notPersonalOrCommon = password.length > 0 && !containsPersonal && !isCommon;
  const notRepetitive =
    password.length > 0 && !isSingleRepeatedChar(lower) && !isSequentialString(lower);

  const checklist = {
    minLength,
    within72Bytes,
    notPersonalOrCommon,
    notRepetitive,
  };

  if (!password) {
    return {
      score: 0,
      labelKey: 'passwordVeryWeak',
      barColor: 'bg-stone-200 dark:bg-stone-800',
      byteCount,
      checklist,
    };
  }

  if (!minLength || !within72Bytes || !notPersonalOrCommon || !notRepetitive) {
    return {
      score: 1,
      labelKey: 'passwordWeak',
      barColor: 'bg-red-500',
      byteCount,
      checklist,
    };
  }

  let diversity = 0;
  if (password.length >= 12) diversity += 1;
  if (password.length >= 16) diversity += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) diversity += 1;
  if (/[0-9]/.test(password)) diversity += 1;
  if (/[^A-Za-z0-9]/.test(password)) diversity += 1;

  if (diversity <= 1) {
    return {
      score: 2,
      labelKey: 'passwordMedium',
      barColor: 'bg-amber-500',
      byteCount,
      checklist,
    };
  }
  if (diversity <= 3) {
    return {
      score: 3,
      labelKey: 'passwordStrong',
      barColor: 'bg-teal-600',
      byteCount,
      checklist,
    };
  }
  return {
    score: 4,
    labelKey: 'passwordVeryStrong',
    barColor: 'bg-emerald-600',
    byteCount,
    checklist,
  };
}

