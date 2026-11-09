'use client';

import React, { useEffect, useState } from 'react';

export interface ScrollProgressProps {
  className?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className = '',
}) => {
  const [progress, setProgress] = useState(0);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsDisabled(true);
      return;
    }
    setIsDisabled(false);

    let frameId: number;

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) {
          setProgress(0);
          return;
        }
        const currentProgress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
        setProgress(currentProgress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (isDisabled) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed top-[72px] left-0 right-0 h-[2px] z-40 pointer-events-none bg-transparent ${className}`}
    >
      <div
        className="h-full bg-primary-600 origin-left transition-transform duration-75"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};

