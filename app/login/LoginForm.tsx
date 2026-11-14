'use client';
import Link from 'next/link';
import { AuthCard, Field, api, useSubmit } from '@/components/Form';

export default function LoginForm({ next }: { next: string }) {
  const s = useSubmit();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const j = await s.run(() => api('/api/auth/login', 'POST', { email: f.get('email'), password: f.get('password') }));
    if (j && j.ok) window.location.href = next;
  }
  return (
    <AuthCard title="Sign in" sub={<>New to ComplyScope? <Link href="/signup">Add your business</Link></>}>
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Email address" id="email" name="email" type="email" autoComplete="email" required />
        <Field label="Password" id="password" name="password" type="password" autoComplete="current-password" required />
        {s.error ? <p className="err" role="alert">{s.error}</p> : null}
        <button className="btn primary" type="submit" disabled={s.busy}>{s.busy ? 'Signing in…' : 'Sign in'}</button>
        <Link href="/forgot" className="small">Forgot your password?</Link>
      </form>
    </AuthCard>
  );
}
