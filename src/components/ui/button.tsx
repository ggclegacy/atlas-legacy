import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'icon';

/*
 * Gold is the primary action colour because a primary action is structural
 * authority, not activity. Nothing here is blue: a button at rest is not Atlas
 * working. See docs/architecture/visual-system.md.
 */
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gold-500 text-void hover:bg-gold-400 active:bg-gold-600 font-medium',
  secondary: 'bg-raised text-primary border border-line hover:border-gold-700 hover:bg-surface',
  ghost: 'text-secondary hover:text-primary hover:bg-raised',
  danger: 'text-danger border border-danger/35 hover:bg-danger/10 hover:border-danger/60',
};

/*
 * Every size is at least 44px in its smallest dimension — the iOS minimum
 * touch target. There is deliberately no "small" size: encoding a violation as
 * a convenient option guarantees it gets used.
 */
const SIZES: Record<Size, string> = {
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2.5',
  icon: 'size-11 justify-center',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Render as the child element (e.g. a Link) while keeping button styling. */
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
      // Slot forwards to the child, which sets its own type.
      {...(asChild ? {} : { type: type ?? 'button' })}
      className={cn(
        'inline-flex items-center rounded-md whitespace-nowrap',
        'transition-colors duration-(--motion-fast) ease-(--ease-atlas)',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
