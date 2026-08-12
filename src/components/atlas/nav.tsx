'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';

import { CommandIcon, MemoryIcon, ProjectsIcon, SystemIcon } from './icons';

interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Demo-only. Real counts arrive with memory proposals at M7. */
  demoBadge?: number;
}

/**
 * Four operating modes. "Today" is deliberately not among them — it is the home
 * state of Command, which keeps the Aperture permanently primary.
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

/**
 * Phone: a structural plane of the chassis, not a floating bar.
 *
 * Active mode is a measurable position — the segment recesses and a gold datum
 * marks it. Opaque, because content reading through a translucent bar looks
 * like a rendering fault (measured on WebKit in M1).
 */
export function BottomNav() {
  const isActive = useIsActive();

  return (
    <nav aria-label="Primary" className="nav nav--bottom">
      {NAV_ITEMS.map(({ href, label, Icon, demoBadge }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className="nav__item"
          >
            <span className="relative">
              <Icon className="size-5" />
              {demoBadge ? <Badge count={demoBadge} /> : null}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Tablet and desktop: the rail is structural architecture, indexed vertically. */
export function SideRail({ presence }: { presence?: React.ReactNode }) {
  const isActive = useIsActive();

  return (
    <nav aria-label="Primary" className="rail">
      <div className="rail__head">
        {presence}
        <span className="text-[15px] tracking-[0.22em] text-primary uppercase">Atlas</span>
      </div>

      <div className="flex flex-col py-2">
        {NAV_ITEMS.map(({ href, label, Icon, demoBadge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="rail__item"
            >
              <span className="relative">
                <Icon className={active ? 'size-5 text-gold-authority' : 'size-5'} />
                {demoBadge ? <Badge count={demoBadge} /> : null}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Gold marks structure, including counts that want attention. */
function Badge({ count }: { count: number }) {
  return (
    <span
      className="absolute -top-1.5 -right-2.5 min-w-4 rounded-full border border-gold-structural px-1 text-center font-mono text-[10px] leading-4 text-gold-authority"
      data-numeric
    >
      {count}
      <span className="sr-only"> pending</span>
    </span>
  );
}
