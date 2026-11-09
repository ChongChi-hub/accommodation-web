import { describe, it, expect } from 'vitest';
import vectors from '../../../docs/auth_test_vectors.json';
import {
  emailSchema,
  optionalPhoneSchema,
  fullNameSchema,
  validateNewPasswordWithContext,
  loginSchema,
  checkEmailTypo,
  normalizePhoneE164,
  getUtf8ByteLength,
} from './auth.validation';
import { evaluatePasswordStrength } from './password-strength';

describe('Auth Validation & Shared Vectors', () => {
  it('validates all shared email vectors consistently', () => {
    for (const valid of vectors.email.valid) {
      const res = emailSchema.safeParse(valid);
      expect(res.success, `Expected valid email: ${valid}`).toBe(true);
    }
    for (const invalid of vectors.email.invalid) {
      const res = emailSchema.safeParse(invalid);
      expect(res.success, `Expected invalid email: ${invalid}`).toBe(false);
    }
  });

  it('normalizes email (trim + lowercase) and detects common domain typos locally', () => {
    const parsed = emailSchema.parse('  Tenant.Test@GMAIL.com  ');
    expect(parsed).toBe('tenant.test@gmail.com');

    expect(checkEmailTypo('user@gmial.com')).toBe('user@gmail.com');
    expect(checkEmailTypo('user@yaho.com')).toBe('user@yahoo.com');
    expect(checkEmailTypo('user@gmail.com')).toBeNull();
  });

  it('validates all shared phone vectors (optional Vietnamese mobile)', () => {
    for (const valid of vectors.phone.valid) {
      const res = optionalPhoneSchema.safeParse(valid);
      expect(res.success, `Expected valid phone: ${valid}`).toBe(true);
    }
    for (const invalid of vectors.phone.invalid) {
      const res = optionalPhoneSchema.safeParse(invalid);
      expect(res.success, `Expected invalid phone: ${invalid}`).toBe(false);
    }
    expect(normalizePhoneE164('0901234567')).toBe('+84901234567');
    expect(normalizePhoneE164('+84901234567')).toBe('+84901234567');
    expect(normalizePhoneE164('')).toBe('');
  });

  it('validates all shared fullName vectors and collapses extra spaces', () => {
    for (const valid of vectors.fullName.valid) {
      const res = fullNameSchema.safeParse(valid);
      expect(res.success, `Expected valid fullName: ${valid}`).toBe(true);
    }
    for (const invalid of vectors.fullName.invalid) {
      const res = fullNameSchema.safeParse(invalid);
      expect(res.success, `Expected invalid fullName: ${invalid}`).toBe(false);
    }
    expect(fullNameSchema.parse('  Nguyễn    Văn   A  ')).toBe('Nguyễn Văn A');
  });

  it('validates all shared password vectors including exact 72 UTF-8 bytes Vietnamese boundary', () => {
    const context = { email: 'tenant@cozynest.vn', fullName: 'Nguyễn Văn A' };
    for (const valid of vectors.password.valid) {
      const err = validateNewPasswordWithContext(valid, context);
      expect(err, `Expected valid password: ${valid}`).toBeNull();
    }
    for (const invalid of vectors.password.invalid) {
      const err = validateNewPasswordWithContext(invalid, context);
      expect(err, `Expected invalid password: ${invalid}`).not.toBeNull();
    }

    const exact72Vi = 'TổẤmNhàĐẹpTổẤmNhàĐẹpTổẤmNhàĐẹpViệtNamxxxxxxxxx';
    expect(getUtf8ByteLength(exact72Vi)).toBe(72);
    expect(validateNewPasswordWithContext(exact72Vi, context)).toBeNull();

    const exceed73Vi = exact72Vi + 'x';
    expect(getUtf8ByteLength(exceed73Vi)).toBe(73);
    expect(validateNewPasswordWithContext(exceed73Vi, context)).toBe('errors.passwordMaxBytes');
  });

  it('allows any non-empty password in loginSchema without enforcing registration policy', () => {
    expect(loginSchema.safeParse({ identifier: '0901234567', password: 'old1' }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: '', password: 'old1' }).success).toBe(false);
    expect(loginSchema.safeParse({ identifier: 'a@b.vn', password: '' }).success).toBe(false);
  });

  it('evaluates password strength checklist accurately', () => {
    const strong = evaluatePasswordStrength('ToAm@NhaDep2026!', 'u@test.vn', 'Tran B');
    expect(strong.score).toBeGreaterThanOrEqual(3);
    expect(strong.checklist.minLength).toBe(true);
    expect(strong.checklist.within72Bytes).toBe(true);
    expect(strong.checklist.notPersonalOrCommon).toBe(true);
    expect(strong.checklist.notRepetitive).toBe(true);
  });
});

