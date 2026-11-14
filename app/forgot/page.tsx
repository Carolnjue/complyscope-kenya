'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AuthCard, Field, api, useSubmit } from '@/components/Form';

export default function Page() {
  const s = useSubmit(); const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const j = await s.run(() => api('/api/auth/forgot', 'POST', { email: new FormData(e.currentTarget).get('email') }));
    if (j && j.ok) setDone(true);
  }
  return (
    <AuthCard title="Reset your password" sub={<>Remembered it? <Link href="/login">Sign in</Link></>}>
      {done ? <div className="banner">If an account exists for that email, a reset link is on its way. It expires in 2 hours.</div> :
        <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Email address" id="email" name="email" type="email" autoComplete="email" required />
          {s.error ? <p className="err" role="alert">{s.error}</p> : null}
          <button className="btn primary" type="submit" disabled={s.busy}>{s.busy ? 'Sending…' : 'Send reset link'}</button>
        </form>}
    </AuthCard>
  );
}
