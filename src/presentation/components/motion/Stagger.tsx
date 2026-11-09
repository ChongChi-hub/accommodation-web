'use client';

import React, { Children, ReactNode, isValidElement } from 'react';
import { Reveal, RevealVariant } from './Reveal';

export interface StaggerProps {
  children: ReactNode;
  staggerDelayMs?: number;
  baseDelayMs?: number;
  maxStaggerCount?: number;
  variant?: RevealVariant;
  durationMs?: number;
  className?: string;
  itemClassName?: string;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  staggerDelayMs = 70,
  baseDelayMs = 0,
  maxStaggerCount = 8,
  variant = 'fadeUp',
  durationMs = 550,
  className = '',
  itemClassName = '',
}) => {
  const childArray = Children.toArray(children);

  return (
    <div className={className}>
      {childArray.map((child, index) => {
        const clampedIndex = Math.min(index, maxStaggerCount);
        const delay = baseDelayMs + clampedIndex * staggerDelayMs;

        if (!isValidElement(child)) {
          return child;
        }

        return (
          <Reveal
            key={child.key || index}
            variant={variant}
            delayMs={delay}
            durationMs={durationMs}
            className={itemClassName}
          >
            {child}
          </Reveal>
        );
      })}
    </div>
  );
};

