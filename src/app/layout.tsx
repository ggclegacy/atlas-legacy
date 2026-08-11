import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Atlas',
  description: 'A persistent personal and business AI operating system.',
  // Atlas is a private system. Keep it out of search indexes permanently.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // Mobile-first: Atlas is a phone application before it is anything else.
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050506',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
