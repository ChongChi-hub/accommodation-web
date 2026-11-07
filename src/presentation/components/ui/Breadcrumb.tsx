'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs py-2', className)}>
      <ol className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            aria-label="Trang chủ"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

