export interface Landmark {
  id: string;
  name: string;
  shortName: string;
  aliases: string[];
  category: 'UNIVERSITY' | 'LANDMARK' | 'STATION' | 'HOSPITAL';
  searchQuery: string;
  provinceCode: 'HN' | 'HCM' | 'DNG' | 'ALL';
  provinceName: string;
  areaDescription: string;
}

export interface PopularDistrict {
  id: string;
  name: string;
  provinceCode: string; // '01' (HN), '79' (HCM), '48' (DNG)
  provinceName: string;
  searchQuery: string;
  badge?: string;
}

export const POPULAR_DISTRICTS: PopularDistrict[] = [
  { id: 'hn-cau-giay', name: 'Cầu Giấy', provinceCode: 'HN', provinceName: 'Hà Nội', searchQuery: 'Cầu Giấy', badge: 'Hot' },
  { id: 'hcm-binh-thanh', name: 'Bình Thạnh', provinceCode: 'HCM', provinceName: 'TP. Hồ Chí Minh', searchQuery: 'Bình Thạnh', badge: 'Hot' },
  { id: 'hn-dong-da', name: 'Đống Đa', provinceCode: 'HN', provinceName: 'Hà Nội', searchQuery: 'Đống Đa' },
  { id: 'hcm-phu-my-hung', name: 'Phú Mỹ Hưng (Q7)', provinceCode: 'HCM', provinceName: 'TP. Hồ Chí Minh', searchQuery: 'Phú Mỹ Hưng' },
  { id: 'hn-hai-ba-trung', name: 'Hai Bà Trưng', provinceCode: 'HN', provinceName: 'Hà Nội', searchQuery: 'Bách Khoa' },
  { id: 'hcm-quan-10', name: 'Quận 10', provinceCode: 'HCM', provinceName: 'TP. Hồ Chí Minh', searchQuery: 'Tô Hiến Thành' },
  { id: 'hn-duy-tan', name: 'Duy Tân (Cầu Giấy)', provinceCode: 'HN', provinceName: 'Hà Nội', searchQuery: 'Duy Tân' },
  { id: 'dng-hai-chau', name: 'Hải Châu (Đà Nẵng)', provinceCode: 'DNG', provinceName: 'Đà Nẵng', searchQuery: 'Hải Châu' },
];

export function findMatchingDistricts(keyword: string, provinceFilter?: string, limit: number = 8): PopularDistrict[] {
  const q = keyword.trim().toLowerCase();
  if (!q) {
    if (provinceFilter) {
      return POPULAR_DISTRICTS.filter((d) => d.provinceCode === provinceFilter).slice(0, limit);
    }
    return POPULAR_DISTRICTS.slice(0, limit);
  }
  return POPULAR_DISTRICTS.filter((d) => {
    if (provinceFilter && d.provinceCode !== provinceFilter) return false;
    return d.name.toLowerCase().includes(q) || d.searchQuery.toLowerCase().includes(q);
  }).slice(0, limit);
}

export const POPULAR_LANDMARKS: Landmark[] = [
  // --- NỔI BẬT ĐA DẠNG (TRƯỜNG ĐH, KHU VĂN PHÒNG, ĐÔ THỊ, BỆNH VIỆN) ---
  {
    id: 'hust',
    name: 'Đại học Bách Khoa Hà Nội',
    shortName: 'HUST',
    aliases: ['hust', 'bach khoa', 'bách khoa', 'bk', 'đh bách khoa', 'dh bach khoa', 'tạ quang bửu', 'ta quang buu', 'đại cồ việt'],
    category: 'UNIVERSITY',
    searchQuery: 'Bách Khoa',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu vực Hai Bà Trưng, Tạ Quang Bửu, Bạch Mai',
  },
  {
    id: 'keangnam',
    name: 'Tòa nhà Keangnam & Phố Duy Tân',
    shortName: 'Keangnam',
    aliases: ['keangnam', 'duy tân', 'duy tan', 'phạm hùng', 'pham hung', 'mỹ đình', 'my dinh'],
    category: 'LANDMARK',
    searchQuery: 'Duy Tân',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu văn phòng Duy Tân, Cầu Giấy, Nam Từ Liêm',
  },
  {
    id: 'vnu-itp',
    name: 'Làng Đại học Quốc Gia TP.HCM',
    shortName: 'VNU-HCM',
    aliases: ['lang dai hoc', 'làng đại học', 'thu duc', 'thủ đức', 'linh trung', 'vnu hcm'],
    category: 'UNIVERSITY',
    searchQuery: 'Thủ Đức',
    provinceCode: 'HCM',
    provinceName: 'TP. Hồ Chí Minh',
    areaDescription: 'Khu vực Thủ Đức, Dĩ An, Linh Trung',
  },
  {
    id: 'phu-my-hung',
    name: 'Khu đô thị Phú Mỹ Hưng (Quận 7)',
    shortName: 'Phú Mỹ Hưng',
    aliases: ['phu my hung', 'phú mỹ hưng', 'quan 7', 'quận 7', 'tân phong', 'tan phong', 'nguyễn thị thập'],
    category: 'LANDMARK',
    searchQuery: 'Phú Mỹ Hưng',
    provinceCode: 'HCM',
    provinceName: 'TP. Hồ Chí Minh',
    areaDescription: 'Khu vực Quận 7, Tân Phong, Nguyễn Thị Thập',
  },
  {
    id: 'neu',
    name: 'Đại học Kinh Tế Quốc Dân',
    shortName: 'NEU',
    aliases: ['neu', 'kinh te quoc dan', 'kinh tế quốc dân', 'ktqd', 'trần đại nghĩa', 'tran dai nghia'],
    category: 'UNIVERSITY',
    searchQuery: 'Trần Đại Nghĩa',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu vực Hai Bà Trưng, Trần Đại Nghĩa, Đồng Tâm',
  },
  {
    id: 'bv-bach-mai',
    name: 'Bệnh viện Bạch Mai & Phương Mai',
    shortName: 'BV Bạch Mai',
    aliases: ['bach mai', 'bạch mai', 'phuong mai', 'phương mai', 'giai phong', 'giải phóng'],
    category: 'HOSPITAL',
    searchQuery: 'Phương Mai',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu vực Đống Đa, Phương Mai, Giải Phóng',
  },
  {
    id: 'ftu',
    name: 'Đại học Ngoại Thương Hà Nội',
    shortName: 'FTU',
    aliases: ['ftu', 'ngoai thuong', 'ngoại thương', 'chùa láng', 'chua lang'],
    category: 'UNIVERSITY',
    searchQuery: 'Ngoại Thương',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu vực Đống Đa, Chùa Láng, Láng Thượng',
  },
  {
    id: 'vnu-cau-giay',
    name: 'Đại học Quốc Gia Hà Nội (Cầu Giấy)',
    shortName: 'VNU',
    aliases: ['vnu', 'dh quoc gia', 'đh quốc gia', 'quốc gia hà nội', 'xuân thủy', 'xuan thuy', 'cầu giấy', 'cau giay'],
    category: 'UNIVERSITY',
    searchQuery: 'Cầu Giấy',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu vực Cầu Giấy, Xuân Thủy, Dịch Vọng Hậu',
  },
  {
    id: 'hnue',
    name: 'Đại học Sư Phạm Hà Nội',
    shortName: 'HNUE',
    aliases: ['hnue', 'su pham', 'sư phạm', 'dhsp', 'đhsp'],
    category: 'UNIVERSITY',
    searchQuery: 'Cầu Giấy',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu vực Cầu Giấy, Xuân Thủy, Trần Thái Tông',
  },
  {
    id: 'keangnam',
    name: 'Tòa nhà Keangnam & Phố Duy Tân',
    shortName: 'Keangnam',
    aliases: ['keangnam', 'duy tân', 'duy tan', 'phạm hùng', 'pham hung', 'mỹ đình', 'my dinh'],
    category: 'LANDMARK',
    searchQuery: 'Duy Tân',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu văn phòng Duy Tân, Cầu Giấy, Nam Từ Liêm',
  },
  {
    id: 'bx-my-dinh',
    name: 'Bến xe Mỹ Đình',
    shortName: 'BX Mỹ Đình',
    aliases: ['my dinh', 'mỹ đình', 'bến xe mỹ đình', 'ben xe my dinh', 'nam từ liêm', 'nam tu liem'],
    category: 'STATION',
    searchQuery: 'Mỹ Đình',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu vực Nam Từ Liêm, Phạm Hùng',
  },
  {
    id: 'bv-bach-mai',
    name: 'Bệnh viện Bạch Mai & Phương Mai',
    shortName: 'BV Bạch Mai',
    aliases: ['bach mai', 'bạch mai', 'phuong mai', 'phương mai', 'giai phong', 'giải phóng'],
    category: 'HOSPITAL',
    searchQuery: 'Phương Mai',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    areaDescription: 'Khu vực Đống Đa, Phương Mai, Giải Phóng',
  },

  // --- TP. HỒ CHÍ MINH ---
  {
    id: 'hcmut',
    name: 'Đại học Bách Khoa TP.HCM',
    shortName: 'HCMUT',
    aliases: ['hcmut', 'bach khoa tphcm', 'bách khoa hcm', 'tô hiến thành', 'to hien thanh', 'quận 10', 'quan 10'],
    category: 'UNIVERSITY',
    searchQuery: 'Bách Khoa',
    provinceCode: 'HCM',
    provinceName: 'TP. Hồ Chí Minh',
    areaDescription: 'Khu vực Quận 10, Tô Hiến Thành, Lý Thường Kiệt',
  },
  {
    id: 'ftu2',
    name: 'Đại học Ngoại Thương (Cơ sở 2 TP.HCM)',
    shortName: 'FTU2',
    aliases: ['ftu2', 'ftu hcm', 'ngoại thương hcm', 'ngoai thuong hcm', 'bình thạnh', 'binh thanh', 'đường d2', 'duong d2'],
    category: 'UNIVERSITY',
    searchQuery: 'Ngoại Thương',
    provinceCode: 'HCM',
    provinceName: 'TP. Hồ Chí Minh',
    areaDescription: 'Khu vực Bình Thạnh, Đường D2 (Nguyễn Gia Trí)',
  },
  {
    id: 'vnu-itp',
    name: 'Làng Đại học Quốc Gia TP.HCM',
    shortName: 'VNU-HCM',
    aliases: ['lang dai hoc', 'làng đại học', 'thu duc', 'thủ đức', 'linh trung', 'vnu hcm'],
    category: 'UNIVERSITY',
    searchQuery: 'Thủ Đức',
    provinceCode: 'HCM',
    provinceName: 'TP. Hồ Chí Minh',
    areaDescription: 'Khu vực Thủ Đức, Dĩ An, Linh Trung',
  },
  {
    id: 'ben-nghe-q1',
    name: 'Khu trung tâm Bến Nghé - Phố đi bộ Nguyễn Huệ',
    shortName: 'Quận 1',
    aliases: ['quan 1', 'quận 1', 'bến nghé', 'ben nghe', 'nguyễn huệ', 'nguyen hue', 'trung tâm'],
    category: 'LANDMARK',
    searchQuery: 'Quận 1',
    provinceCode: 'HCM',
    provinceName: 'TP. Hồ Chí Minh',
    areaDescription: 'Trung tâm Quận 1, Bến Nghé, Đa Kao',
  },
  {
    id: 'phu-my-hung',
    name: 'Khu đô thị Phú Mỹ Hưng (Quận 7)',
    shortName: 'Phú Mỹ Hưng',
    aliases: ['phu my hung', 'phú mỹ hưng', 'quan 7', 'quận 7', 'tân phong', 'tan phong', 'nguyễn thị thập'],
    category: 'LANDMARK',
    searchQuery: 'Phú Mỹ Hưng',
    provinceCode: 'HCM',
    provinceName: 'TP. Hồ Chí Minh',
    areaDescription: 'Khu vực Quận 7, Tân Phong, Nguyễn Thị Thập',
  },

  // --- ĐÀ NẴNG ---
  {
    id: 'dut',
    name: 'Đại học Bách Khoa - ĐH Đà Nẵng',
    shortName: 'DUT',
    aliases: ['dut', 'bach khoa da nang', 'bách khoa đà nẵng', 'lien chieu', 'liên chiểu'],
    category: 'UNIVERSITY',
    searchQuery: 'Liên Chiểu',
    provinceCode: 'DNG',
    provinceName: 'Đà Nẵng',
    areaDescription: 'Khu vực Liên Chiểu, Tôn Đức Thắng',
  },
  {
    id: 'cau-rong',
    name: 'Cầu Rồng & Trung tâm Hải Châu',
    shortName: 'Hải Châu',
    aliases: ['cau rong', 'cầu rồng', 'hai chau', 'hải châu', 'bạch đằng', 'bach dang'],
    category: 'LANDMARK',
    searchQuery: 'Hải Châu',
    provinceCode: 'DNG',
    provinceName: 'Đà Nẵng',
    areaDescription: 'Trung tâm Hải Châu, ven sông Hàn',
  },
];

export function findMatchingLandmarks(keyword: string, provinceFilter?: string, limit: number = 5): Landmark[] {
  const q = keyword.trim().toLowerCase();
  if (!q) {
    if (provinceFilter) {
      return POPULAR_LANDMARKS.filter((l) => l.provinceCode === provinceFilter).slice(0, limit);
    }
    return POPULAR_LANDMARKS.slice(0, limit);
  }

  return POPULAR_LANDMARKS.filter((l) => {
    if (provinceFilter && l.provinceCode !== 'ALL' && l.provinceCode !== provinceFilter) {
      return false;
    }
    return (
      l.name.toLowerCase().includes(q) ||
      l.shortName.toLowerCase().includes(q) ||
      l.aliases.some((alias) => alias.includes(q) || q.includes(alias)) ||
      l.areaDescription.toLowerCase().includes(q)
    );
  }).slice(0, limit);
}

