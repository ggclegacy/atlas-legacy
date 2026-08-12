import { notFound } from 'next/navigation';

import { PRESENCE_LABELS, PRESENCE_STATES, Presence } from '@/components/atlas/presence';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { env } from '@/lib/config/env';

export const metadata = { title: 'Presence harness' };

/**
 * Atlas Presence development harness.
 *
 * Available in development and on preview deployments — preview specifically so
 * the states can be inspected on a real phone during milestone review. Never
 * exposed in production.
 *
 * Note: this page is statically prerendered, so the gate is evaluated at BUILD
 * time, not per request. That is correct on Vercel, where the build environment
 * always matches the deployment it produces. It does mean a locally-built
 * production bundle hides the harness regardless of runtime env — which is why
 * the Playwright web server builds with VERCEL_ENV=preview.
 */
export default function PresenceHarnessPage() {
  if (env.isProduction) notFound();

  return (
    <div className="mx-auto max-w-(--content-max) px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl text-primary">Presence</h1>
      <p className="mt-2 text-sm leading-relaxed text-secondary">
        Eight states. Gold when Atlas is at rest or wants something from you; intelligence blue only
        while it is actually working; still and red when it fails.
      </p>

      <Card className="mt-5">
        <CardHeader title="All states" />
        <CardBody>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            {PRESENCE_STATES.map((state) => (
              <li key={state} className="flex flex-col items-center gap-2 text-center">
                <Presence state={state} size="md" />
                <span className="text-xs text-primary">{state}</span>
                <span className="text-[11px] leading-tight text-tertiary">
                  {PRESENCE_LABELS[state]}
                </span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Sizes" />
        <CardBody>
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <Presence state="streaming" size="sm" />
              <span className="text-xs text-tertiary">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Presence state="streaming" size="md" />
              <span className="text-xs text-tertiary">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Presence state="streaming" size="lg" />
              <span className="text-xs text-tertiary">lg</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Reduced motion" />
        <CardBody>
          <p className="text-sm leading-relaxed text-secondary">
            Enable{' '}
            <span className="text-primary">Settings → Accessibility → Motion → Reduce Motion</span>{' '}
            on iOS and reload. Animation stops, but each state holds a distinct static pose — a
            travelling arc becomes a fixed arc, a breathing core becomes a steady one. States must
            stay tellable apart without movement.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
