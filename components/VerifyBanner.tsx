'use client';
import { useState } from 'react';
import { api } from './Form';
export default function VerifyBanner() {
  const [msg, setMsg] = useState('');
  return <div className="banner warn"><div style={{ flex: 1 }} className="small"><b>Confirm your email.</b> We sent a link to your inbox. Reminders go to confirmed emails only. {msg}</div><button className="btn sm" type="button" onClick={async () => { const j = await api('/api/auth/resend'); setMsg(j.ok ? 'A new link is on its way.' : j.error); }}>Send again</button></div>;
}
