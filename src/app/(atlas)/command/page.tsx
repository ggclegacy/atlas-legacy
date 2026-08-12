import Link from 'next/link';

import { DemoBanner, DemoTag } from '@/components/atlas/demo';
import {
  DEMO_ACTIVITY,
  DEMO_CONVERSATIONS,
  DEMO_GOALS,
  DEMO_GREETING,
  DEMO_PROJECTS,
  DEMO_PROPOSALS,
} from '@/components/atlas/demo-data';
import { Presence } from '@/components/atlas/presence';
import { Composer } from '@/components/command/composer';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

export const metadata = { title: 'Command' };

/**
 * Command — the home state.
 *
 * "Today" is this screen's zero state rather than a tab of its own. That keeps
 * the composer permanently primary and avoids a dashboard that displays its own
 * emptiness. When a conversation is open (M4) the briefing recedes.
 */
export default function CommandPage() {
  return (
    <div className="mx-auto max-w-(--content-max) px-4 pt-6 pb-40 md:pb-8">
      {/* Greeting — Atlas's own voice, so it is the display face. */}
      <section className="flex items-start gap-4">
        <Presence state="idle" size="lg" decorative className="max-sm:size-16" />
        <div className="min-w-0 pt-1">
          <h1 className="font-display text-3xl leading-tight text-primary sm:text-4xl">
            {DEMO_GREETING.salutation}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary">{DEMO_GREETING.line}</p>
        </div>
      </section>

      {/*
        Rendered once. The composer positions itself: pinned above the tab bar
        on phones, part of this column from md up.
      */}
      <div className="mt-6">
        <Composer />
      </div>

      <DemoBanner className="mt-6" />

      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader title="Awaiting your review" action={<DemoTag />} />
          <CardBody className="space-y-2">
            {DEMO_PROPOSALS.map((proposal) => (
              <div
                key={proposal.id}
                className="flex items-start gap-3 rounded-md border border-line-soft px-3 py-2.5"
              >
                <span aria-hidden className="mt-1.5 h-3 w-px shrink-0 bg-gold-600" />
                <div className="min-w-0">
                  <p className="text-sm leading-snug text-primary">{proposal.title}</p>
                  <p className="mt-0.5 text-xs text-tertiary">{proposal.type}</p>
                </div>
              </div>
            ))}
            <p className="pt-1 text-xs text-tertiary">
              Memory proposals become real in M7. Review and approval land with them.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Active projects"
            action={
              <Button asChild variant="ghost" className="h-8 px-2 text-xs">
                <Link href="/projects">All</Link>
              </Button>
            }
          />
          <CardBody className="space-y-1.5">
            {DEMO_PROJECTS.filter((p) => p.status === 'active').map((project) => (
              <div key={project.id} className="flex items-baseline justify-between gap-3 py-1">
                <div className="min-w-0">
                  <p className="truncate text-sm text-primary">{project.name}</p>
                  <p className="truncate text-xs text-tertiary">{project.org}</p>
                </div>
                <span className="shrink-0 text-xs text-secondary" data-numeric>
                  {project.openGoals} open
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Open goals" action={<DemoTag />} />
          <CardBody className="space-y-1.5">
            {DEMO_GOALS.map((goal) => (
              <div key={goal.id} className="flex items-baseline justify-between gap-3 py-1">
                <p className="min-w-0 truncate text-sm text-primary">{goal.title}</p>
                <span className="shrink-0 text-xs text-tertiary">{goal.project}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent" action={<DemoTag />} />
          <CardBody className="space-y-1.5">
            {DEMO_CONVERSATIONS.map((conversation) => (
              <div key={conversation.id} className="flex items-baseline justify-between gap-3 py-1">
                <p className="min-w-0 truncate text-sm text-primary">{conversation.title}</p>
                <span className="shrink-0 text-xs text-tertiary">{conversation.when}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <section aria-label="Recent activity" className="px-1 pt-1">
          <ul className="space-y-1">
            {DEMO_ACTIVITY.map((entry) => (
              <li key={entry.id} className="flex items-baseline gap-2 text-xs text-tertiary">
                <span aria-hidden className="size-1 rounded-full bg-line" />
                <span className="min-w-0 truncate">{entry.text}</span>
                <span className="ml-auto shrink-0">{entry.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
