'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';

export interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number; // 0.25 means translates 25% of scroll delta
  className?: string;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 0.25,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Disable on reduced motion or touch/coarse pointer
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isReduced || isCoarse) {
      setIsDisabled(true);
      return;
    }
    setIsDisabled(false);

    let animationFrameId: number;

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        // Only compute if within view
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          const scrollY = window.scrollY || window.pageYOffset;
          setOffsetY(scrollY * speed);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  const style: React.CSSProperties = !isDisabled
    ? {
        transform: `translate3d(0, ${offsetY}px, 0)`,
        willChange: 'transform',
      }
    : {
        transform: 'none',
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

