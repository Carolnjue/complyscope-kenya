'use client';
import Link from 'next/link';
import { AuthCard, Field, api, useSubmit } from '@/components/Form';

export default function SignupForm() {
  const s = useSubmit();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const j = await s.run(() => api('/api/auth/signup', 'POST', { name: f.get('name'), email: f.get('email'), phone: f.get('phone'), password: f.get('password'), terms: f.get('terms') === 'on' }));
    if (j && j.ok) window.location.href = '/app/new';
  }
  return (
    <AuthCard title="Add your business" sub={<>Create your free account. It takes about ten minutes to set up your first business. Already have an account? <Link href="/login">Sign in</Link></>}>
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Your full name" id="name" name="name" autoComplete="name" required />
        <Field label="Email address" id="email" name="email" type="email" autoComplete="email" required />
        <Field label="Mobile number" hint="Optional, for SMS reminders" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="0712 345 678" />
        <Field label="Password" hint="At least 8 characters, with a number" id="password" name="password" type="password" autoComplete="new-password" required />
        <label className="check" htmlFor="terms"><input type="checkbox" id="terms" name="terms" /><span className="small">I agree to the <Link href="/terms" target="_blank">terms of use</Link> and <Link href="/privacy" target="_blank">privacy policy</Link>.</span></label>
        {s.error ? <p className="err" role="alert">{s.error}</p> : null}
        <button className="btn primary" type="submit" disabled={s.busy}>{s.busy ? 'Creating your account…' : 'Create account'}</button>
      </form>
    </AuthCard>
  );
}
