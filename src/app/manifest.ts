import type { MetadataRoute } from 'next';

/**
 * Web app manifest.
 *
 * Colours are literal here by necessity — a manifest is consumed by the OS, not
 * the CSS engine, so it cannot reference custom properties. These two values
 * are the only place outside tokens.css where an Atlas colour is written by
 * hand, and a test asserts they still match the tokens.
 *
 * No service worker and no offline caching in M1 (master plan): cache
 * invalidation is a real cost and Atlas has nothing worth caching yet.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Atlas',
    short_name: 'Atlas',
    description: 'A persistent personal and business AI operating system.',
    // Open straight into Command — Atlas has no landing page.
    start_url: '/command',
    scope: '/',
    display: 'standalone',
    background_color: '#050506',
    theme_color: '#050506',
    categories: ['productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
