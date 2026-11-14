import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { listBusinesses, loadWorkspace, evaluateWorkspace } from '@/lib/business';
import CS from '@/lib/engine';
import VerifyBanner from '@/components/VerifyBanner';
import { integrationStatus, getSetting } from '@/lib/integrations';

export const metadata = { title: 'My businesses' };
export default async function Page() {
  const user = await requireUser('/app');
  const list = await listBusinesses(user.id);
  if (!list.length) redirect('/app/new');
  const today = CS.todayKE();
  const cards = await Promise.all(list.map(async (b) => {
    const ws = await loadWorkspace(b.id);
    const res = evaluateWorkspace(ws, today);
    const s = CS.score(res);
    const next = CS.agenda(res, today, 60).filter((a: any) => a.days >= 0)[0];
    return { b, s, next, counties: Array.from(new Set((ws!.profile.locations || []).map((l: any) => l.county))) };
  }));
  const review = await getSetting('review_status', 'pending');
  return (
    <div className="ws">
      <div className="wrap app-main">
        {!user.email_verified_at && (await integrationStatus()).email ? <VerifyBanner /> : null}
        {review !== 'complete' ? <div className="banner"><div className="small"><b>Pilot notice.</b> Rules and due dates come from KRA, SHA, NSSF, NITA, BRS, ODPC, DOSH and county sources and are being reviewed by a professional. Confirm amounts and dates with the authority before you file.</div></div> : null}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 12 }}>
          <div><p className="tiny muted" style={{ fontWeight: 700, letterSpacing: '.1em' }}>WELCOME, {user.name.split(' ')[0].toUpperCase()}</p><h1 style={{ fontSize: 28, fontWeight: 800 }}>My businesses</h1></div>
          <Link className="btn primary" href="/app/new">Add another business</Link>
        </div>
        <div className="grid3">
          {cards.map(({ b, s, next, counties }) => (
            <Link key={b.id} href={'/app/b/' + b.id + '#overview'} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><h3 style={{ fontSize: 18, fontWeight: 800 }}>{b.name}</h3><span className="stp s-info">{b.role}</span></div>
              <p className="small muted">{counties.join(', ')}</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.value == null ? 'var(--muted)' : s.value >= 80 ? 'var(--ok)' : s.value >= 55 ? 'var(--warn)' : 'var(--crit)' }}>{s.value ?? '–'}<span className="small muted" style={{ fontWeight: 500 }}> / 100</span></p>
              <p className="small">{(s.parts.overdue || 0)} overdue · {(s.parts.soon || 0)} due soon · {(s.parts.missing || 0) + (s.parts.info || 0)} not recorded</p>
              {next ? <p className="small muted">Next: {next.r.inst.title} — {CS.fmt(next.due)}</p> : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
