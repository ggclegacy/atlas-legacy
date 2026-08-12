'use client';

import { useEffect, useRef, useState } from 'react';

import { CaptureIcon, SendIcon } from '@/components/atlas/icons';
import { Presence, type PresenceState } from '@/components/atlas/presence';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

/**
 * The composer. The dominant affordance on Command, pinned above the tab bar
 * on phones so it is always one thumb away.
 *
 * M1 honesty: typing works, but nothing is sent anywhere. Submitting says so
 * plainly rather than faking a reply. Conversation lands in M4.
 */
export function Composer() {
  const [value, setValue] = useState('');
  const [presence, setPresence] = useState<PresenceState>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  /*
   * Recover anything typed before React took over.
   *
   * The composer is server-rendered, so it is visible and focusable before
   * hydration. Anything typed in that window lives only in the DOM — a
   * controlled component would otherwise ignore it forever and the user would
   * watch their first sentence quietly fail to send.
   *
   * The window is small but real, and it widens exactly where it hurts most:
   * on a slow phone, and for anyone with Reduce Motion enabled (no animation
   * means nothing delays that first keystroke).
   */
  useEffect(() => {
    const typedBeforeHydration = textareaRef.current?.value;
    if (typedBeforeHydration) setValue(typedBeforeHydration);
  }, []);

  function handleSubmit() {
    if (!value.trim()) return;

    // Briefly show the working states so the Presence is real on a phone,
    // then tell the truth: there is no model behind this yet.
    setPresence('thinking');
    window.setTimeout(() => setPresence('streaming'), 450);
    window.setTimeout(() => {
      setPresence('idle');
      setValue('');
      toast({
        title: 'Not connected yet',
        body: 'Atlas cannot answer until M4. Your message was not sent or stored.',
        tone: 'warning',
      });
    }, 1200);
  }

  return (
    <div
      className={cn(
        'z-20',
        // Phone: pinned directly above the bottom navigation.
        'fixed inset-x-0 bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom))]',
        // Opaque, not translucent. A blurred surface lets page content read
        // through it on WebKit, which looks like a rendering fault rather than
        // a design choice.
        'border-t border-line bg-void',
        // Desktop: it belongs to the column, not the viewport.
        'md:static md:rounded-lg md:border',
      )}
    >
      <div className="mx-auto flex max-w-(--content-max) items-end gap-2 p-3">
        <QuickCapture />

        <Textarea
          ref={textareaRef}
          aria-label="Message Atlas"
          placeholder="Ask Atlas…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          rows={1}
          className="max-h-32 flex-1"
        />

        {/*
          Always rendered, never conditionally mounted. A control that appears
          and disappears shifts the layout under the user's thumb — and, less
          visibly, creates a hydration race where a value typed before React
          takes over is discarded along with the button that depended on it.
          Disabled is the honest state; absent is not.
        */}
        <Button
          variant="primary"
          size="icon"
          aria-label="Send to Atlas"
          onClick={handleSubmit}
          disabled={!value.trim() || presence !== 'idle'}
        >
          {presence === 'idle' ? (
            <SendIcon className="size-5" />
          ) : (
            <Presence state={presence} size="sm" decorative />
          )}
        </Button>
      </div>
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
          onChange={(event) => setNote(event.target.value)}
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
