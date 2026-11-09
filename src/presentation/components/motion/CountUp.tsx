'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface CountUpProps {
  target: number;
  durationMs?: number;
  locale?: string;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  target,
  durationMs = 1200,
  locale = 'vi-VN',
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [currentVal, setCurrentVal] = useState<number>(target);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Instantly show final number if prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCurrentVal(target);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setCurrentVal(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.unobserve(entry.target);

          const startTime = performance.now();
          const startVal = 0;

          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Ease-out cubic: 1 - (1 - t)^3
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const val = Math.round(startVal + (target - startVal) * easeOut);
            setCurrentVal(val);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCurrentVal(target);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -5% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, durationMs, hasAnimated]);

  const formatter = new Intl.NumberFormat(locale);
  const displayString = `${prefix}${formatter.format(currentVal)}${suffix}`;

  return (
    <span ref={ref} className={className}>
      {displayString}
    </span>
  );
};

