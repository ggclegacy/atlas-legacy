import { DemoBanner } from '@/components/atlas/demo';
import { DEMO_MEMORIES, DEMO_PROPOSALS } from '@/components/atlas/demo-data';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata = { title: 'Memory' };

/** Memory — stored knowledge, and the proposals waiting to become knowledge. */
export default function MemoryPage() {
  return (
    <div className="mx-auto max-w-(--content-max) px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl text-primary">Memory</h1>
      <p className="mt-2 text-sm text-secondary">
        What Atlas knows, where it came from, and what it is proposing to keep.
      </p>

      <DemoBanner className="mt-5" />

      <Tabs defaultValue="stored" className="mt-5">
        <TabsList>
          <TabsTrigger value="stored">Stored</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="stored" className="space-y-3">
          {DEMO_MEMORIES.map((memory) => (
            <Card key={memory.id}>
              <CardHeader title={memory.kind} />
              <CardBody>
                <p className="text-sm leading-snug text-primary">{memory.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-secondary">{memory.detail}</p>
                {/* Provenance is not optional. Atlas must always be able to say why. */}
                <p className="mt-2.5 text-xs text-tertiary">{memory.source}</p>
              </CardBody>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="proposals" className="space-y-3">
          {DEMO_PROPOSALS.map((proposal) => (
            <Card key={proposal.id}>
              <CardBody className="pt-4">
                <p className="text-sm leading-snug text-primary">{proposal.title}</p>
                <p className="mt-1 text-xs text-tertiary">{proposal.type}</p>
              </CardBody>
            </Card>
          ))}
          <p className="text-xs text-tertiary">
            Approve, edit, and reject arrive in M7 — with the rejection signal feeding back into
            what Atlas proposes next.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
