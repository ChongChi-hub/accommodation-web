export function normalizeVietnamese(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export const PROVINCE_ALIASES_MAP: Record<string, string[]> = {
  HN: ['ha noi', 'hn', 'thu do', 'hanoi'],
  HCM: ['ho chi minh', 'hcm', 'tphcm', 'sai gon', 'saigon', 'tp ho chi minh'],
  DN: ['da nang', 'dn', 'danang'],
  BD: ['binh duong', 'bd', 'binhduong'],
  VT: ['ba ria vung tau', 'vung tau', 'vt', 'ba ria'],
  CT: ['can tho', 'ct', 'cantho'],
  HUE: ['thua thien hue', 'hue', 'tthue'],
  HP: ['hai phong', 'hp', 'haiphong'],
};

export function getProvinceAliases(codeOrName: string): string[] {
  const norm = normalizeVietnamese(codeOrName);
  for (const [code, aliases] of Object.entries(PROVINCE_ALIASES_MAP)) {
    if (code.toLowerCase() === norm || aliases.some((a) => normalizeVietnamese(a) === norm)) {
      return [code, ...aliases];
    }
  }
  return [];
}

export function matchesSearchQuery(
  targetText: string,
  searchQuery: string,
  extraAliases: string[] = []
): boolean {
  const normQuery = normalizeVietnamese(searchQuery);
  if (!normQuery) return true;

  const normTarget = normalizeVietnamese(targetText);
  if (normTarget.includes(normQuery)) return true;

  return extraAliases.some((alias) => normalizeVietnamese(alias).includes(normQuery));
}
