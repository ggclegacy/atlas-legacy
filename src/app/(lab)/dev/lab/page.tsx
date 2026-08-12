import { notFound } from 'next/navigation';

import { Lab } from '@/components/lab/lab';
import { env } from '@/lib/config/env';

export const metadata = {
  title: 'Atlas V2 Design Lab',
  robots: { index: false, follow: false },
};

/**
 * VP1 — Atlas V2 Design Lab.
 *
 * Available in development and on preview deployments so the language can be
 * judged on a real phone. Never exposed in production.
 *
 * The gate is evaluated at BUILD time because this page is statically
 * prerendered — correct on Vercel, where the build environment always matches
 * the deployment it produces (documented in M0's closeout).
 *
 * Nothing here touches the database, auth, AI, or memory. There is no service
 * layer and no persistence: every value on this page is a literal.
 */
export default function LabPage() {
  if (env.isProduction) notFound();

  return <Lab />;
}
