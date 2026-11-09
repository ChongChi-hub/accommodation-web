'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Tag } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { useHeaderHero } from '@/presentation/contexts/HeaderHeroContext';
import { addRecentSearch } from '@/presentation/utils/recent-searches';

interface HomeHeroSearchProps {
  hotProvinces?: { code: string; name: string }[];
}

export function HomeHeroSearch({ hotProvinces = [] }: HomeHeroSearchProps) {
  const tSearch = useTranslations('search');
  const router = useRouter();
  const { setHeroSearchInView } = useHeaderHero();
  const containerRef = useRef<HTMLFormElement>(null);

  const [keyword, setKeyword] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [priceMax, setPriceMax] = useState('');

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
    const query = new URLSearchParams();
    if (keyword.trim()) {
      addRecentSearch(keyword.trim());
      query.append('q', keyword.trim());
    }
    if (provinceCode) query.append('provinceCode', provinceCode);
    if (priceMax) query.append('maxPrice', priceMax);

    const qs = query.toString();
    router.push(`/rooms${qs ? `?${qs}` : ''}`);
  };

  const provinceOptions =
    hotProvinces.length > 0
      ? hotProvinces
      : [
          { code: 'HN', name: 'Hà Nội' },
          { code: 'HCM', name: 'TP. Hồ Chí Minh' },
          { code: 'DNG', name: 'Đà Nẵng' },
          { code: 'HP', name: 'Hải Phòng' },
          { code: 'CT', name: 'Cần Thơ' },
          { code: 'HUE', name: 'Huế' },
        ];

  return (
    <form
      ref={containerRef}
      onSubmit={handleSearch}
      data-testid="hero-search-form"
      className="rounded-2xl bg-white dark:bg-stone-900 p-2.5 shadow-2xl shadow-black/25 dark:shadow-none border border-stone-200/80 dark:border-stone-800 flex flex-col md:flex-row gap-2 items-center text-xs text-stone-900 dark:text-stone-100"
    >
      <div className="flex items-center gap-2 px-3 py-2 w-full md:flex-1 text-stone-500 border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-800">
        <Search size={16} className="text-primary dark:text-primary-400 shrink-0" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={tSearch('placeholder')}
          aria-label={tSearch('placeholder')}
          className="w-full bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 w-full md:w-44 text-stone-500 border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-800">
        <MapPin size={16} className="text-primary dark:text-primary-400 shrink-0" />
        <select
          value={provinceCode}
          onChange={(e) => setProvinceCode(e.target.value)}
          aria-label="Chọn khu vực"
          className="w-full bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
        >
          <option value="">Tất cả tỉnh/thành</option>
          {provinceOptions.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 w-full md:w-44 text-stone-500">
        <Tag size={16} className="text-primary dark:text-primary-400 shrink-0" />
        <select
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          aria-label="Chọn mức giá"
          className="w-full bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
        >
          <option value="">Mức giá bất kỳ</option>
          <option value="3000000">Dưới 3 triệu</option>
          <option value="5000000">Dưới 5 triệu</option>
          <option value="8000000">Dưới 8 triệu</option>
          <option value="12000000">Dưới 12 triệu</option>
        </select>
      </div>

      <Button type="submit" variant="primary" size="md" className="w-full md:w-auto px-6 cursor-pointer">
        Tìm phòng
      </Button>
    </form>
  );
}
