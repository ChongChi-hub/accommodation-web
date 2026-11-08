'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Search, MapPin, Tag } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

interface HomeHeroSearchProps {
  hotProvinces?: { code: string; name: string }[];
}

export function HomeHeroSearch({ hotProvinces = [] }: HomeHeroSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (keyword.trim()) query.append('q', keyword.trim());
    if (provinceCode) query.append('provinceCode', provinceCode);
    if (priceMax) query.append('maxPrice', priceMax);

    const qs = query.toString();
    router.push(`/rooms${qs ? `?${qs}` : ''}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="rounded-2xl bg-white dark:bg-stone-900 p-2.5 shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-200/80 dark:border-stone-800 flex flex-col md:flex-row gap-2 items-center text-xs"
    >
      <div className="flex items-center gap-2 px-3 py-2 w-full md:flex-1 text-stone-500 border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-800">
        <Search size={16} className="text-teal-700 dark:text-teal-400 shrink-0" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo phố, phường/xã, tên phòng trọ..."
          className="w-full bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 w-full md:w-44 text-stone-500 border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-800">
        <MapPin size={16} className="text-teal-700 dark:text-teal-400 shrink-0" />
        <select
          value={provinceCode}
          onChange={(e) => setProvinceCode(e.target.value)}
          className="w-full bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
        >
          <option value="">Tất cả tỉnh/thành</option>
          <option value="HN">Hà Nội</option>
          <option value="HCM">TP. Hồ Chí Minh</option>
          <option value="DNG">Đà Nẵng</option>
          <option value="HP">Hải Phòng</option>
          <option value="CT">Cần Thơ</option>
          <option value="HUE">Huế</option>
        </select>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 w-full md:w-44 text-stone-500">
        <Tag size={16} className="text-teal-700 dark:text-teal-400 shrink-0" />
        <select
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className="w-full bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
        >
          <option value="">Mức giá bất kỳ</option>
          <option value="3000000">Dưới 3 triệu</option>
          <option value="5000000">Dưới 5 triệu</option>
          <option value="8000000">Dưới 8 triệu</option>
          <option value="12000000">Dưới 12 triệu</option>
        </select>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full md:w-auto px-6 cursor-pointer"
      >
        Tìm phòng
      </Button>
    </form>
  );
}

