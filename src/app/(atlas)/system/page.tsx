import Link from 'next/link';

import { getHealthReport } from '@/lib/services/health';

export const metadata = { title: 'System' };

/**
 * SYSTEM — access to Atlas infrastructure.
 *
 * Reads as instrumentation because the TYPOGRAPHY is instrumental — every
 * machine value is mono and tabular — not because gauges were drawn. One
 * operating well, registers separated by interrupted hairlines.
 *
 * The status register is real: it comes from the health service built in M0.
 */
export default function SystemPage() {
  const health = getHealthReport();

  /** `real` marks the one register backed by an actual service (M0 health). */
  const registers: ReadonlyArray<{
    label: string;
    real?: boolean;
    rows: ReadonlyArray<readonly [string, string]>;
  }> = [
    {
      label: 'Status',
      real: true,
      rows: [
        ['state', health.status],
        ['environment', health.environment],
        ['build', health.commit.slice(0, 12)],
      ],
    },
    {
      label: 'Identity',
      rows: [
        ['profile', 'M6'],
        ['calibration', 'M5'],
      ],
    },
    {
      label: 'Intelligence',
      rows: [
        ['reasoning model', 'M4'],
        ['utility model', 'M4'],
        ['spend cap', 'M4'],
      ],
    },
    {
      label: 'Memory',
      rows: [
        ['retention', 'M6'],
        ['proposal threshold', 'M7'],
        ['export', 'M9'],
      ],
    },
    {
      label: 'Access',
      rows: [['sign out', 'M3']],
    },
  ];

  return (
    <div className="mx-auto max-w-(--content-max) px-4 pt-7">
      <h1 className="text-[32px] leading-[1.12] tracking-[-0.02em] text-primary">System</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-secondary">
        How Atlas is configured, and how it is running.
      </p>

      <section className="well well--bleed mt-6 pt-4 pb-6">
        {registers.map((reg, i) => (
          <div key={reg.label} className={i > 0 ? 'mt-7' : undefined}>
            <div className="rule">
              <span className="rule__label">{reg.label}</span>
              {reg.real ? <span className="rule__value">live</span> : null}
            </div>
            <dl className="mt-3">
              {reg.rows.map(([k, v]) => (
                <div key={k} className="entry">
                  <dt className="text-sm text-secondary">{k}</dt>
                  <dd
                    className={
                      reg.real && k === 'state' && v === 'ok'
                        ? 'machine shrink-0 text-success'
                        : 'machine shrink-0'
                    }
                    data-numeric
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        <div className="mt-7">
          <div className="rule">
            <span className="rule__label">Development</span>
          </div>
          <p className="mt-3 text-sm text-secondary">
            Inspect every Atlas Presence state, and the V2 material system, in isolation.
          </p>
          <Link
            href="/dev/lab"
            className="mt-3 inline-flex h-11 items-center rounded-[--radius-fillet] border border-gold-structural px-4 text-sm text-gold-authority"
          >
            Design lab
          </Link>
        </div>
      </section>

      <p className="machine mt-6 pb-4">values marked with a milestone are not yet implemented</p>
    </div>
  );
}
