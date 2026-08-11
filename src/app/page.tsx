/**
 * M0 placeholder.
 *
 * This exists so the production deployment serves a real page and the pipeline
 * can be verified end to end. M1 replaces it entirely with the Atlas design
 * system and application shell. Deliberately no design tokens, no motion, and
 * no Atlas Presence here — those are M1 scope.
 */
export default function FoundationPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl tracking-[0.35em] uppercase">Atlas</h1>
        <p className="mt-4 text-sm opacity-60">Foundation online.</p>
      </div>
    </main>
  );
}
