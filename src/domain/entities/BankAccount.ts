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
  bin: string;
  name: string;
  shortName: string;
}

export const POPULAR_VIETNAM_BANKS: SupportedBank[] = [
  { code: 'VCB', bin: '970436', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', shortName: 'Vietcombank' },
  { code: 'ICB', bin: '970415', name: 'Ngân hàng TMCP Công thương Việt Nam', shortName: 'VietinBank' },
  { code: 'BIDV', bin: '970418', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', shortName: 'BIDV' },
  { code: 'VBA', bin: '970405', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', shortName: 'Agribank' },
  { code: 'TCB', bin: '970407', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', shortName: 'Techcombank' },
  { code: 'MB', bin: '970422', name: 'Ngân hàng TMCP Quân đội', shortName: 'MBBank' },
  { code: 'ACB', bin: '970416', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB' },
  { code: 'VPB', bin: '970432', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank' },
  { code: 'TPB', bin: '970423', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank' },
  { code: 'STB', bin: '970403', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank' },
  { code: 'HDB', bin: '970437', name: 'Ngân hàng TMCP Phát triển TP. Hồ Chí Minh', shortName: 'HDBank' },
  { code: 'VIB', bin: '970441', name: 'Ngân hàng TMCP Quốc tế Việt Nam', shortName: 'VIB' },
  { code: 'SHB', bin: '970443', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', shortName: 'SHB' },
  { code: 'EIB', bin: '970431', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', shortName: 'Eximbank' },
  { code: 'MSB', bin: '970426', name: 'Ngân hàng TMCP Hàng Hải Việt Nam', shortName: 'MSB' },
  { code: 'OCB', bin: '970448', name: 'Ngân hàng TMCP Phương Đông', shortName: 'OCB' },
  { code: 'LPB', bin: '970449', name: 'Ngân hàng TMCP Lộc Phát Việt Nam (LienVietPostBank)', shortName: 'LPBank' },
  { code: 'SEAB', bin: '970440', name: 'Ngân hàng TMCP Đông Nam Á', shortName: 'SeABank' },
  { code: 'ABB', bin: '970425', name: 'Ngân hàng TMCP An Bình', shortName: 'ABBank' },
  { code: 'BAB', bin: '970409', name: 'Ngân hàng TMCP Bắc Á', shortName: 'BacABank' },
  { code: 'NAB', bin: '970428', name: 'Ngân hàng TMCP Nam Á', shortName: 'NamABank' },
  { code: 'VAB', bin: '970427', name: 'Ngân hàng TMCP Việt Á', shortName: 'VietABank' },
  { code: 'VIETBANK', bin: '970433', name: 'Ngân hàng TMCP Việt Nam Thương Tín', shortName: 'VietBank' },
  { code: 'BVB', bin: '970438', name: 'Ngân hàng TMCP Bảo Việt', shortName: 'BaoVietBank' },
  { code: 'VCCB', bin: '970454', name: 'Ngân hàng TMCP Bản Việt (VietCapitalBank)', shortName: 'BVBank' },
  { code: 'KLB', bin: '970452', name: 'Ngân hàng TMCP Kiên Long', shortName: 'KienLongBank' },
  { code: 'PGB', bin: '970430', name: 'Ngân hàng TMCP Thịnh vượng và Phát triển', shortName: 'PGBank' },
  { code: 'SGB', bin: '970400', name: 'Ngân hàng TMCP Sài Gòn Công Thương', shortName: 'SaigonBank' },
  { code: 'PVCB', bin: '970412', name: 'Ngân hàng TMCP Đại Chúng Việt Nam', shortName: 'PVcomBank' },
  { code: 'NCB', bin: '970419', name: 'Ngân hàng TMCP Quốc Dân', shortName: 'NCB' },
  { code: 'SCB', bin: '970429', name: 'Ngân hàng TMCP Sài Gòn', shortName: 'SCB' },
  { code: 'OJB', bin: '970414', name: 'Ngân hàng TNHH MTV Đại Dương (OceanBank)', shortName: 'MBV' },
  { code: 'GPB', bin: '970408', name: 'Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu', shortName: 'GPBank' },
  { code: 'VRB', bin: '970421', name: 'Ngân hàng Liên doanh Việt - Nga', shortName: 'VRB' },
  { code: 'IVB', bin: '970434', name: 'Ngân hàng TNHH Indovina', shortName: 'IndovinaBank' },
  { code: 'SHBVN', bin: '970424', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', shortName: 'ShinhanBank' },
  { code: 'WVN', bin: '970457', name: 'Ngân hàng TNHH MTV Woori Việt Nam', shortName: 'WooriBank' },
  { code: 'UOB', bin: '970458', name: 'Ngân hàng United Overseas Bank Việt Nam', shortName: 'UOB' },
  { code: 'SCVN', bin: '970410', name: 'Ngân hàng TNHH MTV Standard Chartered Việt Nam', shortName: 'StandardChartered' },
  { code: 'HSBC', bin: '458761', name: 'Ngân hàng TNHH MTV HSBC Việt Nam', shortName: 'HSBC' },
  { code: 'PBVN', bin: '970439', name: 'Ngân hàng TNHH MTV Public Việt Nam', shortName: 'PublicBank' },
  { code: 'HLBVN', bin: '970442', name: 'Ngân hàng TNHH MTV Hong Leong Việt Nam', shortName: 'HongLeongBank' },
  { code: 'CIMB', bin: '422589', name: 'Ngân hàng TNHH MTV CIMB Việt Nam', shortName: 'CIMB' },
  { code: 'CAKE', bin: '546034', name: 'Ngân hàng số CAKE by VPBank', shortName: 'CAKE' },
  { code: 'UBANK', bin: '546035', name: 'Ngân hàng số Ubank by VPBank', shortName: 'Ubank' },
  { code: 'TIMO', bin: '963388', name: 'Ngân hàng số Timo by BVBank', shortName: 'Timo' },
  { code: 'COOPBANK', bin: '970446', name: 'Ngân hàng Hợp tác xã Việt Nam', shortName: 'Co-opBank' },
];

