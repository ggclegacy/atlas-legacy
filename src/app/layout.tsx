import type { Metadata, Viewport } from 'next';

import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Atlas', template: '%s · Atlas' },
  description: 'A persistent personal and business AI operating system.',
  applicationName: 'Atlas',
  // Atlas is a private system. Keep it out of search indexes permanently.
  robots: { index: false, follow: false },
  // Installed-app behaviour on iOS.
  appleWebApp: {
    capable: true,
    title: 'Atlas',
    statusBarStyle: 'black-translucent',
  },
  other: {
    // Next 16 emits the modern `mobile-web-app-capable`. iOS before 16.4 only
    // honours the apple-prefixed form, and without it Atlas opens in Safari
    // chrome instead of standalone. One line, and it removes a whole class of
    // "it didn't install properly" confusion.
    'apple-mobile-web-app-capable': 'yes',
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  // Mobile-first: Atlas is a phone application before it is anything else.
  width: 'device-width',
  initialScale: 1,
  // Draw beneath the notch and home indicator; safe areas are handled in CSS.
  viewportFit: 'cover',
  themeColor: '#050506',
  // Deliberately NOT disabling user scaling — pinch-zoom is an accessibility
  // requirement, not a polish problem.
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
