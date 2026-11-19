import React from 'react';
import { Badge, type BadgeProps } from './Badge';
import { cn } from '@/utils/cn';

export interface SectionHeaderProps {
  badgeText: string;
  badgeVariant?: BadgeProps['variant'];
  title: React.ReactNode;
  description: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader = ({
  badgeText,
  badgeVariant = 'pitcher',
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center mx-auto max-w-3xl' : 'items-start text-left max-w-2xl',
        className
      )}
    >
      <Badge variant={badgeVariant}>{badgeText}</Badge>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
        {title}
      </h2>
      <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
