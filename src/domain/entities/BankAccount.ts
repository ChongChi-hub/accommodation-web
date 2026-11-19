export interface UserBankAccount {
  id: string;
  userId: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCodeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveBankAccountDto {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCodeUrl?: string;
}

export interface SupportedBank {
  code: string;
  name: string;
  shortName: string;
}

export const POPULAR_VIETNAM_BANKS: SupportedBank[] = [
  { code: 'VCB', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', shortName: 'Vietcombank' },
  { code: 'MB', name: 'Ngân hàng TMCP Quân đội', shortName: 'MBBank' },
  { code: 'TCB', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', shortName: 'Techcombank' },
  { code: 'ICB', name: 'Ngân hàng TMCP Công thương Việt Nam', shortName: 'VietinBank' },
  { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', shortName: 'BIDV' },
  { code: 'ACB', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB' },
  { code: 'TPB', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank' },
  { code: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank' },
  { code: 'VBA', name: 'Ngân hàng Nông nghiệp & Phát triển Nông thôn', shortName: 'Agribank' },
  { code: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank' },
];
