import { DemoBanner } from '@/components/atlas/demo';
import { DEMO_PROJECTS } from '@/components/atlas/demo-data';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

export const metadata = { title: 'Projects' };

/** Projects, grouped by organization — the boundary that must never blur. */
export default function ProjectsPage() {
  const organizations = [...new Set(DEMO_PROJECTS.map((p) => p.org))];

  return (
    <div className="mx-auto max-w-(--content-max) px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl text-primary">Projects</h1>
      <p className="mt-2 text-sm text-secondary">
        Every project belongs to exactly one organization. Atlas never mixes their context.
      </p>

      <DemoBanner className="mt-5" />

      <div className="mt-5 space-y-4">
        {organizations.map((org) => (
          <Card key={org}>
            <CardHeader title={org} />
            <CardBody className="space-y-1">
              {DEMO_PROJECTS.filter((p) => p.org === org).map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-3 py-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-primary">{project.name}</p>
                    <p className="text-xs text-tertiary" data-numeric>
                      {project.openGoals} open goals
                    </p>
                  </div>
                  <span
                    className={
                      project.status === 'active'
                        ? 'shrink-0 text-xs text-gold-400'
                        : 'shrink-0 text-xs text-tertiary'
                    }
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>
        ))}
      </div>

      <p className="mt-5 text-xs text-tertiary">
        Project creation, goals, current state, and “where did we leave off” arrive in M8.
      </p>
    </div>
  );
}
