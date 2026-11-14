'use client';
import { useState } from 'react';
import { api, Field, useSubmit } from '@/components/Form';

export default function AccountForms({ user, emailOn, smsOn }: any) {
  const a = useSubmit(); const p = useSubmit();
  const [saved, setSaved] = useState(''); const [pw, setPw] = useState('');
  async function saveAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaved('');
    const f = new FormData(e.currentTarget);
    const j = await a.run(() => api('/api/account', 'POST', { name: f.get('name'), phone: f.get('phone'), remindEmail: f.get('remindEmail') === 'on', remindSms: f.get('remindSms') === 'on' }));
    if (j && j.ok) setSaved('Saved.');
  }
  async function savePw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setPw('');
    const form = e.currentTarget; const f = new FormData(form);
    if (f.get('password') !== f.get('confirm')) { p.setError('The two new passwords do not match.'); return; }
    const j = await p.run(() => api('/api/account/password', 'POST', { current: f.get('current'), password: f.get('password') }));
    if (j && j.ok) { setPw('Password changed. Other devices have been signed out.'); form.reset(); }
  }
  async function logout() { await api('/api/auth/logout'); window.location.href = '/'; }
  return (
    <div className="ws"><div className="wrap app-main" style={{ maxWidth: 820 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 12 }}><h1 style={{ fontSize: 28, fontWeight: 800 }}>My account</h1><button className="btn" type="button" onClick={logout}>Sign out</button></div>
      <form className="panel panel-pad" onSubmit={saveAccount} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ fontSize: 18 }}>Details and reminders</h3>
        <div className="fgrid">
          <Field label="Full name" id="name" name="name" defaultValue={user.name} required />
          <label className="f" htmlFor="email">Email address<small>{user.verified ? 'Confirmed' : 'Not yet confirmed'}</small><input id="email" value={user.email} readOnly /></label>
          <Field label="Mobile number" hint="For SMS reminders" id="phone" name="phone" type="tel" defaultValue={user.phone} placeholder="0712 345 678" />
        </div>
        <div className="checks">
          <label className="check" htmlFor="remindEmail"><input type="checkbox" id="remindEmail" name="remindEmail" defaultChecked={user.remindEmail} /><span>Email reminders 14, 7 and 1 days before each deadline{emailOn ? '' : <><br /><span className="tiny muted">Email sending is being switched on; reminders start then.</span></>}</span></label>
          <label className="check" htmlFor="remindSms"><input type="checkbox" id="remindSms" name="remindSms" defaultChecked={user.remindSms} /><span>SMS reminders{smsOn ? '' : <><br /><span className="tiny muted">SMS is coming soon.</span></>}</span></label>
        </div>
        {a.error ? <p className="err" role="alert">{a.error}</p> : null}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><button className="btn primary" type="submit" disabled={a.busy}>Save</button><span className="small muted">{saved}</span></div>
      </form>
      <form className="panel panel-pad" onSubmit={savePw} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ fontSize: 18 }}>Change password</h3>
        <div className="fgrid">
          <Field label="Current password" id="current" name="current" type="password" autoComplete="current-password" />
          <span />
          <Field label="New password" hint="At least 8 characters, with a number" id="password" name="password" type="password" autoComplete="new-password" />
          <Field label="Repeat new password" id="confirm" name="confirm" type="password" autoComplete="new-password" />
        </div>
        {p.error ? <p className="err" role="alert">{p.error}</p> : null}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><button className="btn primary" type="submit" disabled={p.busy}>Change password</button><span className="small muted">{pw}</span></div>
      </form>
    </div></div>
  );
}
