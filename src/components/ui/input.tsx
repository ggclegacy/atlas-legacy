import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react';

import { cn } from './cn';

const FIELD_BASE = cn(
  // border-line-strong, not border-line: a form control's boundary must meet
  // the 3:1 non-text contrast requirement. Decorative edges stay on border-line.
  'w-full rounded-[--radius-fillet] bg-surface text-primary border border-line-interactive',
  'placeholder:text-tertiary',
  'transition-colors duration-(--t-acknowledge) ease-(--ease-atlas)',
  'hover:border-gold-structural',
  'disabled:opacity-40 disabled:pointer-events-none',
  // 16px minimum prevents iOS Safari from zooming the viewport on focus.
  'text-base',
);

export function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input type={type ?? 'text'} className={cn(FIELD_BASE, 'h-11 px-3', className)} {...props} />
  );
}

export function Textarea({
  className,
  rows,
  ref,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }) {
  return (
    <textarea
      ref={ref}
      rows={rows ?? 1}
      className={cn(FIELD_BASE, 'min-h-11 resize-none px-3 py-3 leading-relaxed', className)}
      {...props}
    />
  );
}
