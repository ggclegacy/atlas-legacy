'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { cn } from './cn';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';

interface ToastRecord {
  id: number;
  title: string;
  body?: string | undefined;
  tone: ToastTone;
}

interface ToastApi {
  toast: (input: { title: string; body?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Access the toast API. Must be called under `<AtlasToastProvider>`. */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within <AtlasToastProvider>');
  return context;
}

/*
 * Tone borders only — a toast is a notification, not a billboard. Nothing here
 * uses intelligence blue: a toast reports a result, it is not Atlas thinking.
 */
const TONE_BORDER: Record<ToastTone, string> = {
  neutral: 'border-line',
  success: 'border-success/40',
  warning: 'border-warning/40',
  danger: 'border-danger/40',
};

export function AtlasToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastRecord[]>([]);

  const toast = useCallback<ToastApi['toast']>(({ title, body, tone = 'neutral' }) => {
    setItems((current) => [...current, { id: Date.now() + Math.random(), title, body, tone }]);
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      <ToastPrimitive.Provider swipeDirection="down" duration={4500}>
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            onOpenChange={(open) => {
              if (!open) setItems((current) => current.filter((t) => t.id !== item.id));
            }}
            className={cn(
              'rounded-md border bg-raised p-3.5 shadow-lg shadow-black/40',
              'data-[state=closed]:animate-toast-out data-[state=open]:animate-toast-in',
              'data-[swipe=end]:animate-toast-out',
              TONE_BORDER[item.tone],
            )}
          >
            <ToastPrimitive.Title className="text-sm font-medium text-primary">
              {item.title}
            </ToastPrimitive.Title>
            {item.body ? (
              <ToastPrimitive.Description className="mt-1 text-sm text-secondary">
                {item.body}
              </ToastPrimitive.Description>
            ) : null}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport
          className={cn(
            'fixed inset-x-0 bottom-0 z-60 flex w-full flex-col gap-2 p-4',
            // Sit above the bottom navigation and the iOS home indicator.
            'pb-[calc(var(--nav-height)+1rem+env(safe-area-inset-bottom))]',
            'sm:pb-[calc(1rem+env(safe-area-inset-bottom))]',
            'md:right-0 md:left-auto md:max-w-sm',
          )}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
