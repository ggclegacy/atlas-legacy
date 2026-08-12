import { DemoBanner } from '@/components/atlas/demo';
import {
  DEMO_ACTIVITY,
  DEMO_CONVERSATIONS,
  DEMO_GOALS,
  DEMO_GREETING,
  DEMO_PROJECTS,
  DEMO_PROPOSALS,
} from '@/components/atlas/demo-data';
import { Presence } from '@/components/atlas/presence';
import { CommandAperture } from '@/components/command/aperture';

export const metadata = { title: 'Command' };

/**
 * COMMAND — the home state.
 *
 * Presence → Atlas's language → the Aperture → one operating well.
 *
 * "Today" is this screen's zero state rather than a tab of its own, which keeps
 * the Aperture permanently primary. There are no cards: related items share one
 * recessed field and are separated by rhythm and interrupted hairlines whose
 * labels sit in the gaps they cause.
 */
export default function CommandPage() {
  return (
    <div className="mx-auto max-w-(--content-max) px-4 pt-7">
      {/* Presence and language, in void. */}
      <section className="flex items-start gap-4">
        <Presence state="idle" size="md" decorative className="mt-1 max-sm:scale-90" />
        <div className="min-w-0">
          <h1 className="text-[32px] leading-[1.12] tracking-[-0.02em] text-primary sm:text-[34px]">
            {DEMO_GREETING.salutation}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-secondary">{DEMO_GREETING.line}</p>
        </div>
      </section>

      {/* Desktop: the Aperture sits in the column. Phone: it pins itself. */}
      <div className="mt-7">
        <CommandAperture />
      </div>

      <DemoBanner className="mt-7" />

      {/* One operating well. Four rhythm groups, no boxes. */}
      <section className="well well--bleed mt-7 pt-4 pb-6">
        <div className="rule">
          <span className="rule__label">Awaiting review</span>
          <span className="rule__value" data-numeric>
            {DEMO_PROPOSALS.length}
          </span>
        </div>
        <ul className="mt-3 mb-7">
          {DEMO_PROPOSALS.map((p) => (
            <li key={p.id} className="border-b border-line-soft py-2.5 last:border-b-0">
              <p className="text-sm leading-snug text-primary">{p.title}</p>
              <p className="machine mt-1">{p.type}</p>
            </li>
          ))}
        </ul>

        <div className="rule">
          <span className="rule__label">Active projects</span>
        </div>
        <ul className="mt-3 mb-7">
          {DEMO_PROJECTS.filter((p) => p.status === 'active').map((p) => (
            <li key={p.id} className="entry">
              <span className="min-w-0">
                <span className="entry__title block truncate">{p.name}</span>
                <span className="machine">{p.org}</span>
              </span>
              <span className="machine shrink-0" data-numeric>
                {p.openGoals} open
              </span>
            </li>
          ))}
        </ul>

        <div className="rule">
          <span className="rule__label">Open goals</span>
        </div>
        <ul className="mt-3 mb-7">
          {DEMO_GOALS.map((g) => (
            <li key={g.id} className="entry">
              <span className="entry__title truncate">{g.title}</span>
              <span className="machine shrink-0">{g.project}</span>
            </li>
          ))}
        </ul>

        <div className="rule">
          <span className="rule__label">Recent</span>
        </div>
        <ul className="mt-3">
          {DEMO_CONVERSATIONS.map((c) => (
            <li key={c.id} className="entry">
              <span className="entry__title truncate">{c.title}</span>
              <span className="machine shrink-0">{c.when}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Activity — machine values, quiet, outside the well. */}
      <section aria-label="Recent activity" className="mt-6 pb-4">
        <ul>
          {DEMO_ACTIVITY.map((a) => (
            <li key={a.id} className="flex items-baseline gap-3 py-1">
              <span aria-hidden className="size-1 shrink-0 rounded-full bg-line-raised" />
              <span className="machine min-w-0 truncate">{a.text}</span>
              <span className="machine ml-auto shrink-0">{a.when}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
