'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Tag, Clock, Sparkles, GraduationCap, Building2, Hospital, Bus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { useHeaderHero } from '@/presentation/contexts/HeaderHeroContext';
import { getRecentSearches, addRecentSearch } from '@/presentation/utils/recent-searches';
import { findMatchingLandmarks, findMatchingDistricts } from '@/shared/landmarks';

const ROOM_CATEGORIES = [
  { id: 'all', labelKey: 'all', typeParam: '', path: '/rooms' },
  { id: 'phong-tro', labelKey: 'phongTro', typeParam: 'SINGLE', path: '/phong-tro' },
  { id: 'nha-nguyen-can', labelKey: 'nhaNguyenCan', typeParam: 'FULL_HOUSE', path: '/nha-nguyen-can' },
  { id: 'can-ho', labelKey: 'canHo', typeParam: 'MINI_APARTMENT', path: '/can-ho' },
  { id: 'o-ghep', labelKey: 'oGhep', typeParam: 'SHARED', path: '/o-ghep' },
];

const DEFAULT_PROVINCES = [
  { code: 'HN', name: 'Hà Nội' },
  { code: 'HCM', name: 'TP. Hồ Chí Minh' },
  { code: 'DNG', name: 'Đà Nẵng' },
  { code: 'HP', name: 'Hải Phòng' },
  { code: 'HUE', name: 'Huế' },
  { code: 'BN', name: 'Bắc Ninh' },
  { code: 'CT', name: 'Cần Thơ' },
];

const QUICK_CHIPS = [
  { id: 'under3m', labelKey: 'under3m', param: 'maxPrice=3000000' },
  { id: 'noLandlord', labelKey: 'noLandlord', param: 'q=không chung chủ' },
  { id: 'privateWc', labelKey: 'privateWc', param: 'q=khép kín' },
  { id: 'freeTime', labelKey: 'freeTime', param: 'q=giờ tự do' },
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

  const matchingDistricts = useMemo(() => {
    return findMatchingDistricts(keyword, provinceCode, keyword ? 3 : 5);
  }, [keyword, provinceCode]);

  const matchingLandmarks = useMemo(() => {
    return findMatchingLandmarks(keyword, provinceCode, keyword ? 3 : 3);
  }, [keyword, provinceCode]);

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
    const targetPath = cat?.path || '/rooms';
    if (provinceCode) query.append('provinceCode', provinceCode);
    if (priceMax) query.append('maxPrice', priceMax);

    const qs = query.toString();
    router.push(`${targetPath}${qs ? `?${qs}` : ''}`);
  };

  const handleCategoryClick = (cat: (typeof ROOM_CATEGORIES)[number]) => {
    setActiveTab(cat.id);
    const query = new URLSearchParams();
    if (keyword.trim()) query.set('q', keyword.trim());
    if (provinceCode) query.set('provinceCode', provinceCode);
    if (priceMax) query.set('maxPrice', priceMax);
    const qs = query.toString();
    router.push(`${cat.path}${qs ? `?${qs}` : ''}`);
  };

  const handleQuickChip = (paramStr: string) => {
    const [key, val] = paramStr.split('=');
    const query = new URLSearchParams();
    query.set(key, val);
    router.push(`/rooms?${query.toString()}`);
  };

  const dynamicPlaceholder = useMemo(() => {
    if (activeTab === 'phong-tro') return 'Tìm phòng trọ theo trường ĐH, khu vực...';
    if (activeTab === 'nha-nguyen-can') return 'Tìm nhà nguyên căn theo khu vực, tên đường...';
    if (activeTab === 'can-ho') return 'Tìm chung cư mini, căn hộ dịch vụ...';
    if (activeTab === 'o-ghep') return 'Tìm phòng ở ghép, bạn cùng phòng...';
    return tSearch('placeholder');
  }, [activeTab, tSearch]);

  const provinces = useMemo(
    () => (hotProvinces.length > 0 ? hotProvinces : DEFAULT_PROVINCES),
    [hotProvinces]
  );

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto flex flex-col items-center relative z-20">
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
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
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
        className="w-full frosted-glass-card rounded-2xl p-2 sm:p-2.5 flex flex-col md:flex-row items-center gap-2 text-xs sm:text-sm text-stone-900 dark:text-stone-100 shadow-2xl relative z-30"
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
            placeholder={dynamicPlaceholder}
            aria-label={dynamicPlaceholder}
            className="w-full bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
          {showRecent && (matchingDistricts.length > 0 || matchingLandmarks.length > 0 || recentList.length > 0) && (
            <div
              onWheel={(e) => {
                const el = e.currentTarget;
                const isScrollingDown = e.deltaY > 0;
                const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;
                const isAtTop = el.scrollTop <= 0;
                if ((isScrollingDown && isAtBottom) || (!isScrollingDown && isAtTop)) {
                  e.preventDefault();
                }
              }}
              className="absolute top-full left-0 mt-1.5 w-full sm:w-[460px] md:w-[500px] max-w-[calc(100vw-2rem)] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl z-50 p-2.5 space-y-2 max-h-[220px] overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(156,163,175,0.4)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-400/40 hover:[&::-webkit-scrollbar-thumb]:bg-stone-400/70"
            >
              {/* Section 1: Khu vực / Quận tìm thuê nhiều nhất */}
              {matchingDistricts.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 px-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>Khu vực tìm thuê nhiều</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">HN • HCM • ĐN</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {matchingDistricts.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onMouseDown={() => {
                          setKeyword(d.searchQuery);
                          setProvinceCode(d.provinceCode);
                          setShowRecent(false);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-stone-800 dark:text-stone-200 hover:text-teal-700 dark:hover:text-teal-300 transition-colors border border-stone-200/60 dark:border-stone-700/60 cursor-pointer"
                      >
                        <MapPin className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{d.name}</span>
                        {d.badge && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold">
                            {d.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Địa điểm, Trường ĐH & Khu văn phòng */}
              {matchingLandmarks.length > 0 && (
                <div className="space-y-1 pt-1.5 border-t border-stone-100 dark:border-stone-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 px-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      <span>Địa điểm nổi bật</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">Trường ĐH • Văn phòng</span>
                  </div>
                  <div className="space-y-0.5">
                    {matchingLandmarks.map((lm) => (
                      <button
                        key={lm.id}
                        type="button"
                        onMouseDown={() => {
                          setKeyword(lm.searchQuery);
                          if (lm.provinceCode && lm.provinceCode !== 'ALL') {
                            setProvinceCode(lm.provinceCode);
                          }
                          setShowRecent(false);
                        }}
                        className="w-full text-left px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-2 group cursor-pointer"
                      >
                        <div className="w-5 h-5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                          {lm.category === 'UNIVERSITY' ? (
                            <GraduationCap className="w-3 h-3" />
                          ) : lm.category === 'HOSPITAL' ? (
                            <Hospital className="w-3 h-3" />
                          ) : lm.category === 'STATION' ? (
                            <Bus className="w-3 h-3" />
                          ) : (
                            <Building2 className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-teal-700 dark:group-hover:text-teal-400">
                            {lm.name}
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                            {lm.areaDescription}
                          </div>
                        </div>
                        <span className="text-[9px] text-stone-400 shrink-0 font-medium px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800">
                          {lm.provinceName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Recent searches */}
              {recentList.length > 0 && (
                <div className="space-y-1 pt-1.5 border-t border-stone-100 dark:border-stone-800">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 px-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{tSearch('recentSearches')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recentList.slice(0, 3).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={() => {
                          setKeyword(item);
                          setShowRecent(false);
                        }}
                        className="px-2 py-0.5 text-xs rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-2.5 h-2.5 text-stone-400" />
                        <span className="truncate max-w-[140px]">{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 w-full relative z-10">
        <span className="text-[11px] font-medium text-stone-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-400" />
          {tHero('quickSearch')}:
        </span>
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => handleQuickChip(chip.param)}
            className="text-xs px-3 py-1 rounded-full bg-stone-900/60 hover:bg-teal-700 text-stone-200 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
          >
            {tHero(`chips.${chip.labelKey}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
