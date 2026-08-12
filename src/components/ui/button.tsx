import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'icon';

/*
 * GOLD ON EDGES. The primary action is gold TEXT inside a gold-edged channel —
 * never a gold fill. A filled gold button was the single loudest "premium dark
 * SaaS" signal in M1, and gold is structure, not surface.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    'text-gold-authority border border-gold-structural bg-well hover:border-gold hover:text-gold-specular',
  secondary: 'text-primary border border-line bg-surface hover:border-line-interactive',
  ghost: 'text-secondary hover:text-primary hover:bg-surface',
  danger: 'text-danger border border-danger/35 hover:bg-danger/10 hover:border-danger/60',
};

/*
 * Every size is at least 44px in its smallest dimension. There is deliberately
 * no "small" size: encoding a violation as a convenient option guarantees use.
 */
const SIZES: Record<Size, string> = {
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2.5',
  icon: 'size-11 justify-center',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  children?: ReactNode;
}

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      {...(asChild ? {} : { type: type ?? 'button' })}
      className={cn(
        'inline-flex items-center rounded-[--radius-fillet] whitespace-nowrap',
        'transition-colors duration-(--t-acknowledge) ease-(--ease-atlas)',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
