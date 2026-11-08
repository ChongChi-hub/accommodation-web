'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { id: 'gallery', label: 'Hình ảnh' },
  { id: 'overview', label: 'Tổng quan' },
  { id: 'description', label: 'Mô tả & Nội quy' },
  { id: 'amenities', label: 'Tiện nghi' },
  { id: 'pricing', label: 'Chi phí dịch vụ' },
  { id: 'location', label: 'Vị trí' },
  { id: 'reviews', label: 'Đánh giá' },
];

export function RoomInPageNav() {
  const [activeId, setActiveId] = useState<string>('gallery');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const offset = 140;

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop - offset;
          if (scrollY >= top) {
            setActiveId(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="Điều hướng trong trang chi tiết"
      className="hidden md:block sticky top-16 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 py-2.5 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-semibold">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full transition-all duration-150 inline-block select-none cursor-pointer',
                    isActive
                      ? 'bg-teal-700 text-white shadow-2xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                  )}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
