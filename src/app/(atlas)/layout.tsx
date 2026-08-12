import { AtlasPresenceProvider } from '@/components/atlas/presence-context';
import { AtlasShell } from '@/components/atlas/shell';
import { AtlasToastProvider } from '@/components/ui/toast';

export default function AtlasLayout({ children }: LayoutProps<'/'>) {
  return (
    <AtlasPresenceProvider>
      <AtlasToastProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-[--radius-fillet] focus:border focus:border-line focus:bg-surface focus:px-3 focus:py-2 focus:text-primary"
        >
          Skip to content
        </a>
        <AtlasShell>{children}</AtlasShell>
      </AtlasToastProvider>
    </AtlasPresenceProvider>
  );
}
