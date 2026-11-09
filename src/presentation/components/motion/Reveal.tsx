'use client';

import React, { ElementType, ReactNode, useEffect, useRef, useState } from 'react';

export type RevealVariant = 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight';

export interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delayMs?: number;
  durationMs?: number;
  className?: string;
  as?: ElementType;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'fadeUp',
  delayMs = 0,
  durationMs = 600,
  className = '',
  as: Component = 'div',
  threshold = 0.01,
  rootMargin = '150px 0px 150px 0px',
  triggerOnce = true,
}) => {
  const ref = useRef<HTMLElement>(null);
  // Default to visible so no-JS and SSR show content immediately
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion or test flag
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (window as unknown as { __REVEAL_ALL__?: boolean }).__REVEAL_ALL__
    ) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    // If already in initial viewport, reveal immediately without waiting
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  // Progressive style calculation
  const getHiddenTransform = (): string => {
    switch (variant) {
      case 'fadeUp':
        return 'translateY(24px)';
      case 'scaleIn':
        return 'scale(0.96)';
      case 'slideLeft':
        return 'translateX(-24px)';
      case 'slideRight':
        return 'translateX(24px)';
      case 'fadeIn':
      default:
        return 'none';
    }
  };

  const isAnimated = isClient;
  const style: React.CSSProperties = isAnimated
    ? {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getHiddenTransform(),
        transition: `opacity ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms`,
        willChange: isVisible ? 'auto' : 'transform, opacity',
      }
    : {
        opacity: 1,
        transform: 'none',
      };

  return (
    <Component ref={ref} className={className} style={style}>
      {children}
    </Component>
  );
};
