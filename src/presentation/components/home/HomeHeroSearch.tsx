'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Tag, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { useHeaderHero } from '@/presentation/contexts/HeaderHeroContext';
import { getRecentSearches, addRecentSearch } from '@/presentation/utils/recent-searches';

const ROOM_CATEGORIES = [
  { id: 'all', labelKey: 'all', typeParam: '' },
  { id: 'phong-tro', labelKey: 'phongTro', typeParam: 'SINGLE' },
  { id: 'nha-nguyen-can', labelKey: 'nhaNguyenCan', typeParam: 'FULL_HOUSE' },
  { id: 'can-ho', labelKey: 'canHo', typeParam: 'MINI_APARTMENT' },
  { id: 'o-ghep', labelKey: 'oGhep', typeParam: 'SHARED' },
];

const DEFAULT_PROVINCES = [
  { code: 'HN', name: 'Hà Nội' },
  { code: 'HCM', name: 'TP. Hồ Chí Minh' },
  { code: 'DNG', name: 'Đà Nẵng' },
  { code: 'HP', name: 'Hải Phòng' },
  { code: 'HUE', name: 'Thừa Thiên Huế' },
  { code: 'BDG', name: 'Bình Dương' },
  { code: 'BN', name: 'Bắc Ninh' },
  { code: 'CT', name: 'Cần Thơ' },
];

const QUICK_CHIPS = [
  { id: 'under3m', labelKey: 'under3m', param: 'maxPrice=3000000' },
  { id: 'loft', labelKey: 'loft', param: 'q=gác lửng' },
  { id: 'pets', labelKey: 'pets', param: 'allowPets=true' },
  { id: 'balcony', labelKey: 'balcony', param: 'q=ban công' },
];

interface HomeHeroSearchProps {
  hotProvinces?: { code: string; name: string }[];
}

export function HomeHeroSearch({ hotProvinces = [] }: HomeHeroSearchProps) {
  const tSearch = useTranslations('search');
  const tHero = useTranslations('hero');
  const router = useRouter();
  const { setHeroSearchInView } = useHeaderHero();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const [recentList, setRecentList] = useState<string[]>([]);

  useEffect(() => {
    setRecentList(getRecentSearches());
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroSearchInView(entry.isIntersecting);
      },
      { rootMargin: '-72px 0px 0px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setHeroSearchInView(false);
    };
  }, [setHeroSearchInView]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRecent(false);
    const query = new URLSearchParams();
    if (keyword.trim()) {
      addRecentSearch(keyword.trim());
      query.append('q', keyword.trim());
    }
    const cat = ROOM_CATEGORIES.find((c) => c.id === activeTab);
    if (cat?.typeParam) {
      query.append('roomType', cat.typeParam);
    }
    if (provinceCode) query.append('provinceCode', provinceCode);
    if (priceMax) query.append('maxPrice', priceMax);

    const qs = query.toString();
    router.push(`/rooms${qs ? `?${qs}` : ''}`);
  };

  const handleQuickChip = (paramStr: string) => {
    const [key, val] = paramStr.split('=');
    const query = new URLSearchParams();
    query.set(key, val);
    router.push(`/rooms?${query.toString()}`);
  };

  const provinces = useMemo(
    () => (hotProvinces.length > 0 ? hotProvinces : DEFAULT_PROVINCES),
    [hotProvinces]
  );

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Category Tabs */}
      <div
        role="tablist"
        aria-label="Loại hình lưu trú"
        className="flex items-center gap-1.5 p-1 bg-stone-900/60 backdrop-blur-md rounded-2xl border border-white/15 mb-3"
      >
        {ROOM_CATEGORIES.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tHero(`tabs.${cat.labelKey}`)}
            </button>
          );
        })}
      </div>

      {/* Main Search Card */}
      <form
        onSubmit={handleSearch}
        data-testid="hero-search-form"
        className="w-full frosted-glass-card rounded-2xl p-2 sm:p-2.5 flex flex-col md:flex-row items-center gap-2 text-xs sm:text-sm text-stone-900 dark:text-stone-100 shadow-2xl relative"
      >
        {/* Keyword Combobox */}
        <div className="relative flex items-center gap-2 px-3 py-2 w-full md:flex-1 border-b md:border-b-0 md:border-r border-stone-200/60 dark:border-stone-700/60">
          <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            placeholder={tSearch('placeholder')}
            aria-label={tSearch('placeholder')}
            className="w-full bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
          {showRecent && recentList.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl z-50 p-2">
              <div className="text-[11px] font-semibold text-stone-400 px-2 py-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {tSearch('recentSearches')}
              </div>
              {recentList.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={() => {
                    setKeyword(item);
                    setShowRecent(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between"
                >
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Province Combobox */}
        <div className="flex items-center gap-2 px-3 py-2 w-full md:w-48 border-b md:border-b-0 md:border-r border-stone-200/60 dark:border-stone-700/60">
          <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <select
            value={provinceCode}
            onChange={(e) => setProvinceCode(e.target.value)}
            aria-label="Chọn khu vực"
            className="w-full bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
          >
            <option value="" className="text-stone-900 dark:text-stone-900">
              {tSearch('allProvinces')}
            </option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code} className="text-stone-900 dark:text-stone-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Preset Selector */}
        <div className="flex items-center gap-2 px-3 py-2 w-full md:w-44">
          <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <select
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            aria-label="Chọn mức giá tối đa"
            className="w-full bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
          >
            <option value="" className="text-stone-900 dark:text-stone-900">
              {tSearch('anyPrice')}
            </option>
            <option value="3000000" className="text-stone-900 dark:text-stone-900">
              {tSearch('priceUnder3m')}
            </option>
            <option value="5000000" className="text-stone-900 dark:text-stone-900">
              {tSearch('priceUnder5m')}
            </option>
            <option value="8000000" className="text-stone-900 dark:text-stone-900">
              {tSearch('priceUnder8m')}
            </option>
            <option value="12000000" className="text-stone-900 dark:text-stone-900">
              {tSearch('priceUnder12m')}
            </option>
          </select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full md:w-auto px-6 py-2.5 font-semibold shrink-0 cursor-pointer shadow-lg shadow-teal-700/20"
        >
          {tSearch('submit')}
        </Button>
      </form>

      {/* Quick Search Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 w-full">
        <span className="text-[11px] font-medium text-stone-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-400" />
          {tHero('quickSearch')}:
        </span>
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => handleQuickChip(chip.param)}
            className="text-xs px-3 py-1 rounded-full bg-stone-900/60 hover:bg-teal-700/80 text-stone-200 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
          >
            {tHero(`chips.${chip.labelKey}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
