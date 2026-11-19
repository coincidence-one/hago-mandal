import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pitcher' | 'batter' | 'two-way' | 'vision' | 'neutral';
  className?: string;
}

const VARIANT_STYLES: Record<NonNullable<BadgeProps['variant']>, string> = {
  pitcher:
    'border-sky-400/40 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.15)]',
  batter:
    'border-rose-400/40 bg-rose-500/15 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
  'two-way':
    'border-amber-400/40 bg-amber-500/15 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  vision:
    'border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  neutral: 'border-slate-700 bg-slate-800/80 text-slate-300',
};

export const Badge = ({
  children,
  variant = 'neutral',
  className,
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
