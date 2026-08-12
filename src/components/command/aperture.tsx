'use client';

import { useEffect, useRef, useState } from 'react';

import { Presence } from '@/components/atlas/presence';
import { useAtlasPresence } from '@/components/atlas/presence-context';
import { CaptureIcon } from '@/components/atlas/icons';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

/**
 * THE COMMAND APERTURE.
 *
 * A recessed subsystem cut into the plane, with the Presence seated in it as
 * the actuator. One instrument, not two components: the illumination edge takes
 * its colour and direction from the Presence state, so energy visibly enters
 * from the actuator when Atlas reasons and travels outward when it responds.
 *
 * M1 honesty is preserved: typing works, but nothing is sent anywhere and the
 * interface says so rather than faking a reply. Conversation lands in M4.
 */

type ApertureState =
  'dormant' | 'focused' | 'typing' | 'submitting' | 'reasoning' | 'streaming' | 'error';

export function CommandAperture({ project }: { project?: string }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [phase, setPhase] = useState<ApertureState | null>(null);
  const intakeRef = useRef<HTMLTextAreaElement>(null);
  const { state: atlasState, setState: setAtlasState } = useAtlasPresence();
  const { toast } = useToast();

  /*
   * Recover anything typed before React hydrated.
   *
   * The Aperture is server-rendered, so it is focusable before it is
   * interactive. Without this, a fast user — or anyone with Reduce Motion
   * enabled, where nothing delays the first keystroke — would watch their
   * opening sentence silently fail to send. Found and fixed in M1; kept.
   */
  useEffect(() => {
    const early = intakeRef.current?.value;
    if (early) setValue(early);
  }, []);

  const live: ApertureState = phase ?? (focused ? (value ? 'typing' : 'focused') : 'dormant');

  function submit() {
    if (!value.trim()) return;

    // Show the working states honestly, then say plainly that there is no
    // model behind this yet.
    setPhase('submitting');
    setAtlasState('understanding');

    window.setTimeout(() => {
      setPhase('reasoning');
      setAtlasState('thinking');
    }, 260);

    window.setTimeout(() => {
      setPhase('streaming');
      setAtlasState('streaming');
    }, 900);

    window.setTimeout(() => {
      setPhase(null);
      setAtlasState('idle');
      setValue('');
      toast({
        title: 'Not connected yet',
        body: 'Atlas cannot answer until M4. Your message was not sent or stored.',
        tone: 'warning',
      });
    }, 1700);
  }

  return (
    <div className="ap ap--pinned" data-state={live}>
      {/*
        The scope band carries context only when it is MORE specific than the
        chassis header — repeating "Personal" in two places at once is noise,
        not reassurance. Collapsed, it remains the structural top edge and the
        growth seam for attachments and tools.
      */}
      <div className="ap__scope" data-collapsed={project ? undefined : 'true'}>
        <span className="datum" aria-hidden />
        {project ? <span className="ap__scope-text">{project}</span> : null}
      </div>

      <div className="ap__housing">
        {/* Growth seam: attachments, tools, delegation. Surfaces nothing yet. */}
        <span className="ap__augment" aria-hidden />

        <QuickCapture />

        <Textarea
          ref={intakeRef}
          aria-label="Message Atlas"
          placeholder="Ask Atlas…"
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="ap__intake"
        />

        {/*
          Always rendered, never conditionally mounted — a control that appears
          and disappears shifts the layout under the thumb, and discards input
          typed before hydration along with the button that depended on it.
        */}
        <button
          type="button"
          className="ap__actuator"
          aria-label="Send to Atlas"
          onClick={submit}
          disabled={!value.trim() || phase !== null}
        >
          <Presence state={phase ? atlasState : 'idle'} size="sm" decorative />
        </button>
      </div>

      <div className="ap__illum" aria-hidden />
    </div>
  );
}

/** Quick Capture — eight seconds from thought to captured, by design. */
function QuickCapture() {
  const [note, setNote] = useState('');
  const { toast } = useToast();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Quick capture">
          <CaptureIcon className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        title="Quick capture"
        description="A thought, a decision, something to remember."
      >
        <Textarea
          autoFocus
          rows={4}
          placeholder="What should Atlas know?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <SheetClose asChild>
            <Button variant="ghost">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              variant="primary"
              disabled={!note.trim()}
              onClick={() => {
                setNote('');
                toast({
                  title: 'Capture not stored',
                  body: 'Memory storage arrives in M6. Nothing was saved.',
                  tone: 'warning',
                });
              }}
            >
              Capture
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
