'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthCard, Field, api, useSubmit } from '@/components/Form';

function Inner() {
  const token = useSearchParams().get('token') || '';
  const s = useSubmit();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get('password') !== f.get('confirm')) { s.setError('The two passwords do not match.'); return; }
    const j = await s.run(() => api('/api/auth/reset', 'POST', { token, password: f.get('password') }));
    if (j && j.ok) window.location.href = '/app';
  }
  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="New password" hint="At least 8 characters, with a number" id="password" name="password" type="password" autoComplete="new-password" required />
        <Field label="Repeat the new password" id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        {s.error ? <p className="err" role="alert">{s.error}</p> : null}
        <button className="btn primary" type="submit" disabled={s.busy}>{s.busy ? 'Saving…' : 'Save new password'}</button>
      </form>
    </AuthCard>
  );
}
export default function Page() { return <Suspense><Inner /></Suspense>; }
