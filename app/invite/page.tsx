import { currentUser } from '@/lib/auth';
import InviteAccept from './InviteAccept';
import { AuthCard } from '@/components/Form';
import Link from 'next/link';

export const metadata = { title: 'Accept invitation' };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token || '';
  const user = await currentUser();
  if (!user) {
    const next = encodeURIComponent('/invite?token=' + token);
    return <AuthCard title="You have been invited" sub="Sign in, or create a free account with the email the invitation was sent to, to join the team."><Link className="btn primary" href={'/signup?next=' + next}>Create an account</Link><Link className="btn" href={'/login?next=' + next}>I already have an account</Link></AuthCard>;
  }
  return <InviteAccept token={token} />;
}
