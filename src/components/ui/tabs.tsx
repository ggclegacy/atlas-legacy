'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentProps } from 'react';

import { cn } from './cn';

/**
 * Tabs. The active tab is marked with a gold underline — selection is
 * structure, so it is gold and static. Radix handles roving focus and
 * arrow-key navigation.
 */
export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex items-center gap-1 border-b border-line', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'relative inline-flex h-11 items-center px-3 text-sm text-secondary',
        'transition-colors duration-(--t-acknowledge) ease-(--ease-atlas)',
        'hover:text-primary',
        'data-[state=active]:text-primary',
        // Gold underline, drawn without shifting layout.
        'after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-transparent',
        'data-[state=active]:after:bg-gold',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('pt-4', className)} {...props} />;
}
