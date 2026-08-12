import '@/styles/lab.css';

/**
 * Design-lab layout.
 *
 * The lab renders the production tokens and the production Presence — it is a
 * harness, not a parallel design system. Only the lab's own chrome is scoped
 * to this route.
 */
export default function LabLayout({ children }: LayoutProps<'/'>) {
  return children;
}
