'use client';

import React from 'react';
import { EmailVerificationCard } from './EmailVerificationCard';
import { TwoFactorSecurityCard } from './TwoFactorSecurityCard';
import { UserChangePasswordView } from './UserChangePasswordView';
import { DataSubjectPrivacyCard } from './DataSubjectPrivacyCard';

export function SecuritySettingsView() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Bảo mật tài khoản</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Quản lý email, mật khẩu và phương thức xác thực để bảo vệ tài khoản của bạn.
        </p>
      </div>

      <div className="space-y-6">
        <EmailVerificationCard />
        <TwoFactorSecurityCard />
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Đổi mật khẩu</h2>
          <UserChangePasswordView />
        </div>
        <div>
          <DataSubjectPrivacyCard />
        </div>
      </div>
    </div>
  );
}
