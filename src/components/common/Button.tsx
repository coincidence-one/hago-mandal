import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'crimson';
  size?: 'sm' | 'md' | 'lg';
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-slate-950 font-extrabold shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:brightness-110 active:scale-[0.99]',
  crimson:
    'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white font-extrabold shadow-[0_0_25px_rgba(239,68,68,0.35)] hover:brightness-110 active:scale-[0.99]',
  secondary:
    'bg-slate-800/90 text-slate-100 border border-slate-700 hover:bg-slate-700/80 hover:border-slate-500',
  outline:
    'bg-transparent text-slate-100 border border-slate-600/80 hover:border-sky-400/70 hover:text-sky-300 hover:bg-sky-500/10',
  ghost:
    'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60',
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-2xl',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50 disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
