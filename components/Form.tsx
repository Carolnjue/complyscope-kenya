'use client';
import { useState } from 'react';

export async function api(url: string, method = 'POST', data?: any) {
  const r = await fetch(url, { method, headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined, credentials: 'same-origin' });
  let j: any = {};
  try { j = await r.json(); } catch { j = { ok: false, error: 'The server did not respond properly. Try again.' }; }
  if (!r.ok && j.ok !== false) j = { ok: false, error: 'Something went wrong (' + r.status + ').' };
  return j;
}

export function AuthCard({ title, sub, children }: { title: string; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ padding: '56px 20px 72px' }}>
      <div className="ws" style={{ maxWidth: 460, margin: '0 auto' }}>
        <div className="panel panel-pad" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><h1 style={{ fontSize: 26, fontWeight: 800 }}>{title}</h1>{sub ? <p className="muted small" style={{ marginTop: 6 }}>{sub}</p> : null}</div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run(fn: () => Promise<any>) {
    setBusy(true); setError('');
    try { const j = await fn(); if (j && j.ok === false) setError(j.error || 'Something went wrong.'); return j; }
    catch { setError('Network problem. Check your connection and try again.'); return null; }
    finally { setBusy(false); }
  }
  return { busy, error, setError, run };
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const { label, hint, ...rest } = props;
  return <label className="f" htmlFor={rest.id}>{label}{hint ? <small>{hint}</small> : null}<input {...rest} /></label>;
}
