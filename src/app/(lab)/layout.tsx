import { Geist_Mono } from 'next/font/google';

import '@/styles/v2/tokens.css';
import '@/styles/v2/material.css';
import '@/styles/v2/presence.css';
import '@/styles/v2/components.css';
import '@/styles/v2/lab.css';

/**
 * Design-lab layout.
 *
 * Deliberately does NOT use the M1 Atlas shell — the V2 language must be judged
 * without M1 chrome around it, and the two token systems must not meet.
 *
 * Geist Mono is loaded here rather than in the root layout so the production
 * font payload is unchanged during VP1.
 */
const atlasMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-atlas-mono',
});

export default function LabLayout({ children }: LayoutProps<'/'>) {
  return <div className={atlasMono.variable}>{children}</div>;
}
