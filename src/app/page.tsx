import { redirect } from 'next/navigation';

/** Command is Atlas's home. Everything else is a detour. */
export default function RootPage() {
  redirect('/command');
}
