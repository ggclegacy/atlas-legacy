import type { SVGProps } from 'react';

/**
 * Atlas iconography. Hand-drawn rather than imported.
 *
 * A general-purpose icon set would bring hundreds of glyphs drawn to someone
 * else's optical rules. Atlas needs four, drawn to one grid, one stroke weight,
 * and one temperature: geometric, thin, slightly technical.
 */

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

/** Command — a prompt caret over a baseline. Where you speak to Atlas. */
export function CommandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 6.5 8 10l-3.5 3.5" />
      <path d="M10.5 13.5h5" />
    </svg>
  );
}

/** Projects — stacked planes. Parallel work, held in order. */
export function ProjectsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 2.75 17 6.5l-7 3.75L3 6.5l7-3.75Z" />
      <path d="m3 10.5 7 3.75 7-3.75" />
      <path d="m3 14.25 7 3.75 7-3.75" />
    </svg>
  );
}

/** Memory — a centre with retained relations. Structure, not a filing cabinet. */
export function MemoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="2.4" />
      <circle cx="10" cy="3.4" r="1.5" />
      <circle cx="16" cy="14" r="1.5" />
      <circle cx="4" cy="14" r="1.5" />
      <path d="M10 7.6V4.9M11.9 11.4l2.9 1.9M8.1 11.4l-2.9 1.9" />
    </svg>
  );
}

/** System — calibration. Deliberately not a gear. */
export function SystemIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 6h13M3.5 14h13" />
      <circle cx="8" cy="6" r="1.9" />
      <circle cx="13" cy="14" r="1.9" />
    </svg>
  );
}

/** Quick Capture — an addition, not a plus button in a circle. */
export function CaptureIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}

/** Send — a directional mark for the composer. */
export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10h11" />
      <path d="m10.5 5.5 5 4.5-5 4.5" />
    </svg>
  );
}
