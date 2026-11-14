import 'server-only';
import { redirect } from 'next/navigation';
import { currentUser } from './auth';

export async function requireUser(next = '/app') {
  const u = await currentUser();
  if (!u) redirect('/login?next=' + encodeURIComponent(next));
  return u;
}
