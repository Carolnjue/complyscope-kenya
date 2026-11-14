import 'server-only';
import nodemailer from 'nodemailer';
import { exec, one, q } from './db';

export function appUrl() { return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, ''); }

// ---------- Integration status (each one stays "pending" until its settings exist) ----------
export function integrationStatus() {
  const e = process.env;
  return {
    email: !!(e.SMTP_HOST && e.SMTP_USER && e.SMTP_PASS),
    mpesa: !!(e.MPESA_CONSUMER_KEY && e.MPESA_CONSUMER_SECRET && e.MPESA_SHORTCODE && e.MPESA_PASSKEY),
    mpesaEnv: e.MPESA_ENV === 'production' ? 'production' : 'sandbox',
    sms: !!(e.AT_USERNAME && e.AT_API_KEY),
    cron: !!e.CRON_SECRET,
  };
}

export async function getSetting(k: string, fallback = ''): Promise<string> {
  const r = await one<{ v: string }>('SELECT v FROM settings WHERE k = ?', [k]);
  return r ? r.v : fallback;
}
export async function setSetting(k: string, v: string) {
  await exec('INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [k, v]);
}

// ---------- Email ----------
let transport: nodemailer.Transporter | null = null;
function mailer() {
  if (!integrationStatus().email) return null;
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
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
  const t = mailer();
  if (!t) return false;
  try {
    await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, html });
    await exec('UPDATE email_outbox SET status = "sent", sent_at = NOW() WHERE id = ?', [r.insertId]);
    return true;
  } catch (e: any) {
    await exec('UPDATE email_outbox SET status = "failed", error = ? WHERE id = ?', [String(e?.message || e).slice(0, 250), r.insertId]);
    return false;
  }
}

/** Retries queued and failed emails (called by the cron job). */
export async function flushOutbox(limit = 50) {
  const t = mailer();
  if (!t) return 0;
  const rows = await q<any>('SELECT * FROM email_outbox WHERE status IN ("queued","failed") AND created_at > (NOW() - INTERVAL 3 DAY) ORDER BY id LIMIT ?', [limit]);
  let n = 0;
  for (const m of rows) {
    try { await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to: m.to_email, subject: m.subject, html: m.html }); await exec('UPDATE email_outbox SET status="sent", sent_at=NOW(), error=NULL WHERE id=?', [m.id]); n++; }
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
  const st = integrationStatus();
  const to = normPhone(phone);
  if (!st.sms || !to) return false;
  const body = new URLSearchParams({ username: process.env.AT_USERNAME!, to: '+' + to, message });
  if (process.env.AT_SENDER_ID) body.set('from', process.env.AT_SENDER_ID);
  const host = process.env.AT_USERNAME === 'sandbox' ? 'https://api.sandbox.africastalking.com' : 'https://api.africastalking.com';
  try {
    const r = await fetch(host + '/version1/messaging', { method: 'POST', headers: { apiKey: process.env.AT_API_KEY!, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    return r.ok;
  } catch { return false; }
}
