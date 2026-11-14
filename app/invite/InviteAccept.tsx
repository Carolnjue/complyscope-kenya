'use client';
import { AuthCard, api, useSubmit } from '@/components/Form';
export default function InviteAccept({ token }: { token: string }) {
  const s = useSubmit();
  async function go() { const j = await s.run(() => api('/api/invite/accept', 'POST', { token })); if (j && j.ok) window.location.href = '/app/b/' + j.businessId; }
  return <AuthCard title="Join the team" sub="Accept the invitation to see and manage this business's compliance.">{s.error ? <p className="err" role="alert">{s.error}</p> : null}<button className="btn primary" onClick={go} disabled={s.busy}>{s.busy ? 'Joining…' : 'Accept invitation'}</button></AuthCard>;
}
