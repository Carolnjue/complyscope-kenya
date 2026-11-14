'use client';
import { useState } from 'react';
import { api } from '@/components/Form';

function Status({ on, label, pendingText }: { on: boolean; label: string; pendingText: string }) {
  return <div className="kpi" style={{ ['--stripe' as any]: on ? 'var(--good)' : 'var(--warn)' }}><span>{label}</span><b style={{ fontSize: 16, color: on ? 'var(--good)' : '#a15c07' }}>{on ? 'Active' : 'Pending'}</b>{on ? null : <p className="tiny muted" style={{ marginTop: 4 }}>{pendingText}</p>}</div>;
}

export default function AdminConsole({ me, data }: any) {
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('overview');
  async function act(payload: any, reload = true) { setMsg('Working…'); const j = await api('/api/admin', 'POST', payload); setMsg(j.ok ? (j.result ? 'Done: ' + JSON.stringify(j.result) : 'Saved.') : j.error); if (j.ok && reload) setTimeout(() => window.location.reload(), 600); }
  const st = data.integrations, c = data.counts;
  const tabs = [['overview', 'Overview'], ['users', 'Users'], ['businesses', 'Businesses'], ['payments', 'Payments'], ['email', 'Email outbox'], ['activity', 'Activity']];
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
            <Status on={st.email} label="Email (SMTP)" pendingText="Add SMTP_HOST, SMTP_USER and SMTP_PASS to the app settings." />
            <Status on={st.cron} label="Reminder job" pendingText="Add CRON_SECRET and the daily cron job." />
            <Status on={st.mpesa} label={'M-Pesa (' + st.mpesaEnv + ')'} pendingText="Add the Daraja keys when ready. Accounts stay on the free pilot." />
            <Status on={st.sms} label="SMS (Africa's Talking)" pendingText="Add AT_USERNAME and AT_API_KEY when ready." />
            <Status on={data.settings.review_status === 'complete'} label="Professional review" pendingText="Mark complete once an accountant or lawyer has signed off the rules and terms." />
          </div>
          <p className="small muted">Last reminder run: {data.settings.last_cron_run}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn sm" type="button" onClick={() => act({ action: 'run-reminders' }, false)}>Run reminders now</button>
            <button className="btn sm" type="button" onClick={() => act({ action: 'test-email' }, false)}>Send me a test email</button>
            <button className="btn sm" type="button" onClick={() => act({ action: 'setting', key: 'review_status', value: data.settings.review_status === 'complete' ? 'pending' : 'complete' })}>{data.settings.review_status === 'complete' ? 'Mark review as pending' : 'Mark professional review complete'}</button>
          </div>
        </div>
      </>}
      {tab === 'users' && <div className="panel panel-pad"><div className="tbl-wrap"><table className="t"><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Last sign-in</th><th>Businesses</th><th>Status</th><th><span className="sr">Actions</span></th></tr></thead><tbody>
        {data.users.map((u: any) => <tr key={u.id}><td><b>{u.name}</b>{u.is_admin ? <span className="stp s-info" style={{ marginLeft: 6 }}>Admin</span> : null}</td><td className="small">{u.email}<br /><span className="tiny muted">{u.phone || ''}</span></td><td className="small num">{String(u.created_at).slice(0, 10)}</td><td className="small num">{u.last_login_at ? String(u.last_login_at).slice(0, 16) : '–'}</td><td className="num">{u.biz}</td><td>{u.is_disabled ? <span className="stp s-overdue">Disabled</span> : u.email_verified_at ? <span className="stp s-ok">Active</span> : <span className="stp s-soon">Unconfirmed</span>}</td>
          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{u.id !== me ? <><button className="btn sm" type="button" onClick={() => act({ action: 'user-disable', userId: u.id, value: !u.is_disabled })}>{u.is_disabled ? 'Enable' : 'Disable'}</button> <button className="btn sm" type="button" onClick={() => act({ action: 'user-admin', userId: u.id, value: !u.is_admin })}>{u.is_admin ? 'Remove admin' : 'Make admin'}</button></> : null} {!u.email_verified_at ? <button className="btn sm" type="button" onClick={() => act({ action: 'user-verify', userId: u.id })}>Confirm email</button> : null}</td></tr>)}
      </tbody></table></div></div>}
      {tab === 'businesses' && <div className="panel panel-pad"><div className="tbl-wrap"><table className="t"><thead><tr><th>Business</th><th>Owner</th><th>Locations</th><th>Filings</th><th>Plan</th><th>Set plan</th></tr></thead><tbody>
        {data.businesses.map((b: any) => <tr key={b.id}><td><a href={'/app/b/' + b.id}><b>{b.name}</b></a><br /><span className="tiny muted">Created {String(b.created_at).slice(0, 10)}</span></td><td className="small">{b.owner}</td><td className="num">{b.locs}</td><td className="num">{b.filings}</td><td>{b.plan}{b.plan_expires_at ? <><br /><span className="tiny muted">until {String(b.plan_expires_at).slice(0, 10)}</span></> : null}</td>
          <td><select aria-label={'Plan for ' + b.name} defaultValue="" onChange={(e) => { if (e.target.value) act({ action: 'business-plan', businessId: b.id, plan: e.target.value, days: e.target.value === 'pilot' ? 0 : 30 }); }}><option value="">Change…</option><option value="pilot">Pilot (free)</option><option value="starter">Starter, 30 days</option><option value="growth">Growth, 30 days</option><option value="enterprise">Enterprise, 30 days</option></select></td></tr>)}
      </tbody></table></div></div>}
      {tab === 'payments' && <div className="panel panel-pad">{data.payments.length ? <div className="tbl-wrap"><table className="t"><thead><tr><th>Date</th><th>Business</th><th>Plan</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead><tbody>{data.payments.map((p: any) => <tr key={p.id}><td className="small num">{String(p.created_at).slice(0, 16)}</td><td>{p.name}</td><td>{p.plan}</td><td className="num">KSh {Number(p.amount).toLocaleString('en-KE')}</td><td>{p.status}</td><td className="small">{p.receipt || '–'}</td></tr>)}</tbody></table></div> : <p className="muted small">No payments yet. M-Pesa is {st.mpesa ? 'active' : 'pending'}.</p>}</div>}
      {tab === 'email' && <div className="panel panel-pad">{data.outbox.length ? <div className="tbl-wrap"><table className="t"><thead><tr><th>Date</th><th>To</th><th>Subject</th><th>Status</th></tr></thead><tbody>{data.outbox.map((m: any) => <tr key={m.id}><td className="small num">{String(m.created_at).slice(0, 16)}</td><td className="small">{m.to_email}</td><td className="small">{m.subject}</td><td>{m.status}{m.error ? <><br /><span className="tiny" style={{ color: 'var(--bad)' }}>{m.error}</span></> : null}</td></tr>)}</tbody></table></div> : <p className="muted small">No emails yet.</p>}</div>}
      {tab === 'activity' && <div className="panel panel-pad"><div className="tbl-wrap"><table className="t"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead><tbody>{data.auditLog.map((a: any, i: number) => <tr key={i}><td className="small num">{String(a.created_at).slice(0, 16)}</td><td className="small">{a.email || '–'}</td><td className="small">{a.action}</td><td className="tiny muted">{a.detail}</td></tr>)}</tbody></table></div></div>}
    </div></div>
  );
}
