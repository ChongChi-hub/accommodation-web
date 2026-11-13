export function formatVnd(amount: number | string | null | undefined): string {
  const num = typeof amount === 'number' ? amount : Number(amount ?? 0);
  if (!Number.isFinite(num)) return '0 đ';
  return `${Math.round(num).toLocaleString('vi-VN')} đ`;
}

export function formatIsoDate(value?: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('vi-VN');
}

export function formatIsoDateTime(value?: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function numberToVietnameseWords(n: number | string | null | undefined): string {
  const num = typeof n === 'number' ? n : Number(n ?? 0);
  if (!Number.isFinite(num) || num <= 0) return 'Không đồng';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readGroup(group: number, showZeroHundred: boolean): string {
    const h = Math.floor(group / 100);
    const t = Math.floor((group % 100) / 10);
    const u = group % 10;
    let res = '';
    if (h > 0 || showZeroHundred) res += `${units[h]} trăm `;
    if (t > 1) {
      res += `${units[t]} mươi `;
      if (u === 1) res += 'mốt ';
      else if (u === 5) res += 'lăm ';
      else if (u > 0) res += `${units[u]} `;
    } else if (t === 1) {
      res += 'mười ';
      if (u === 5) res += 'lăm ';
      else if (u > 0) res += `${units[u]} `;
    } else if (h > 0 && u > 0) {
      res += `lẻ ${units[u]} `;
    } else if (u > 0) {
      res += `${units[u]} `;
    }
    return res.trim();
  }

  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];
  let temp = Math.round(num);
  const groups: number[] = [];
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const gStr = readGroup(g, i < groups.length - 1);
      result += `${gStr} ${scales[i]} `;
    }
  }

  result = result.trim();
  if (!result) return 'Không đồng';
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
}

export function generateIdempotencyKey(prefix = 'req'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
