'use client';
import { useState } from 'react';
import { api } from '@/components/Form';

function Status({ on, label, pendingText }: { on: boolean; label: string; pendingText: string }) {
  return <div className="kpi" style={{ ['--stripe' as any]: on ? 'var(--good)' : 'var(--warn)' }}><span>{label}</span><b style={{ fontSize: 16, color: on ? 'var(--good)' : '#a15c07' }}>{on ? 'Active' : 'Pending'}</b>{on ? null : <p className="tiny muted" style={{ marginTop: 4 }}>{pendingText}</p>}</div>;
}

function IntegrationCard({ name, def, cfg, act }: any) {
  const [vals, setVals] = useState<any>({ ...cfg.values });
  const [enabled, setEnabled] = useState<boolean>(cfg.enabled);
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  async function save(en = enabled) {
    setBusy('save'); setNote(null);
    const j = await api('/api/admin', 'POST', { action: 'integration-save', name, values: vals, enabled: en });
    setBusy(''); setNote(j.ok ? { ok: true, text: en ? 'Saved and switched on.' : 'Saved. Switched off.' } : { ok: false, text: j.error });
    if (j.ok) setVals((v: any) => { const n = { ...v }; def.fields.forEach((f: any) => { if (f.secret && n[f.key]) n[f.key] = '__saved__'; }); return n; });
  }
  async function test() {
    setBusy('test'); setNote(null);
    const j = await api('/api/admin', 'POST', { action: 'integration-test', name });
    setBusy(''); setNote({ ok: !!j.ok, text: j.ok ? j.message : j.error });
  }
  const missing = def.required.filter((k: string) => !String(vals[k] || '').trim());
  return (
    <section className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }} aria-labelledby={'int-' + name}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ maxWidth: 640 }}><h3 id={'int-' + name} style={{ fontSize: 18 }}>{def.title}</h3><p className="small muted" style={{ marginTop: 4 }}>{def.blurb}</p></div>
        <span className={'stp ' + (cfg.on ? 's-ok' : enabled ? 's-soon' : 's-na')}>{cfg.on ? 'On' : enabled ? 'Needs details' : 'Off'}</span>
      </div>
      <div className="fgrid">
        {def.fields.map((f: any) => (
          <label key={f.key} className="f" htmlFor={name + '-' + f.key} style={f.type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}>{f.label}{f.hint ? <small>{f.hint}</small> : null}
            {f.type === 'select' ? <select id={name + '-' + f.key} value={vals[f.key] || f.options[0][0]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}>{f.options.map((o: any) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}</select>
              : f.type === 'textarea' ? <textarea id={name + '-' + f.key} rows={3} value={vals[f.key] || ''} placeholder={f.placeholder} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
              : <input id={name + '-' + f.key} type={f.secret ? 'password' : f.type === 'number' ? 'number' : 'text'} autoComplete="off" placeholder={f.secret && vals[f.key] === '__saved__' ? 'Saved — leave blank to keep' : f.placeholder} value={f.secret && vals[f.key] === '__saved__' ? '' : vals[f.key] || ''} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value || (f.secret && cfg.values[f.key] === '__saved__' ? '__saved__' : '') })} />}
          </label>
        ))}
      </div>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Switched on</label>
      {enabled && missing.length ? <p className="tiny" style={{ color: '#a15c07' }}>Fill in {missing.length === 1 ? 'the required field' : missing.length + ' required fields'} before it can run.</p> : null}
      {note ? <div className={'banner small' + (note.ok ? '' : ' warn')} role="status">{note.text}</div> : null}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn primary sm" type="button" disabled={!!busy} onClick={() => save()}>{busy === 'save' ? 'Saving…' : 'Save'}</button>
        {name !== 'manual' ? <button className="btn sm" type="button" disabled={!!busy || !cfg.on} title={cfg.on ? '' : 'Save it switched on first'} onClick={test}>{busy === 'test' ? 'Testing…' : name === 'email' ? 'Send me a test email' : name === 'sms' ? 'Send me a test SMS' : 'Test the keys'}</button> : null}
      </div>
    </section>
  );
}

function BillingSettings({ b, act }: any) {
  const [v, setV] = useState({ mode: b.mode, trialDays: b.trialDays, starter: b.prices.starter, growth: b.prices.growth, annualMonths: b.annualMonths });
  const num = (k: string) => (e: any) => setV({ ...v, [k]: Number(e.target.value) });
  return (
    <section className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ fontSize: 18 }}>Billing</h3>
      <p className="small muted">In <b>free pilot</b> mode every feature is free. In <b>paid</b> mode new businesses get a free trial; when a trial or plan ends the business becomes read-only (viewing, exports and the dossier still work) until the owner pays. Switching to paid gives every existing pilot business free access for the trial length or 30 days, whichever is longer (as the terms promise).</p>
      <div className="fgrid">
        <label className="f" htmlFor="bMode">Mode<select id="bMode" value={v.mode} onChange={(e) => setV({ ...v, mode: e.target.value })}><option value="pilot">Free pilot</option><option value="paid">Paid plans</option></select></label>
        <label className="f" htmlFor="bTrial">Free trial (days)<input id="bTrial" type="number" min={0} max={365} value={v.trialDays} onChange={num('trialDays')} /></label>
        <label className="f" htmlFor="bStarter">Starter price (KSh / month)<input id="bStarter" type="number" min={1} value={v.starter} onChange={num('starter')} /></label>
        <label className="f" htmlFor="bGrowth">Growth price (KSh / month)<input id="bGrowth" type="number" min={1} value={v.growth} onChange={num('growth')} /></label>
        <label className="f" htmlFor="bAnnual">A year costs (months)<small>10 means two months free on annual plans</small><input id="bAnnual" type="number" min={1} max={12} value={v.annualMonths} onChange={num('annualMonths')} /></label>
      </div>
      <div><button className="btn primary sm" type="button" onClick={() => { if (v.mode === 'paid' && b.mode === 'pilot' && !confirm('Switch to paid plans? Existing pilot businesses keep free access for ' + Math.max(30, v.trialDays) + ' days from today, then need a plan.')) return; act({ action: 'billing-save', ...v }); }}>Save billing settings</button></div>
    </section>
  );
}

export default function AdminConsole({ me, data }: any) {
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('overview');
  async function act(payload: any, reload = true) { setMsg('Working…'); const j = await api('/api/admin', 'POST', payload); setMsg(j.ok ? (j.result ? 'Done: ' + JSON.stringify(j.result) : 'Saved.') : j.error); if (j.ok && reload) setTimeout(() => window.location.reload(), 600); }
  const st = data.integrations, c = data.counts;
  const review = data.payments.filter((p: any) => p.status === 'review').length;
  const tabs = [['overview', 'Overview'], ['integrations', 'Integrations & billing'], ['users', 'Users'], ['businesses', 'Businesses'], ['payments', 'Payments' + (review ? ' (' + review + ')' : '')], ['email', 'Email outbox'], ['activity', 'Activity']];
  return (
    <div className="ws"><div className="wrap app-main">
      <div><p className="tiny muted" style={{ fontWeight: 700, letterSpacing: '.1em' }}>PENTARCH SYSTEMS SOLUTIONS</p><h1 style={{ fontSize: 28, fontWeight: 800 }}>ComplyScope admin</h1></div>
      <nav className="tabs" aria-label="Admin">{tabs.map(([k, l]) => <a key={k} href={'#' + k} aria-current={tab === k ? 'page' : undefined} onClick={(e) => { e.preventDefault(); setTab(k); }}>{l}</a>)}</nav>
      {msg ? <div className="banner small">{msg}</div> : null}
      {tab === 'overview' && <>
        <div className="kpis">{[['Users', c.users], ['Businesses', c.businesses], ['Filings logged', c.filings], ['Documents', c.documents], ['Revenue (KSh)', Number(c.revenue).toLocaleString('en-KE')]].map(([l, v]) => <div key={l as string} className="kpi stripe-ok"><span>{l}</span><b className="num">{v}</b></div>)}</div>
        <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 18 }}>Integrations</h3>
          <div className="kpis">
            <Status on={st.email} label="Email (SMTP)" pendingText="Set it up under Integrations & billing." />
            <Status on={st.cron} label="Reminder job" pendingText="Add the daily cron job." />
            <Status on={st.mpesa} label={'M-Pesa (' + st.mpesaEnv + ')'} pendingText="Add the Daraja keys under Integrations & billing when ready." />
            <Status on={st.sms} label="SMS (Africa's Talking)" pendingText="Add the Africa's Talking keys under Integrations & billing." />
            <Status on={st.manual} label="Manual payments" pendingText="Optional: add paybill or bank instructions." />
            <Status on={data.billing.mode === 'paid'} label={data.billing.mode === 'paid' ? 'Billing: paid plans' : 'Billing: free pilot'} pendingText="Everything is free until you switch on paid plans." />
            <Status on={data.settings.review_status === 'complete'} label="Professional review" pendingText="Mark complete once an accountant or lawyer has signed off the rules and terms." />
          </div>
          <p className="small muted">Last reminder run: {data.settings.last_cron_run}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn sm" type="button" onClick={() => act({ action: 'run-reminders' }, false)}>Run reminders now</button>
            <a className="btn sm" href="/api/admin/backup" download>Download data backup</a>
            <button className="btn sm" type="button" onClick={() => act({ action: 'setting', key: 'review_status', value: data.settings.review_status === 'complete' ? 'pending' : 'complete' })}>{data.settings.review_status === 'complete' ? 'Mark review as pending' : 'Mark professional review complete'}</button>
          </div>
        </div>
      </>}
      {tab === 'integrations' && <>
        <BillingSettings b={data.billing} act={act} />
        {['email', 'mpesa', 'manual', 'sms'].map((n) => <IntegrationCard key={n} name={n} def={data.intDefs[n]} cfg={data.intConfig[n]} act={act} />)}
        <p className="tiny muted">Secret keys are stored encrypted. If the database password ever changes, re-enter the secrets here.</p>
      </>}
      {tab === 'users' && <div className="panel panel-pad"><div className="tbl-wrap"><table className="t"><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Last sign-in</th><th>Businesses</th><th>Status</th><th><span className="sr">Actions</span></th></tr></thead><tbody>
        {data.users.map((u: any) => <tr key={u.id}><td><b>{u.name}</b>{u.is_admin ? <span className="stp s-info" style={{ marginLeft: 6 }}>Admin</span> : null}</td><td className="small">{u.email}<br /><span className="tiny muted">{u.phone || ''}</span></td><td className="small num">{String(u.created_at).slice(0, 10)}</td><td className="small num">{u.last_login_at ? String(u.last_login_at).slice(0, 16) : '–'}</td><td className="num">{u.biz}</td><td>{u.is_disabled ? <span className="stp s-overdue">Disabled</span> : u.email_verified_at ? <span className="stp s-ok">Active</span> : <span className="stp s-soon">Unconfirmed</span>}</td>
          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{u.id !== me ? <><button className="btn sm" type="button" onClick={() => act({ action: 'user-disable', userId: u.id, value: !u.is_disabled })}>{u.is_disabled ? 'Enable' : 'Disable'}</button> <button className="btn sm" type="button" onClick={() => act({ action: 'user-admin', userId: u.id, value: !u.is_admin })}>{u.is_admin ? 'Remove admin' : 'Make admin'}</button></> : null} {!u.email_verified_at ? <button className="btn sm" type="button" onClick={() => act({ action: 'user-verify', userId: u.id })}>Confirm email</button> : null}</td></tr>)}
      </tbody></table></div></div>}
      {tab === 'businesses' && <div className="panel panel-pad"><div className="tbl-wrap"><table className="t"><thead><tr><th>Business</th><th>Owner</th><th>Locations</th><th>Filings</th><th>Plan</th><th>Set plan</th></tr></thead><tbody>
        {data.businesses.map((b: any) => <tr key={b.id}><td><a href={'/app/b/' + b.id}><b>{b.name}</b></a><br /><span className="tiny muted">Created {String(b.created_at).slice(0, 10)}</span></td><td className="small">{b.owner}</td><td className="num">{b.locs}</td><td className="num">{b.filings}</td><td>{b.plan}{b.plan_expires_at ? <><br /><span className="tiny muted">until {String(b.plan_expires_at).slice(0, 10)}</span></> : null}</td>
          <td><select aria-label={'Plan for ' + b.name} defaultValue="" onChange={(e) => { if (e.target.value) act({ action: 'business-plan', businessId: b.id, plan: e.target.value, days: e.target.value === 'pilot' || e.target.value === 'enterprise' ? 0 : e.target.value === 'trial' ? 14 : 30 }); }}><option value="">Change…</option><option value="pilot">Pilot (free)</option><option value="trial">Trial, 14 days</option><option value="starter">Starter, 30 days</option><option value="growth">Growth, 30 days</option><option value="enterprise">Enterprise, no end date</option></select></td></tr>)}
      </tbody></table></div></div>}
      {tab === 'payments' && <div className="panel panel-pad">{data.payments.length ? <div className="tbl-wrap"><table className="t"><thead><tr><th>Date</th><th>Business</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Code / receipt</th><th><span className="sr">Actions</span></th></tr></thead><tbody>{data.payments.map((p: any) => <tr key={p.id}><td className="small num">{String(p.created_at).slice(0, 16)}</td><td><a href={'/app/b/' + p.business_id}>{p.name}</a></td><td>{p.plan} · {p.months} mo</td><td className="num">KSh {Number(p.amount).toLocaleString('en-KE')}</td><td className="small">{p.method === 'manual' ? 'Manual' : 'M-Pesa STK'}</td><td><span className={'stp ' + (p.status === 'paid' ? 's-ok' : p.status === 'review' ? 's-soon' : p.status === 'pending' ? 's-info' : 's-overdue')}>{p.status === 'review' ? 'To review' : p.status}</span></td><td className="small">{p.receipt || p.reference || '–'}</td>
        <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{p.status === 'review' ? <><button className="btn sm primary" type="button" onClick={() => act({ action: 'payment-review', paymentId: p.id, approve: true })}>Approve</button> <button className="btn sm" type="button" onClick={() => { if (confirm('Reject this payment? The plan will not be extended.')) act({ action: 'payment-review', paymentId: p.id, approve: false }); }}>Reject</button></> : p.status === 'paid' ? <a className="btn sm" href={'/app/b/' + p.business_id + '/receipt/' + p.id} target="_blank" rel="noopener">Receipt</a> : null}</td></tr>)}</tbody></table></div> : <p className="muted small">No payments yet.</p>}<p className="tiny muted" style={{ marginTop: 10 }}>Before approving a manual payment, check the code in your M-Pesa or bank statement.</p></div>}
      {tab === 'email' && <div className="panel panel-pad">{data.outbox.length ? <div className="tbl-wrap"><table className="t"><thead><tr><th>Date</th><th>To</th><th>Subject</th><th>Status</th></tr></thead><tbody>{data.outbox.map((m: any) => <tr key={m.id}><td className="small num">{String(m.created_at).slice(0, 16)}</td><td className="small">{m.to_email}</td><td className="small">{m.subject}</td><td>{m.status}{m.error ? <><br /><span className="tiny" style={{ color: 'var(--bad)' }}>{m.error}</span></> : null}</td></tr>)}</tbody></table></div> : <p className="muted small">No emails yet.</p>}</div>}
      {tab === 'activity' && <div className="panel panel-pad"><div className="tbl-wrap"><table className="t"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead><tbody>{data.auditLog.map((a: any, i: number) => <tr key={i}><td className="small num">{String(a.created_at).slice(0, 16)}</td><td className="small">{a.email || '–'}</td><td className="small">{a.action}</td><td className="tiny muted">{a.detail}</td></tr>)}</tbody></table></div></div>}
    </div></div>
  );
}
