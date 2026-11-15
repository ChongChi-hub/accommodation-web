'use client';

import React from 'react';
import { TwoFactorSecurityCard } from './TwoFactorSecurityCard';
import { UserChangePasswordView } from './UserChangePasswordView';

export function SecuritySettingsView() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Bao mat tai khoan</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Quan ly mat khau va phuong thuc xac thuc 2 lop de bao ve tai khoan cua ban.
        </p>
      </div>

      <div className="space-y-6">
        <TwoFactorSecurityCard />
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Doi mat khau</h2>
          <UserChangePasswordView />
        </div>
      </div>
    </div>
  );
}
