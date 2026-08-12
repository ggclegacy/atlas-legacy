import Link from 'next/link';

import { getHealthReport } from '@/lib/services/health';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

export const metadata = { title: 'System' };

/**
 * System — the only screen in M1 showing real data, because the health service
 * genuinely exists. Everything else here names the milestone that fills it in.
 */
export default function SystemPage() {
  const health = getHealthReport();

  return (
    <div className="mx-auto max-w-(--content-max) px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl text-primary">System</h1>
      <p className="mt-2 text-sm text-secondary">How Atlas is configured and how it is running.</p>

      <div className="mt-5 space-y-4">
        <Card>
          <CardHeader title="Status" />
          <CardBody>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-tertiary">State</dt>
              <dd className={health.status === 'ok' ? 'text-success' : 'text-danger'}>
                {health.status}
              </dd>
              <dt className="text-tertiary">Environment</dt>
              <dd className="text-primary">{health.environment}</dd>
              <dt className="text-tertiary">Build</dt>
              <dd className="truncate font-mono text-xs text-primary" data-numeric>
                {health.commit.slice(0, 12)}
              </dd>
            </dl>
            <p className="mt-3 text-xs text-tertiary">
              This is real. It comes from the health service built in M0.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Coming" />
          <CardBody>
            <ul className="space-y-2 text-sm text-secondary">
              <li className="flex justify-between gap-4">
                <span>Profile and identity memory</span>
                <span className="shrink-0 text-xs text-tertiary">M6</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Calibration — how Atlas works with you</span>
                <span className="shrink-0 text-xs text-tertiary">M5</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Models and spend cap</span>
                <span className="shrink-0 text-xs text-tertiary">M4</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Data export</span>
                <span className="shrink-0 text-xs text-tertiary">M9</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sign out</span>
                <span className="shrink-0 text-xs text-tertiary">M3</span>
              </li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Development" />
          <CardBody>
            <p className="text-sm text-secondary">
              Inspect every Atlas Presence state in isolation.
            </p>
            <Button asChild variant="secondary" className="mt-3">
              <Link href="/dev/presence">Presence harness</Link>
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
