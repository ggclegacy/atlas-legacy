import { DemoBanner } from '@/components/atlas/demo';
import { DEMO_MEMORIES, DEMO_PROPOSALS } from '@/components/atlas/demo-data';

export const metadata = { title: 'Memory' };

/**
 * MEMORY — a knowledge architecture, not notes.
 *
 * The grammar carries the dimensions that matter without drawing a graph:
 *   type        → the label in the hairline gap
 *   provenance  → a mono line, always present
 *   confidence  → a short gold rule whose LENGTH is the value
 *   status      → luminance; superseded entries nest one module deeper
 *   proposals   → a separate, gold-edged field above (awaiting authority)
 */
export default function MemoryPage() {
  return (
    <div className="mx-auto max-w-(--content-max) px-4 pt-7">
      <h1 className="text-[32px] leading-[1.12] tracking-[-0.02em] text-primary">Memory</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-secondary">
        What Atlas knows, where it came from, and what it is proposing to keep.
      </p>

      <DemoBanner className="mt-6" />

      {/* Proposals sit apart and gold-edged: they are awaiting your authority. */}
      <section className="well well--bleed gold-edge relative mt-6 pt-5 pb-6">
        <div className="rule">
          <span className="rule__label">Awaiting your approval</span>
          <span className="rule__value" data-numeric>
            {DEMO_PROPOSALS.length}
          </span>
        </div>
        <ul className="mt-3">
          {DEMO_PROPOSALS.map((p) => (
            <li key={p.id} className="border-b border-line-soft py-2.5 last:border-b-0">
              <p className="text-sm leading-snug text-primary">{p.title}</p>
              <p className="machine mt-1">{p.type} · proposed</p>
            </li>
          ))}
        </ul>
        <p className="machine mt-4">approve · edit · reject — M7</p>
      </section>

      <section className="well well--bleed mt-5 pt-4 pb-6">
        <div className="rule">
          <span className="rule__label">Retained</span>
          <span className="rule__value" data-numeric>
            {DEMO_MEMORIES.length}
          </span>
        </div>

        <ul className="mt-4">
          {DEMO_MEMORIES.map((m, i) => (
            <li key={m.id} className={i > 0 ? 'mt-5 border-t border-line-soft pt-5' : undefined}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm leading-snug text-primary">{m.title}</p>
                <span className="machine shrink-0">{m.kind}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-secondary">{m.detail}</p>

              <div className="mt-2.5 flex items-center gap-3">
                {/* Confidence as structure: the rule's length is the value. */}
                <span aria-hidden className="flex h-px w-16 items-center">
                  <span
                    className="block h-px bg-gold-structural"
                    style={{ width: i === 0 ? '90%' : i === 1 ? '65%' : '78%' }}
                  />
                </span>
                <span className="machine">confidence</span>
                <span className="machine ml-auto">{m.source}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Supersession shown by geometry: the newer entry nests deeper. */}
        <div className="entry--nested mt-6">
          <p className="text-sm leading-snug text-secondary">
            Superseded — “Build Gen OS alongside Atlas”
          </p>
          <p className="machine mt-1">superseded 11 Aug 2026 · chain preserved</p>
        </div>
      </section>
    </div>
  );
}
