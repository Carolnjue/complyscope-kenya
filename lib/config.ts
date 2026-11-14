import 'server-only';
import crypto from 'crypto';
import { one, exec } from './db';

/* Integration settings live in the database so an admin can add keys and switch each service on or off
   from the admin console, without touching the server. Secret fields are encrypted (AES-256-GCM).
   Environment variables still work as a fallback, so existing setups keep running. */

export type FieldDef = { key: string; label: string; secret?: boolean; type?: 'text' | 'number' | 'select' | 'textarea'; options?: [string, string][]; hint?: string; placeholder?: string };
export type IntegrationName = 'email' | 'mpesa' | 'sms' | 'manual';

export const INTEGRATIONS: Record<IntegrationName, { title: string; blurb: string; required: string[]; fields: FieldDef[] }> = {
  email: {
    title: 'Email (SMTP)', blurb: 'Sends sign-up confirmations, password resets, team invites and deadline reminders. Use any mailbox, for example one created in DirectAdmin.',
    required: ['host', 'port', 'user', 'pass'],
    fields: [
      { key: 'host', label: 'SMTP server', placeholder: 'mail.example.co.ke' },
      { key: 'port', label: 'Port', type: 'number', placeholder: '465', hint: '465 (SSL) or 587 (STARTTLS)' },
      { key: 'user', label: 'Username', placeholder: 'noreply@example.co.ke' },
      { key: 'pass', label: 'Password', secret: true },
      { key: 'from', label: 'Send as', placeholder: 'ComplyScope Kenya <noreply@example.co.ke>', hint: 'Optional. Defaults to the username.' },
    ],
  },
  mpesa: {
    title: 'M-Pesa (Daraja STK push)', blurb: 'Customers pay their plan by entering their M-Pesa PIN on their phone. Get the keys from developer.safaricom.co.ke after Safaricom approves your paybill or till for Lipa na M-Pesa Online.',
    required: ['shortcode', 'consumerKey', 'consumerSecret', 'passkey'],
    fields: [
      { key: 'env', label: 'Environment', type: 'select', options: [['sandbox', 'Sandbox (testing)'], ['production', 'Production (live money)']] },
      { key: 'type', label: 'Account type', type: 'select', options: [['paybill', 'Paybill'], ['till', 'Buy Goods (till)']] },
      { key: 'shortcode', label: 'Business shortcode', placeholder: '174379', hint: 'Paybill number, or the store number for a till' },
      { key: 'till', label: 'Till number', hint: 'Only for Buy Goods, if different from the shortcode' },
      { key: 'consumerKey', label: 'Consumer key', secret: true },
      { key: 'consumerSecret', label: 'Consumer secret', secret: true },
      { key: 'passkey', label: 'Lipa na M-Pesa passkey', secret: true },
    ],
  },
  sms: {
    title: "SMS (Africa's Talking)", blurb: 'Adds SMS deadline reminders for people who give a mobile number. Create an account at africastalking.com and buy SMS credit.',
    required: ['username', 'apiKey'],
    fields: [
      { key: 'username', label: 'Username', placeholder: 'sandbox', hint: 'Use "sandbox" to test without sending real SMS' },
      { key: 'apiKey', label: 'API key', secret: true },
      { key: 'senderId', label: 'Sender ID', hint: 'Optional. Must be approved by Africa\'s Talking' },
    ],
  },
  manual: {
    title: 'Manual payments', blurb: 'Lets customers pay by M-Pesa paybill, till or bank transfer and submit the transaction code. An admin confirms it and the plan is activated. Works without Daraja.',
    required: ['instructions'],
    fields: [
      { key: 'instructions', label: 'Payment instructions shown to customers', type: 'textarea', placeholder: 'Pay via M-Pesa Paybill 123456, account: your business name. Then enter the M-Pesa code below.' },
    ],
  },
};

type Stored = Record<string, string> & { enabled?: string };

function cryptoKey() { return crypto.createHash('sha256').update('complyscope:' + (process.env.CONFIG_KEY || process.env.DATABASE_URL || 'local')).digest(); }
function enc(v: string) {
  const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', cryptoKey(), iv);
  const ct = Buffer.concat([c.update(v, 'utf8'), c.final()]);
  return 'enc:' + Buffer.concat([iv, c.getAuthTag(), ct]).toString('base64');
}
function dec(v: string) {
  if (!v || !v.startsWith('enc:')) return v || '';
  try {
    const b = Buffer.from(v.slice(4), 'base64'), d = crypto.createDecipheriv('aes-256-gcm', cryptoKey(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8');
  } catch { return ''; }
}

function envFallback(name: IntegrationName): Stored {
  const e = process.env;
  if (name === 'email' && e.SMTP_HOST) return { enabled: '1', host: e.SMTP_HOST || '', port: e.SMTP_PORT || '465', user: e.SMTP_USER || '', pass: e.SMTP_PASS || '', from: e.MAIL_FROM || '' };
  if (name === 'mpesa' && e.MPESA_CONSUMER_KEY) return { enabled: '1', env: e.MPESA_ENV || 'sandbox', type: e.MPESA_TYPE || 'paybill', shortcode: e.MPESA_SHORTCODE || '', till: e.MPESA_TILL || '', consumerKey: e.MPESA_CONSUMER_KEY || '', consumerSecret: e.MPESA_CONSUMER_SECRET || '', passkey: e.MPESA_PASSKEY || '' };
  if (name === 'sms' && e.AT_USERNAME) return { enabled: '1', username: e.AT_USERNAME || '', apiKey: e.AT_API_KEY || '', senderId: e.AT_SENDER_ID || '' };
  return {};
}

let cache: { at: number; data: Record<IntegrationName, Stored> } | null = null;

/** Full decrypted settings for every integration (server use only). */
export async function loadConfig(): Promise<Record<IntegrationName, Stored>> {
  if (cache && Date.now() - cache.at < 15000) return cache.data;
  const out = {} as Record<IntegrationName, Stored>;
  for (const name of Object.keys(INTEGRATIONS) as IntegrationName[]) {
    const row = await one<{ v: string }>('SELECT v FROM settings WHERE k = ?', ['int_' + name]);
    let s: Stored = {};
    if (row) { try { s = JSON.parse(row.v); } catch { s = {}; } }
    else s = envFallback(name);
    const d: Stored = {};
    for (const [k, v] of Object.entries(s)) d[k] = INTEGRATIONS[name].fields.some((f) => f.key === k && f.secret) ? dec(String(v)) : String(v ?? '');
    out[name] = d;
  }
  cache = { at: Date.now(), data: out };
  return out;
}
export function clearConfigCache() { cache = null; }

export function isComplete(name: IntegrationName, s: Stored) { return INTEGRATIONS[name].required.every((k) => String(s[k] || '').trim()); }
export async function integration(name: IntegrationName): Promise<Record<string, string> & { on: boolean }> { const c = (await loadConfig())[name]; return { ...c, on: c.enabled === '1' && isComplete(name, c) } as any; }

/** What the admin console shows: plain fields, and only whether each secret is saved. */
export async function publicConfig() {
  const c = await loadConfig();
  const out: any = {};
  for (const name of Object.keys(INTEGRATIONS) as IntegrationName[]) {
    const s = c[name], v: any = {};
    for (const f of INTEGRATIONS[name].fields) v[f.key] = f.secret ? (s[f.key] ? '__saved__' : '') : (s[f.key] || '');
    out[name] = { values: v, enabled: s.enabled === '1', complete: isComplete(name, s), on: s.enabled === '1' && isComplete(name, s) };
  }
  return out;
}

/** Saves an integration. Empty secret fields keep the stored value. */
export async function saveIntegration(name: IntegrationName, values: Record<string, any>, enabled: boolean) {
  const cur = (await loadConfig())[name];
  const s: Stored = { enabled: enabled ? '1' : '0' };
  for (const f of INTEGRATIONS[name].fields) {
    let v = String(values?.[f.key] ?? '').trim().slice(0, f.type === 'textarea' ? 1000 : 300);
    if (f.secret && (!v || v === '__saved__')) v = cur[f.key] || '';
    if (f.type === 'select' && f.options && !f.options.some((o) => o[0] === v)) v = f.options[0][0];
    s[f.key] = f.secret && v ? enc(v) : v;
  }
  await exec('INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', ['int_' + name, JSON.stringify(s)]);
  clearConfigCache();
}
