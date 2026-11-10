'use client';

import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { matchesSearchQuery } from '@/presentation/utils/search-normalization';
import { cn } from '@/lib/cn';

export interface ComboboxOption {
  value: string;
  label: string;
  count?: number;
  group?: string;
  aliases?: string[];
}

export interface ComboboxProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  disabled = false,
  clearable = true,
  className,
  id: propId,
  ariaLabel,
}: ComboboxProps) {
  const generatedId = useId();
  const comboboxId = propId || generatedId;
  const listboxId = `${comboboxId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(() => options.find((opt) => opt.value === value), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((opt) => matchesSearchQuery(opt.label, query, opt.aliases));
  }, [options, query]);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 40);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector<HTMLElement>(`[data-index="${highlightedIndex}"]`);
      activeEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (optValue: string) => {
    onChange(optValue === value ? undefined : optValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((p) => (p < filteredOptions.length - 1 ? p + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((p) => (p > 0 ? p - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHighlightedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setHighlightedIndex(filteredOptions.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) handleSelect(filteredOptions[highlightedIndex].value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const grouped = useMemo(() => {
    const groups: { [name: string]: ComboboxOption[] } = {};
    for (const opt of filteredOptions) {
      const g = opt.group || 'Danh sách';
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    }
    return Object.entries(groups);
  }, [filteredOptions]);

  let runningIndex = 0;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        id={comboboxId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-medium transition-all text-left shadow-xs outline-none',
          'hover:border-stone-300 dark:hover:border-stone-600 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500',
          disabled && 'opacity-50 cursor-not-allowed bg-stone-50 dark:bg-stone-800'
        )}
      >
        <span className={cn('truncate', !selectedOption && 'text-stone-400 dark:text-stone-500')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 text-stone-400">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Xóa chọn"
              onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
              className="p-1 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[240px] z-50 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
            />
          </div>

          <ul ref={listRef} id={listboxId} role="listbox" className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 text-xs sm:text-sm outline-none">
            {filteredOptions.length === 0 ? (
              <li className="p-3 text-center text-xs text-stone-400">Không tìm thấy kết quả</li>
            ) : (
              grouped.map(([groupTitle, items]) => (
                <li key={groupTitle} className="space-y-0.5">
                  {grouped.length > 1 && (
                    <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      {groupTitle}
                    </div>
                  )}
                  {items.map((opt) => {
                    const itemIdx = runningIndex++;
                    const isSelected = opt.value === value;
                    return (
                      <div
                        key={opt.value}
                        data-index={itemIdx}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(opt.value)}
                        onMouseEnter={() => setHighlightedIndex(itemIdx)}
                        className={cn(
                          'flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors',
                          itemIdx === highlightedIndex && 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white',
                          isSelected && 'font-semibold text-teal-700 dark:text-teal-400'
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {opt.count !== undefined && (
                            <span className="text-[11px] text-stone-400 tabular-nums">{opt.count}</span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                        </div>
                      </div>
                    );
                  })}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
