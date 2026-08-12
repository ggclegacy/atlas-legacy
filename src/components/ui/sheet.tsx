'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from './cn';

/**
 * Bottom sheet. The default modal surface on phones, where a centred dialog
 * fights the thumb. Radix supplies focus trapping, scroll locking, escape
 * handling, and ARIA; Atlas supplies the entire appearance.
 */
export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

export function SheetContent({
  className,
  children,
  title,
  description,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & {
  title: string;
  description?: ReactNode;
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-40 bg-black/70',
          'data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in',
        )}
      />
      <SheetPrimitive.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 rounded-t-lg border-t border-line bg-raised',
          'max-h-[85dvh] overflow-y-auto',
          // Clear the iOS home indicator.
          'pb-[max(1rem,env(safe-area-inset-bottom))]',
          'data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in',
          className,
        )}
        {...props}
      >
        {/* Grab affordance — the only ornament permitted on this surface. */}
        <div aria-hidden className="flex justify-center pt-2.5 pb-1">
          <span className="h-1 w-9 rounded-full bg-line" />
        </div>
        <div className="px-4 pt-2">
          <SheetPrimitive.Title className="font-display text-xl text-primary">
            {title}
          </SheetPrimitive.Title>
          {description ? (
            <SheetPrimitive.Description className="mt-1 text-sm text-secondary">
              {description}
            </SheetPrimitive.Description>
          ) : (
            // Radix warns without a description; keep it for screen readers.
            <SheetPrimitive.Description className="sr-only">{title}</SheetPrimitive.Description>
          )}
        </div>
        <div className="px-4 pt-4">{children}</div>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
