'use client';

import React, { useRef, useState } from 'react';
import { Input } from '@/presentation/components/ui/Input';
import { toast } from '@/presentation/stores/toast.store';
import { CheckCircle2, FileCheck2, Lock, UploadCloud, X } from 'lucide-react';

interface Props {
  bankTxCode: string;
  setBankTxCode: (v: string) => void;
  receiptHash: string;
  setReceiptHash: (v: string) => void;
  receiptImageUrl: string;
  setReceiptImageUrl: (v: string) => void;
  disabled?: boolean;
}

export function isValidBankTxCode(raw: string): boolean {
  const cleaned = raw.trim().toUpperCase();
  if (cleaned.length < 6 || cleaned.length > 30) return false;
  if (!/^[A-Z0-9-]+$/.test(cleaned)) return false;
  if (!/[0-9]/.test(cleaned)) return false;
  if (/^(.)\1{5,}$/.test(cleaned)) return false;
  if (['123456', '1234567', '12345678', '123456789', '654321'].includes(cleaned)) return false;
  return true;
}

function compressReceiptImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth < 120 || img.naturalHeight < 120) {
        reject(new Error('Kích thước ảnh biên lai quá nhỏ hoặc không phải ảnh chụp màn hình giao dịch'));
        return;
      }
      const maxDim = 860;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => reject(new Error('File ảnh biên lai bị lỗi hoặc không đọc được'));
    img.src = dataUrl;
  });
}

export function TransferReceiptVerificationBox({
  bankTxCode,
  setBankTxCode,
  receiptHash,
  setReceiptHash,
  receiptImageUrl,
  setReceiptImageUrl,
  disabled = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');

  const txValid = isValidBankTxCode(bankTxCode);
  const receiptValid = Boolean(receiptHash && receiptImageUrl && receiptImageUrl.length > 20);
  const allVerified = txValid && receiptValid;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh biên lai chuyển khoản (.png, .jpg, .webp)');
      return;
    }
    if (file.size < 2048) {
      toast.error('File ảnh biên lai không hợp lệ (dung lượng quá nhỏ)');
      return;
    }
    try {
      const arrayBuf = await file.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', arrayBuf);
      const hashHex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 32);

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
          const compressed = await compressReceiptImage(rawDataUrl);
          setFileName(file.name);
          setReceiptHash(`sha256-${hashHex}`);
          setReceiptImageUrl(compressed);
          toast.success('Đã tải và kiểm tra ảnh biên lai chuyển khoản hợp lệ!');
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'Ảnh biên lai không hợp lệ');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Không thể đọc file ảnh biên lai');
    }
  };

  const clearReceipt = () => {
    setFileName('');
    setReceiptHash('');
    setReceiptImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-teal-200 dark:border-teal-800 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
          {allVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
          <span>Xác thực giao dịch đã chuyển khoản vào tài khoản Sàn</span>
        </p>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            allVerified
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
          }`}
        >
          {allVerified ? 'ĐÃ MỞ KHÓA NÚT XÁC NHẬN' : 'BẮT BUỘC KHI CHUYỂN XONG'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300">
            1. Mã giao dịch ngân hàng (FT / UNC trên bill) *
          </label>
          <Input
            type="text"
            disabled={disabled}
            placeholder="VD: FT261119849201"
            value={bankTxCode}
            onChange={(e) => setBankTxCode(e.target.value.toUpperCase())}
          />
          {bankTxCode && !txValid && (
            <p className="text-[10px] text-rose-600">Mã GD cần ít nhất 6 ký tự chuẩn ngân hàng (không trùng lặp)</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300">
            2. Ảnh chụp biên lai chuyển khoản thành công *
          </label>
          <input ref={fileInputRef} type="file" accept="image/*" disabled={disabled} onChange={handleFileChange} className="hidden" />
          {!receiptImageUrl ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-teal-400 dark:border-teal-700 bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50 text-teal-800 dark:text-teal-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-teal-600" />
              <span>Tải ảnh biên lai chuyển khoản</span>
            </button>
          ) : (
            <div className="flex items-center justify-between p-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 min-w-0">
                <img src={receiptImageUrl} alt="Receipt preview" className="w-8 h-8 object-cover rounded border border-stone-200" />
                <div className="truncate">
                  <p className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 truncate flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    {fileName}
                  </p>
                </div>
              </div>
              <button type="button" onClick={clearReceipt} className="p-1 text-stone-400 hover:text-rose-600" title="Xóa ảnh">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
