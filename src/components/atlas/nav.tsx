'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';

import { cn } from '@/components/ui/cn';

import { CommandIcon, MemoryIcon, ProjectsIcon, SystemIcon } from './icons';

interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Demo-only. Real counts arrive with memory proposals at M7. */
  demoBadge?: number;
}

/**
 * Four surfaces. "Today" is deliberately not among them — it is the home state
 * of Command rather than a screen of its own, which keeps the composer the
 * permanent primary affordance. See docs/architecture/visual-system.md.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/command', label: 'Command', Icon: CommandIcon },
  { href: '/projects', label: 'Projects', Icon: ProjectsIcon },
  { href: '/memory', label: 'Memory', Icon: MemoryIcon, demoBadge: 3 },
  { href: '/system', label: 'System', Icon: SystemIcon },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/** Phone: fixed bottom tab bar, thumb-reachable, safe-area aware. */
export function BottomNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        // Opaque: content scrolling behind a translucent tab bar reads as a bug.
        'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-void',
        'pb-[env(safe-area-inset-bottom)]',
        'md:hidden',
      )}
    >
      <ul className="mx-auto flex max-w-lg">
        {NAV_ITEMS.map(({ href, label, Icon, demoBadge }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-(--nav-height) flex-col items-center justify-center gap-1',
                  'transition-colors duration-(--motion-fast) ease-(--ease-atlas)',
                  active ? 'text-gold-400' : 'text-tertiary hover:text-secondary',
                )}
              >
                {/* Gold marker: navigation state is structure. */}
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-0 h-px w-8 transition-colors duration-(--motion-fast)',
                    active ? 'bg-gold-500' : 'bg-transparent',
                  )}
                />
                <span className="relative">
                  <Icon className="size-5" />
                  {demoBadge ? <Badge count={demoBadge} /> : null}
                </span>
                <span className="text-[11px] tracking-wide">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Tablet and desktop: persistent side rail. */
export function SideRail() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'hidden shrink-0 border-r border-line bg-void md:flex md:w-(--rail-width) md:flex-col',
        'pt-[env(safe-area-inset-top)]',
      )}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
        <span className="font-display text-lg leading-none text-primary">Atlas</span>
      </div>

      <ul className="flex flex-col gap-0.5 p-2">
        {NAV_ITEMS.map(({ href, label, Icon, demoBadge }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-11 items-center gap-3 rounded-md px-3 text-sm',
                  'transition-colors duration-(--motion-fast) ease-(--ease-atlas)',
                  active
                    ? 'bg-surface text-primary'
                    : 'text-secondary hover:bg-surface/60 hover:text-primary',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-1/2 left-0 h-5 w-px -translate-y-1/2',
                    active ? 'bg-gold-500' : 'bg-transparent',
                  )}
                />
                <span className="relative">
                  <Icon className={cn('size-5', active && 'text-gold-400')} />
                  {demoBadge ? <Badge count={demoBadge} /> : null}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        'absolute -top-1.5 -right-2 rounded-full bg-gold-500 text-void',
        'min-w-4 px-1 text-center text-[10px] leading-4 font-medium',
      )}
    >
      {count}
      <span className="sr-only"> pending</span>
    </span>
  );
}
