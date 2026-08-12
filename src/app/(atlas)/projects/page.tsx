import { DemoBanner } from '@/components/atlas/demo';
import { DEMO_PROJECTS } from '@/components/atlas/demo-data';

export const metadata = { title: 'Projects' };

/**
 * PROJECTS — operating contexts, not folders.
 *
 * Organizations become interrupted hairlines with the org name in the gap.
 * Projects are rows inside one continuous recessed field. Active status is
 * marked structurally with a gold datum rather than a badge.
 */
export default function ProjectsPage() {
  const organizations = [...new Set(DEMO_PROJECTS.map((p) => p.org))];

  return (
    <div className="mx-auto max-w-(--content-max) px-4 pt-7">
      <h1 className="text-[32px] leading-[1.12] tracking-[-0.02em] text-primary">Projects</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-secondary">
        Every project belongs to exactly one organization. Atlas never mixes their context.
      </p>

      <DemoBanner className="mt-6" />

      <section className="well well--bleed mt-6 pt-4 pb-6">
        {organizations.map((org, i) => (
          <div key={org} className={i > 0 ? 'mt-7' : undefined}>
            <div className="rule">
              <span className="rule__label">{org}</span>
            </div>
            <ul className="mt-3">
              {DEMO_PROJECTS.filter((p) => p.org === org).map((project) => (
                <li key={project.id} className="entry">
                  <span className="flex min-w-0 items-baseline gap-2.5">
                    {/* Active state is structural: a datum, not a pill. */}
                    <span
                      aria-hidden
                      className={
                        project.status === 'active'
                          ? 'datum self-center'
                          : 'h-1.5 w-px shrink-0 self-center bg-line-raised'
                      }
                    />
                    <span className="min-w-0">
                      <span className="entry__title block truncate">{project.name}</span>
                      <span className="machine" data-numeric>
                        {project.openGoals} open goals
                      </span>
                    </span>
                  </span>
                  <span className="machine shrink-0">{project.status}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="machine mt-6 pb-4">
        project creation · goals · current state · “where did we leave off” — M8
      </p>
    </div>
  );
}
