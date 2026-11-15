import jsQR from 'jsqr';

export interface ParsedCccdQr {
  idNumber: string;
  oldIdNumber?: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender?: string;
  address?: string;
  issueDate: string; // YYYY-MM-DD
  issuePlace: string;
  raw: string;
}

/**
 * Format chuỗi ngày tháng ddMMyyyy sang YYYY-MM-DD chuẩn cho input type="date"
 */
export function formatCccdDate(raw: string): string {
  if (!raw || raw.length !== 8) return '';
  const day = raw.substring(0, 2);
  const month = raw.substring(2, 4);
  const year = raw.substring(4, 8);
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (isNaN(d) || isNaN(m) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) {
    return '';
  }
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Phân tích chuỗi QR trên Căn cước công dân gắn chip Việt Nam
 * Cấu trúc chuẩn của Bộ Công An (7 trường, phân tách bởi dấu '|'):
 * Số CCCD|Số CMND 9 số cũ (nếu có)|Họ và tên|Ngày sinh (ddMMyyyy)|Giới tính|Địa chỉ thường trú|Ngày cấp (ddMMyyyy)
 */
export function parseCccdQr(rawText: string): ParsedCccdQr | null {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.trim();
  const parts = text.split('|');

  // Chuẩn 7 trường (phổ biến nhất)
  if (parts.length >= 7) {
    const idNumber = parts[0].trim();
    if (!/^\d{12}$/.test(idNumber)) return null;

    const oldIdNumber = parts[1].trim();
    const fullName = parts[2].trim().toUpperCase();
    const dobRaw = parts[3].trim();
    const gender = parts[4].trim();
    const address = parts[5].trim();
    const issueDateRaw = parts[6].trim();

    return {
      idNumber,
      oldIdNumber: oldIdNumber || undefined,
      fullName,
      dateOfBirth: formatCccdDate(dobRaw),
      gender: gender || undefined,
      address: address || undefined,
      issueDate: formatCccdDate(issueDateRaw),
      issuePlace: 'Cục Cảnh sát QLHC về TTXH',
      raw: text,
    };
  }

  // Định dạng 6 trường (trường hợp không có CMND cũ trong danh sách phân tách)
  if (parts.length === 6) {
    const idNumber = parts[0].trim();
    if (!/^\d{12}$/.test(idNumber)) return null;

    const fullName = parts[1].trim().toUpperCase();
    const dobRaw = parts[2].trim();
    const gender = parts[3].trim();
    const address = parts[4].trim();
    const issueDateRaw = parts[5].trim();

    return {
      idNumber,
      fullName,
      dateOfBirth: formatCccdDate(dobRaw),
      gender: gender || undefined,
      address: address || undefined,
      issueDate: formatCccdDate(issueDateRaw),
      issuePlace: 'Cục Cảnh sát QLHC về TTXH',
      raw: text,
    };
  }

  return null;
}

/**
 * Quét và giải mã QR từ đối tượng ImageData
 */
export function decodeQrFromImageData(imageData: ImageData): ParsedCccdQr | null {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    if (code && code.data) {
      return parseCccdQr(code.data);
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Quét mã QR trực tiếp từ file ảnh (JPG, PNG, WebP)
 * Tự động scale ảnh nếu ảnh chụp có độ phân giải quá cao để tăng tốc độ nhận diện
 */
export async function decodeQrFromImageFile(file: File): Promise<ParsedCccdQr | null> {
  return new Promise((resolve) => {
    if (!file || typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          // Thử quét ở kích thước tối ưu (max width/height 1200px)
          const maxDim = 1200;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const result = decodeQrFromImageData(imageData);
          if (result) {
            resolve(result);
            return;
          }

          // Nếu chưa tìm thấy và ảnh bị scale, thử thêm lần nữa ở kích thước gốc nếu không quá khổng lồ
          if ((width !== img.width || height !== img.height) && img.width <= 2500 && img.height <= 2500) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const origData = ctx.getImageData(0, 0, img.width, img.height);
            const origResult = decodeQrFromImageData(origData);
            resolve(origResult);
            return;
          }

          resolve(null);
        } catch {
          resolve(null);
        }
      };

      img.onerror = () => resolve(null);
      img.src = src;
    };

    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

