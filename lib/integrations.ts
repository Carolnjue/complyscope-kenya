import 'server-only';
import nodemailer from 'nodemailer';
import { exec, one, q } from './db';
import { integration } from './config';

export function escHtml(v: any) { return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]); }
export function appUrl() { return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, ''); }

// ---------- Integration status (each one stays "pending" until it is configured and switched on in the admin console) ----------
export async function integrationStatus() {
  const [email, mpesa, sms, manual] = await Promise.all([integration('email'), integration('mpesa'), integration('sms'), integration('manual')]);
  return { email: email.on, mpesa: mpesa.on, mpesaEnv: mpesa.env === 'production' ? 'production' : 'sandbox', sms: sms.on, manual: manual.on, manualInstructions: manual.on ? manual.instructions : '', cron: true };
}

export async function getSetting(k: string, fallback = ''): Promise<string> {
  const r = await one<{ v: string }>('SELECT v FROM settings WHERE k = ?', [k]);
  return r ? r.v : fallback;
}
export async function setSetting(k: string, v: string) {
  await exec('INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [k, v]);
}

// ---------- Email ----------
let transport: { sig: string; t: nodemailer.Transporter; from: string } | null = null;
async function mailer() {
  const c = await integration('email');
  if (!c.on) return null;
  const sig = [c.host, c.port, c.user, c.pass].join('|');
  if (!transport || transport.sig !== sig) {
    const port = Number(c.port || 465);
    transport = { sig, from: c.from || c.user, t: nodemailer.createTransport({ host: c.host, port, secure: port === 465, auth: { user: c.user, pass: c.pass }, connectionTimeout: 15000 }) };
  }
  return transport;
}

export function emailLayout(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#f6fbf9;font-family:'Work Sans',Arial,sans-serif;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px">
    <div style="font-weight:800;font-size:18px;margin-bottom:18px"><span style="display:inline-block;width:28px;height:28px;border-radius:8px;background:#0d9488;vertical-align:middle;margin-right:8px"></span>ComplyScope <span style="font-size:10px;color:#0d9488;letter-spacing:.1em">KENYA</span></div>
    <div style="background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:14px;padding:24px">
      <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>${body}
    </div>
    <p style="font-size:12px;color:#64748b;margin-top:16px">ComplyScope Kenya by Pentarch Systems Solutions. Tracking and reminders only; not legal, tax or accounting advice.</p>
  </div></body></html>`;
}
export function button(href: string, label: string) {
  return `<p style="margin:20px 0"><a href="${href}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">${label}</a></p><p style="font-size:12px;color:#64748b;word-break:break-all">Or open this link: ${href}</p>`;
}

/** Queues an email and sends it right away when SMTP is configured. Returns true when sent. */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const r = await exec('INSERT INTO email_outbox (to_email, subject, html, status) VALUES (?,?,?,?)', [to, subject, html, 'queued']);
  const m = await mailer();
  if (!m) return false;
  try {
    await m.t.sendMail({ from: m.from, to, subject, html });
    await exec('UPDATE email_outbox SET status = "sent", sent_at = NOW() WHERE id = ?', [r.insertId]);
    return true;
  } catch (e: any) {
    await exec('UPDATE email_outbox SET status = "failed", error = ? WHERE id = ?', [String(e?.message || e).slice(0, 250), r.insertId]);
    return false;
  }
}

/** Retries queued and failed emails (called by the cron job). */
export async function flushOutbox(limit = 50) {
  const mm = await mailer();
  if (!mm) return 0;
  const rows = await q<any>('SELECT * FROM email_outbox WHERE status IN ("queued","failed") AND created_at > (NOW() - INTERVAL 3 DAY) ORDER BY id LIMIT ?', [limit]);
  let n = 0;
  for (const m of rows) {
    try { await mm.t.sendMail({ from: mm.from, to: m.to_email, subject: m.subject, html: m.html }); await exec('UPDATE email_outbox SET status="sent", sent_at=NOW(), error=NULL WHERE id=?', [m.id]); n++; }
    catch (e: any) { await exec('UPDATE email_outbox SET status="failed", error=? WHERE id=?', [String(e?.message || e).slice(0, 250), m.id]); }
  }
  return n;
}

// ---------- SMS (Africa's Talking) ----------
export function normPhone(p: string | null | undefined): string | null {
  if (!p) return null;
  let s = String(p).replace(/[^0-9+]/g, '');
  if (s.startsWith('+')) s = s.slice(1);
  if (/^0[17]\d{8}$/.test(s)) s = '254' + s.slice(1);
  if (/^[17]\d{8}$/.test(s)) s = '254' + s;
  return /^254[17]\d{8}$/.test(s) ? s : null;
}
export async function sendSms(phone: string, message: string): Promise<boolean> {
  const c = await integration('sms');
  const to = normPhone(phone);
  if (!c.on || !to) return false;
  const body = new URLSearchParams({ username: c.username, to: '+' + to, message });
  if (c.senderId) body.set('from', c.senderId);
  const host = c.username === 'sandbox' ? 'https://api.sandbox.africastalking.com' : 'https://api.africastalking.com';
  try {
    const r = await fetch(host + '/version1/messaging', { method: 'POST', headers: { apiKey: c.apiKey, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const j: any = await r.json().catch(() => ({}));
    const rec = j?.SMSMessageData?.Recipients?.[0];
    return r.ok && (!rec || /success|sent/i.test(rec.status || ''));
  } catch { return false; }
}

/** Checks a configuration by actually talking to the service. Returns a short human message. */
export async function testIntegration(name: 'email' | 'mpesa' | 'sms', to: { email: string; phone?: string | null }): Promise<{ ok: boolean; message: string }> {
  if (name === 'email') {
    const m = await mailer(); if (!m) return { ok: false, message: 'Email is not switched on, or a required field is empty.' };
    try { await m.t.verify(); } catch (e: any) { return { ok: false, message: 'Could not log in to the mail server: ' + String(e?.message || e).slice(0, 160) }; }
    const sent = await sendEmail(to.email, 'ComplyScope test email', emailLayout('Email is working', '<p>This test confirms that ComplyScope can send email from your server.</p>'));
    return sent ? { ok: true, message: 'Test email sent to ' + to.email + '.' } : { ok: false, message: 'Logged in, but sending failed. See the email outbox for the error.' };
  }
  if (name === 'mpesa') {
    const { mpesaToken } = await import('./mpesa');
    try { await mpesaToken(); return { ok: true, message: 'Safaricom accepted the consumer key and secret.' }; }
    catch (e: any) { return { ok: false, message: String(e?.message || e).slice(0, 200) }; }
  }
  if (!to.phone) return { ok: false, message: 'Add a mobile number to your account first, then test again.' };
  const ok = await sendSms(to.phone, 'ComplyScope test: SMS reminders are working.');
  return ok ? { ok: true, message: 'Test SMS sent to ' + to.phone + '.' } : { ok: false, message: "Africa's Talking did not accept the message. Check the username, API key, sender ID and credit." };
}
