'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';

export interface ImageRevealProps {
  children: ReactNode;
  direction?: 'bottom' | 'right' | 'circle';
  durationMs?: number;
  delayMs?: number;
  className?: string;
}

export const ImageReveal: React.FC<ImageRevealProps> = ({
  children,
  direction = 'bottom',
  durationMs = 800,
  delayMs = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const getClipPath = (visible: boolean): string => {
    if (!visible) {
      if (direction === 'bottom') return 'inset(0 0 100% 0 round 1rem)';
      if (direction === 'right') return 'inset(0 100% 0 0 round 1rem)';
      return 'circle(0% at 50% 50%)';
    }
    if (direction === 'circle') return 'circle(150% at 50% 50%)';
    return 'inset(0 0 0 0 round 1rem)';
  };

  const style: React.CSSProperties = isClient
    ? {
        clipPath: getClipPath(isVisible),
        WebkitClipPath: getClipPath(isVisible),
        transition: `clip-path ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms, -webkit-clip-path ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms`,
        willChange: isVisible ? 'auto' : 'clip-path',
      }
    : {
        clipPath: 'none',
        WebkitClipPath: 'none',
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

