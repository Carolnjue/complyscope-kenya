import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { access, loadWorkspace, evaluateWorkspace } from '@/lib/business';
import CS from '@/lib/engine';
import PrintButton from '@/components/PrintButton';
import { audit } from '@/lib/auth';

export const metadata = { title: 'Compliance dossier' };
const LABEL: Record<string, string> = { overdue: 'Overdue', soon: 'Due soon', ok: 'On track', missing: 'Not recorded', info: 'Needs a date', done: 'In place', na: 'Not applicable' };
const COLOR: Record<string, string> = { overdue: '#dc2626', soon: '#d97706', ok: '#059669', done: '#059669', missing: '#b91c1c', info: '#c2410c', na: '#64748b' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const user = await requireUser('/app/b/' + id + '/dossier');
  const a = await access(user.id, id, 'viewer', !!user.is_admin);
  if (!a) notFound();
  const ws = (await loadWorkspace(id))!;
  const today = CS.todayKE();
  const res = evaluateWorkspace(ws, today);
  const s = CS.score(res); const c = s.parts;
  const p = ws.profile;
  await audit(user.id, id, 'dossier_viewed', '');
  const sectorName = (k: string) => (CS.SECTORS.find((x: any) => x[0] === k) || [k, k])[1];
  const th = { textAlign: 'left' as const, padding: '7px 6px', borderBottom: '2px solid #0d9488', fontSize: 12 };
  const td = { padding: '7px 6px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' as const, fontSize: 12.5 };
  const groups = ['Registration', 'Tax', 'Payroll', 'Data protection', 'Workplace', 'County', 'Sector'];
  return (
    <div className="dossier-page" style={{ background: '#fff', padding: '28px 20px 60px' }}>
      <style>{`@media print{.site-header,footer,.noprint{display:none!important}.dossier-page{padding:0!important}h2{break-after:avoid}tr{break-inside:avoid}@page{margin:14mm}}`}</style>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="noprint" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 16 }}><a className="btn sm" href={'/app/b/' + id + '#dossier'} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', textDecoration: 'none', color: 'var(--text)' }}>Back to workspace</a><PrintButton /></div>
        <p style={{ fontSize: 12, letterSpacing: '.12em', fontWeight: 700, color: '#0d9488' }}>COMPLYSCOPE KENYA · COMPLIANCE DOSSIER</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: '6px 0' }}>{p.name}</h1>
        <p style={{ color: '#64748b', fontSize: 13.5 }}>Prepared {CS.fmt(today)} by {user.name}. Contents reflect the business&apos;s own records in ComplyScope; they have not been verified with the authorities.</p>

        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '26px 0 8px', borderBottom: '2px solid #0d9488', paddingBottom: 4 }}>Business profile</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
          {[
            ['Legal form', CS.STRUCTURES[p.structure]],
            ['BRS registration number', p.regNo || 'Not recorded'],
            ['KRA PIN', p.kraPin || 'Not recorded'],
            ['Incorporated or registered', p.incDate ? CS.fmt(CS.fromIso(p.incDate)) : 'Not recorded'],
            ['Activities', ((p.sectors || []).map(sectorName).join(', ') || 'Not specified') + (p.activities ? '. ' + p.activities : '')],
            ['Employees', String(p.employees)],
            ['Annual turnover', CS.TURNOVER[p.turnover]],
            ['VAT registered', ({ yes: 'Yes', no: 'No', unknown: 'Not sure' } as any)[p.vat]],
            ['Financial year end', CS.MONTH[(p.fyEnd || 12) - 1]],
            ['Locations', p.locations.map((l: any) => `${l.name} (${l.county})`).join('; ')],
          ].map(([k, v]) => <tr key={k}><th style={{ ...td, width: 220, color: '#64748b', fontWeight: 600 }}>{k}</th><td style={td}>{v}</td></tr>)}
        </tbody></table>

        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '26px 0 8px', borderBottom: '2px solid #0d9488', paddingBottom: 4 }}>Summary</h2>
        <p style={{ fontSize: 14 }}>Working score <b>{s.value == null ? 'not available' : s.value + ' out of 100'}</b>. {c.overdue || 0} overdue, {c.soon || 0} due soon, {(c.missing || 0) + (c.info || 0)} not recorded or missing a date, {(c.done || 0) + (c.ok || 0)} in place or on track, {c.na || 0} marked not applicable.</p>

        {groups.map((g) => {
          const items = res.filter((r: any) => r.inst.ob.group === g);
          if (!items.length) return null;
          return (
            <div key={g}>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: '22px 0 6px' }}>{g}</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Obligation</th><th style={th}>Applies to</th><th style={th}>Status</th><th style={th}>Next date</th><th style={th}>Notes</th></tr></thead>
                <tbody>{items.map((r: any) => (
                  <tr key={r.id}><td style={td}><b>{r.inst.title}</b><br /><span style={{ color: '#64748b' }}>{r.inst.ob.auth}</span></td><td style={td}>{r.inst.loc ? `${r.inst.loc.name} (${r.inst.loc.county})` : 'Business-wide'}</td><td style={{ ...td, color: COLOR[r.status], fontWeight: 700 }}>{LABEL[r.status]}</td><td style={td}>{r.next != null ? CS.fmt(r.next) : '–'}</td><td style={td}>{r.note}{r.record && r.record.ref ? ` · Ref ${r.record.ref}` : ''}</td></tr>
                ))}</tbody>
              </table>
            </div>
          );
        })}

        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '26px 0 8px', borderBottom: '2px solid #0d9488', paddingBottom: 4 }}>Filing and renewal log</h2>
        {ws.filings.length ? <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={th}>Date</th><th style={th}>Item</th><th style={th}>Period</th><th style={th}>Reference</th></tr></thead><tbody>
          {ws.filings.map((f: any) => <tr key={f.fid}><td style={td}>{CS.fmt(CS.fromIso(f.date))}</td><td style={td}>{f.title}{f.loc ? ' · ' + f.loc : ''}</td><td style={td}>{CS.periodLabel(f.period)}</td><td style={td}>{f.ref || '–'}</td></tr>)}
        </tbody></table> : <p style={{ fontSize: 13.5 }}>No entries recorded.</p>}

        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '26px 0 8px', borderBottom: '2px solid #0d9488', paddingBottom: 4 }}>Documents on file</h2>
        {ws.documents.length ? <ul style={{ fontSize: 13.5, paddingLeft: 18, listStyle: 'disc' }}>{ws.documents.map((d: any) => <li key={d.id}>{d.filename} <span style={{ color: '#64748b' }}>· uploaded {String(d.created_at).slice(0, 10)}</span></li>)}</ul> : <p style={{ fontSize: 13.5 }}>No documents uploaded.</p>}

        <p style={{ marginTop: 28, fontSize: 11.5, color: '#64748b' }}>ComplyScope Kenya is an information and tracking tool by Pentarch Systems Solutions. It is not legal, tax or accounting advice, and this dossier is not a certificate of compliance. Confirm all dates and amounts with the relevant authority.</p>
      </div>
    </div>
  );
}
