'use client';

import React, { createContext, useContext, useState } from 'react';

export type AuthIntendedRole = 'TENANT' | 'LANDLORD';

interface AuthPanelContextValue {
  intendedRole: AuthIntendedRole;
  setIntendedRole: (role: AuthIntendedRole) => void;
}

const AuthPanelContext = createContext<AuthPanelContextValue>({
  intendedRole: 'TENANT',
  setIntendedRole: () => {},
});

export function AuthPanelProvider({ children }: { children: React.ReactNode }) {
  const [intendedRole, setIntendedRole] = useState<AuthIntendedRole>('TENANT');
  return (
    <AuthPanelContext.Provider value={{ intendedRole, setIntendedRole }}>
      {children}
    </AuthPanelContext.Provider>
  );
}

export function useAuthPanelContext() {
  return useContext(AuthPanelContext);
}

