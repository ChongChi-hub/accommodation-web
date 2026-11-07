'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 dark:bg-stone-800 -z-0" />
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 border-2',
                  isDone
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : isCurrent
                    ? 'bg-white dark:bg-stone-900 border-teal-700 text-teal-700 dark:text-teal-400 ring-4 ring-teal-100 dark:ring-teal-950'
                    : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-400'
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="text-center mt-2">
                <p
                  className={cn(
                    'text-xs font-medium',
                    isCurrent
                      ? 'text-teal-800 dark:text-teal-300 font-semibold'
                      : isDone
                      ? 'text-stone-800 dark:text-stone-200'
                      : 'text-stone-400'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-[10px] text-stone-400 hidden sm:block">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

