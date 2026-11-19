'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { POPULAR_VIETNAM_BANKS, SupportedBank } from '@/domain/entities/BankAccount';
import { Building2, Check, ChevronDown, Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (bankCode: string) => void;
}

function normalizeSearch(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

const TOP_QUICK_CODES = ['VCB', 'MB', 'TCB', 'ICB', 'BIDV', 'ACB', 'VPB', 'TPB', 'VBA', 'STB'];

export function BankSearchCombobox({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedBank = useMemo(
    () => POPULAR_VIETNAM_BANKS.find((b) => b.code === value) || POPULAR_VIETNAM_BANKS[0],
    [value]
  );

  const filteredBanks = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return POPULAR_VIETNAM_BANKS;
    return POPULAR_VIETNAM_BANKS.filter((b) => {
      const target = normalizeSearch(`${b.code} ${b.shortName} ${b.name} ${b.bin}`);
      return target.includes(q);
    });
  }, [query]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (bank: SupportedBank) => {
    onChange(bank.code);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((prev) => (filteredBanks.length > 0 ? (prev + 1) % filteredBanks.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((prev) => (filteredBanks.length > 0 ? (prev - 1 + filteredBanks.length) % filteredBanks.length : 0));
    } else if (e.key === 'Enter' && filteredBanks[highlightIdx]) {
      e.preventDefault();
      handleSelect(filteredBanks[highlightIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <div
        className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus-within:ring-2 focus-within:ring-teal-500 flex items-center gap-2 cursor-text"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : `${selectedBank.shortName} (${selectedBank.code}) - ${selectedBank.name}`}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Gõ tên viết tắt hoặc tên ngân hàng để tìm nhanh (VD: VCB, Tech, MB, Agribank...)"
          className="w-full bg-transparent focus:outline-none text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
        />
        {isOpen && query ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }}
            className="text-stone-400 hover:text-stone-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-stone-400 mr-0.5">Chọn nhanh:</span>
        {TOP_QUICK_CODES.map((code) => {
          const active = value === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onChange(code)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors border ${
                active
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-teal-500'
              }`}
            >
              {code}
            </button>
          );
        })}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl divide-y divide-stone-100 dark:divide-stone-800">
          {filteredBanks.length === 0 ? (
            <div className="p-3 text-center text-xs text-stone-500">
              Không tìm thấy ngân hàng phù hợp với &quot;{query}&quot;
            </div>
          ) : (
            filteredBanks.map((b, idx) => {
              const isSelected = b.code === value;
              const isHighlighted = idx === highlightIdx;
              return (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => handleSelect(b)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between gap-2 transition-colors ${
                    isHighlighted
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-stone-900 dark:text-stone-100">{b.shortName}</span>{' '}
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-teal-700 dark:text-teal-300 font-semibold">
                        {b.code}
                      </span>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{b.name}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
