'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, FileText, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
}

export function FileUpload({
  label,
  accept = 'image/*',
  multiple = false,
  maxSizeMB = 5,
  onFilesSelected,
  className,
}: FileUploadProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setFileNames(filesArray.map((f) => f.name));
    onFilesSelected?.(filesArray);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileNames([]);
    if (inputRef.current) inputRef.current.value = '';
    onFilesSelected?.([]);
  };

  return (
    <div className={cn('w-full space-y-1.5 text-left', className)}>
      {label && (
        <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
          {label}
        </span>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-teal-600 dark:hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/50 dark:bg-stone-900/40"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        {fileNames.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Đã chọn {fileNames.length} tệp
            </p>
            <div className="flex flex-wrap gap-1 max-w-xs justify-center">
              {fileNames.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-600 dark:text-stone-300"
                >
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{name}</span>
                </span>
              ))}
            </div>
            <button
              onClick={handleClear}
              className="mt-2 text-xs text-rose-600 hover:underline inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Chọn lại
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-stone-400 mb-2" />
            <p className="text-xs font-medium text-stone-800 dark:text-stone-200">
              Nhấp hoặc kéo thả tệp vào đây
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Tối đa {maxSizeMB}MB mỗi tệp ({accept})
            </p>
          </>
        )}
      </div>
    </div>
  );
}
