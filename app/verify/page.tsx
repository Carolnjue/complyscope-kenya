import Link from 'next/link';
import { readToken, useToken, audit } from '@/lib/auth';
import { exec } from '@/lib/db';
import { AuthCard } from '@/components/Form';

export const metadata = { title: 'Confirm your email' };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const t = await readToken('verify', (await searchParams).token || '');
  if (t) { await exec('UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?', [t.user_id]); await useToken(t.id); await audit(t.user_id, null, 'email_verified', ''); }
  return (
    <AuthCard title={t ? 'Email confirmed' : 'This link has expired'} sub={t ? 'Thank you. Your account is fully set up.' : 'Sign in and ask for a new confirmation email from your account page.'}>
      <Link className="btn primary" href="/app">Go to my workspace</Link>
    </AuthCard>
  );
}
