export interface UserIdentity {
  id: string;
  provider: 'GOOGLE' | string;
  providerSubject: string;
  emailAtLink: string | null;
  emailVerified: boolean;
  displayName: string | null;
  pictureUrl: string | null;
  locale: string | null;
  linkedAt: string;
  lastLoginAt: string | null;
}
