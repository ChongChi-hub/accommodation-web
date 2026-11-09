/**
 * @vitest-environment jsdom
 */
import React, { useState } from 'react';
import fs from 'fs';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import viMessages from '@/i18n/messages/vi.json';
import enMessages from '@/i18n/messages/en.json';
import { OtpInput } from '../OtpInput';
import { PasswordField } from '../PasswordField';
import { RoleCard } from '../RoleCard';
import { GoogleLoginButton } from '../GoogleLoginButton';
import { AUTH_ERROR_KEY_MAP } from '@/presentation/validation/auth-errors';
import { evaluatePasswordStrength } from '@/presentation/validation/password-strength';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string, params?: Record<string, any>) => {
    const base = ns ? `${ns}.${key}` : key;
    if (params) return `${base}:${JSON.stringify(params)}`;
    return base;
  },
  useLocale: () => 'vi',
}));

const pushMock = vi.fn();
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => '/register',
}));

vi.mock('next/script', () => ({
  default: ({ onLoad }: { onLoad?: () => void }) => {
    React.useEffect(() => {
      onLoad?.();
    }, [onLoad]);
    return null;
  },
}));

function resolveNestedKey(obj: any, dotPath: string): unknown {
  return dotPath.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);
}

describe('Auth UI Component Tests & Parity Checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED = 'true';
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id-123.apps.googleusercontent.com';
  });

  afterEach(() => {
    cleanup();
  });

  it('OtpInput handles 6-digit paste, Backspace, Arrow keys, and one-time-code autocomplete', () => {
    function ControlledOtp() {
      const [val, setVal] = useState('');
      return <OtpInput label="OTP Code" value={val} onChange={setVal} />;
    }

    render(<ControlledOtp />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs).toHaveLength(6);
    expect(inputs[0]).toHaveAttribute('autocomplete', 'one-time-code');

    // Paste 6-digit OTP into box 0
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '48-29 10' },
    });
    expect(inputs.map((el) => el.value).join('')).toBe('482910');

    // Arrow navigation
    inputs[2].focus();
    fireEvent.keyDown(inputs[2], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(inputs[1]);
    fireEvent.keyDown(inputs[1], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(inputs[2]);

    // Backspace when current cell is empty moves focus backward and clears previous digit
    fireEvent.change(inputs[5], { target: { value: '' } });
    inputs[5].focus();
    fireEvent.keyDown(inputs[5], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[4]);
    expect(inputs[4].value).toBe('');
  });

  it('PasswordField toggles aria-pressed visibility and displays Caps Lock warning', () => {
    render(
      <PasswordField
        id="pw-test"
        name="password"
        label="Password"
        value="SecretPass99"
        onChange={() => {}}
        showStrength
        strength={evaluatePasswordStrength('SecretPass99', 'user@example.com')}
      />
    );

    const input = document.getElementById('pw-test') as HTMLInputElement;
    const toggleBtn = screen.getByRole('button');
    expect(input.type).toBe('password');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');

    fireEvent.keyDown(input, {
      key: 'A',
      modifierCapsLock: true,
    });
    expect(screen.getByText(/capsLockWarning/)).toBeInTheDocument();
  });

  it('Switching RoleCard updates GoogleLoginButton intendedRole sent to backend', async () => {
    let gisCallback: ((res: { credential?: string }) => void) | null = null;
    (window as any).google = {
      accounts: {
        id: {
          initialize: (cfg: any) => {
            gisCallback = cfg.callback;
          },
          renderButton: () => {},
          prompt: () => {},
          cancel: () => {},
        },
      },
    };

    vi.spyOn(container.auth.googleAuthUseCase, 'getStatus').mockResolvedValue({
      enabled: true,
      clientIdFingerprint: 'abcd',
    });
    vi.spyOn(container.auth.googleAuthUseCase, 'getNonce').mockResolvedValue({
      nonce: 'nonce-xyz',
    });
    const loginGoogleSpy = vi
      .spyOn(useAuthStore.getState(), 'loginWithGoogle')
      .mockResolvedValue({
        success: true,
        role: 'TENANT',
        user: { id: 'u1', email: 'g@cozynest.vn', fullName: 'Google', roles: ['TENANT'] } as any,
        isNewUser: true,
      });

    function Wrapper() {
      const [role, setRole] = useState<'TENANT' | 'LANDLORD'>('TENANT');
      return (
        <div>
          <RoleCard value={role} onChange={setRole} />
          <GoogleLoginButton isRegister intendedRole={role} />
        </div>
      );
    }

    render(<Wrapper />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[1]); // Switch to LANDLORD

    await waitFor(() => {
      expect(gisCallback).not.toBeNull();
    });

    await act(async () => {
      await gisCallback!({ credential: 'fake-id-token' });
    });
    expect(loginGoogleSpy).toHaveBeenCalledWith('fake-id-token', 'nonce-xyz', 'LANDLORD');
  });

  it('CSS stylesheet disables animations under prefers-reduced-motion: reduce', () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles/auth-animations.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('animation: none !important');
    expect(css).toContain('transition: none !important');
  });

  it('Every key in AUTH_ERROR_KEY_MAP exists in both vi.json and en.json', () => {
    for (const [code, key] of Object.entries(AUTH_ERROR_KEY_MAP)) {
      const viVal = resolveNestedKey(viMessages.auth, key);
      const enVal = resolveNestedKey(enMessages.auth, key);
      expect(viVal, `Missing vi.json key auth.${key} for ${code}`).toBeTypeOf('string');
      expect(enVal, `Missing en.json key auth.${key} for ${code}`).toBeTypeOf('string');
    }
  });
});
