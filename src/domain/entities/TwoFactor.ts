export interface TwoFactorSetupData {
  secret: string;
  qrUri: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  isEnabled: boolean;
}
